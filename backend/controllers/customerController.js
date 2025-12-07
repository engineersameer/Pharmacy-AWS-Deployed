const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Order = require('../models/Order');

// --- Customer Profile Controllers ---
const getProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, age, gender, phone, address, city, password } = req.body;
    const customerId = req.user.id;
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    if (phone && phone !== customer.phone) {
      const phoneExists = await Customer.findOne({ phone });
      if (phoneExists && String(phoneExists.id) !== String(customerId)) {
        return res.status(400).json({ success: false, message: 'Phone number is already in use' });
      }
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (age) updateData.age = age;
    if (gender) updateData.gender = gender;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (password) updateData.password = password;
    
    const updatedCustomer = await Customer.findByIdAndUpdate(customerId, updateData, { new: true });
    res.json({ success: true, message: 'Profile updated successfully', data: updatedCustomer });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error updating profile' });
  }
};

// --- Order Controllers ---
// Ensure the uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'prescriptions');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `prescription-${Date.now()}${ext}`;
    cb(null, filename);
  }
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, PDF are allowed.'));
  }
};
const upload = multer({ storage, fileFilter });

const createOrder = async (req, res, next) => {
  try {
    const { receiverName, phone, address } = req.body;
    const userId = req.user.id;
    if (!receiverName || !phone || !address) {
      return res.status(400).json({ success: false, message: 'receiverName, phone, and address are required' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Prescription file is required' });
    }
    const newOrder = await Order.create({
      receiverName,
      phone,
      address,
      filePath: `/uploads/prescriptions/${req.file.filename}`,
      status: 'pending',
      userId
    });
    res.status(201).json({ success: true, message: 'Order placed successfully and is pending review', data: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    next(error);
  }
};

const getCustomerOrders = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view your own orders' });
    }
    const orders = await Order.find({ userId, sort: '-createdAt' });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { receiverName, phone, address } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const userId = typeof order.userId === 'object' ? order.userId.id || order.userId._id : order.userId;
    if (userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only update your own orders' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending orders can be updated' });
    }
    const updateData = {};
    if (receiverName) updateData.receiverName = receiverName;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
    res.json({ success: true, message: 'Order updated successfully', data: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const userId = typeof order.userId === 'object' ? order.userId.id || order.userId._id : order.userId;
    if (userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only delete your own orders' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending orders can be deleted' });
    }
    const filePath = path.join(__dirname, '..', order.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await Order.deleteOne({ _id: orderId });
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    next(error);
  }
};

module.exports = {
  // Customer
  getProfile,
  updateProfile,
  // Order
  upload,
  createOrder,
  getCustomerOrders,
  updateOrder,
  deleteOrder
};
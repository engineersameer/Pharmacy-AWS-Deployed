// AdminController.js
const Order = require('../models/Order');
const Customer = require('../models/Customer');

// Get all orders (for admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ sort: '-createdAt' });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
};

// Update order status (for admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
  }
};

module.exports = {
  adminHome: (req, res) => {
    res.json({ message: 'Admin Home - implement logic here.' });
  },
  getAllOrders,
  updateOrderStatus,

  // --- Customers (Users) Admin APIs ---
  // Get all customers (including admins), omit password field
  getAllUsers: async (req, res) => {
    try {
      const users = await Customer.find({}, '-password');
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
    }
  },

  // Delete a customer by id
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Customer.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
    }
  }
};
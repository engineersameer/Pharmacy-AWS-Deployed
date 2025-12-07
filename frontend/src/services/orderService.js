import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://3.238.129.215:5001/api';

// Update baseURL to match new backend route
const orderApi = axios.create({
  baseURL: `${API_URL}/customers/order`,
});

orderApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const placeOrder = async (formData) => {
  try {
    // POST /api/customers/order
    const response = await orderApi.post('/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to place order'
    );
  }
};

// Get all orders for a customer
export const getCustomerOrders = async (userId) => {
  try {
    // GET /api/customers/order/customer/:userId
    const response = await orderApi.get(`/customer/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch orders'
    );
  }
};

// Update a pending order
export const updateOrder = async (orderId, orderData) => {
  try {
    // PUT /api/customers/order/:orderId
    const response = await orderApi.put(`/${orderId}`, orderData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update order'
    );
  }
};

// Delete a pending order
export const deleteOrder = async (orderId) => {
  try {
    // DELETE /api/customers/order/:orderId
    const response = await orderApi.delete(`/${orderId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to delete order'
    );
  }
}; 
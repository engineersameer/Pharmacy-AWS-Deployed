import axios from 'axios';
import { API_CONFIG } from '../constants/config';

// Use centralized API config
const API_URL = API_CONFIG.BASE_URL;

// Update baseURL to match new backend route
const orderApi = axios.create({
  baseURL: `${API_URL}/customers/order`,
  timeout: API_CONFIG.TIMEOUT,
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
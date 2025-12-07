import axios from 'axios';

// API URL - Use environment variable or default to EC2 instance
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/auth` 
  : 'http://3.238.129.215:5001/api/auth';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout
  timeout: 10000,
});

// Add a test function
export const testBackendConnection = async () => {
  try {
    console.log('%c🔍 Testing backend connection...', 'background: #3498db; color: white; padding: 2px;');
    const response = await api.get('/test');
    console.log('%c✅ Backend is reachable:', 'background: #2ecc71; color: white; padding: 2px;', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('%c❌ Backend connection failed:', 'background: #e74c3c; color: white; padding: 2px;', {
      message: error.message,
      code: error.code,
      response: error.response?.data
    });
    return { 
      success: false, 
      error: error.message,
      details: {
        code: error.code,
        response: error.response?.data
      }
    };
  }
};

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`%c🚀 [${requestId}] Making API request:`, 'background: #3498db; color: white; padding: 2px;', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    // Add request ID to headers for tracking
    config.headers['X-Request-ID'] = requestId;
    return config;
  },
  (error) => {
    console.error('%c❌ API Request Error:', 'background: #e74c3c; color: white; padding: 2px;', {
      message: error.message,
      code: error.code,
      config: error.config
    });
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    }
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    const requestId = response.config.headers['X-Request-ID'];
    console.log(`%c✅ [${requestId}] API Response:`, 'background: #2ecc71; color: white; padding: 2px;', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    const requestId = error.config?.headers['X-Request-ID'];
    console.error(`%c❌ [${requestId}] API Response Error:`, 'background: #e74c3c; color: white; padding: 2px;', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });

    // Log network errors in detail
    if (!error.response) {
      console.error('%c🌐 Network Error Details:', 'background: #e67e22; color: white; padding: 2px;', {
        message: error.message,
        code: error.code,
        config: error.config
      });
    }

    // Handle specific error cases
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Cannot connect to the server. Please check if the backend is running.');
    }

    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    }

    // Handle specific HTTP status codes
    switch (error.response?.status) {
      case 400:
        throw new Error(error.response.data.message || 'Invalid request. Please check your input.');
      case 401:
        throw new Error('Unauthorized. Please log in again.');
      case 403:
        throw new Error('Access denied. You do not have permission to perform this action.');
      case 404:
        throw new Error('Resource not found. Please try again later.');
      case 500:
        throw new Error('Server error. Please try again later.');
      default:
        throw error;
    }
  }
);

// Sign up service
export const signup = async (userData) => {
  try {
    console.log('🔍 Validating signup data:', userData);
    
    // Validate required fields before making request
    const requiredFields = ['name', 'age', 'gender', 'phone', 'address', 'city', 'password'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Test API connectivity first
    try {
      console.log('🔄 Testing API connectivity...');
      await api.get('/test');
      console.log('✅ API connectivity test passed');
    } catch (testError) {
      console.error('❌ API connectivity test failed:', testError);
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    }

    console.log('📡 Making signup request...');
    const response = await api.post('/signup', userData);
    console.log('✅ Signup response received:', response.data);
    
    if (!response.data.success) {
      console.error('❌ Signup failed:', response.data.message);
      throw new Error(response.data.message || 'Signup failed');
    }
    
    if (response.data.success && response.data.data?.token) {
      console.log('🔑 Storing auth token...');
      // Store token in localStorage
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      console.log('✅ Auth token stored');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Signup error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });

    // Enhanced error handling
    if (!error.response) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }

    // Handle specific error cases
    if (error.response.status === 409) {
      throw new Error('A user with this phone number already exists.');
    }

    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'An unexpected error occurred. Please try again.'
    );
  }
};

// Sign in service
export const signin = async (credentials) => {
  try {
    console.log('Attempting signin with:', credentials);
    const response = await api.post('/signin', credentials);
    console.log('Signin response:', response.data);

    if (response.data.success && response.data.data) {
      const userData = {
        ...response.data.data,
        role: response.data.data.role || 'customer' // default to customer if not specified
      };

      // Store token in localStorage
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
    }

    return response.data;
  } catch (error) {
    console.error('Signin error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

// Get current user profile
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Logout service
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}; 
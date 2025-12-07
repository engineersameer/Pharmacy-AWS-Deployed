import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { updateOrder, deleteOrder } from '../../services/orderService';

const PrescriptionViewer = ({ filePath, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Get base URL from environment or use EC2 URL
  const baseUrl = import.meta.env.VITE_API_URL || 'http://3.238.129.215:5001';
  const fileUrl = `${baseUrl}${filePath}`;
  const isPDF = filePath.toLowerCase().endsWith('.pdf');

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium">Prescription</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          )}
          {error && (
            <div className="p-4 text-center text-red-600 dark:text-red-400">
              Failed to load prescription. Please try again later.
            </div>
          )}
          {isPDF ? (
            <iframe
              src={fileUrl}
              className="w-full h-[70vh]"
              onLoad={handleLoad}
              onError={handleError}
            />
          ) : (
            <img
              src={fileUrl}
              alt="Prescription"
              className="max-w-full h-auto max-h-[70vh] mx-auto"
              onLoad={handleLoad}
              onError={handleError}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const statusColors = {
  pending: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-800 dark:text-yellow-200',
    border: 'border-yellow-200 dark:border-yellow-800'
  },
  processing: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-800'
  },
  completed: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-200 dark:border-green-800'
  }
};

const statusIcons = {
  pending: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  processing: (
    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  completed: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
};

function OrderCard({ order, onUpdate, onDelete }) {
  const { isDarkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    receiverName: order.receiverName,
    phone: order.phone,
    address: order.address
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showPrescription, setShowPrescription] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateOrder(order._id, formData);
      onUpdate(response.data);
      setIsEditing(false);
      setError('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }
    try {
      await deleteOrder(order._id);
      onDelete(order._id);
    } catch (error) {
      setError(error.message);
      setIsDeleting(false);
    }
  };

  return (
    <div className={`
      rounded-lg border p-6 transition-all duration-300 transform hover:scale-[1.02]
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      ${statusColors[order.status].border}
    `}>
      {error && (
        <div className="mb-4 p-2 rounded bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className={`p-2 rounded-full ${statusColors[order.status].bg}`}>
            {statusIcons[order.status]}
          </span>
          <span className={`font-medium ${statusColors[order.status].text}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        {order.status === 'pending' && (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className={`p-2 rounded-lg ${
                isDeleting 
                  ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Receiver Name</label>
            <input
              type="text"
              name="receiverName"
              value={formData.receiverName}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Receiver Name</label>
            <p className="font-medium">{order.receiverName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Phone</label>
            <p className="font-medium">{order.phone}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Address</label>
            <p className="font-medium">{order.address}</p>
          </div>
          <div>
            <button
              onClick={() => setShowPrescription(true)}
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>View Prescription</span>
            </button>
          </div>
        </div>
      )}
      
      {showPrescription && (
        <PrescriptionViewer
          filePath={order.filePath}
          onClose={() => setShowPrescription(false)}
        />
      )}

      {isDeleting && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200 mb-3">Are you sure you want to delete this order?</p>
          <div className="flex space-x-2">
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setIsDeleting(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderCard; 
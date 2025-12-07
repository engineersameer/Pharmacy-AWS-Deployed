import React, { useState } from 'react';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const AdminOrderCard = ({ order, onStatusChange }) => {
  const [status, setStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setUpdating(true);
    setError('');
    try {
      await onStatusChange(order._id, newStatus);
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="rounded-lg border p-6 mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="font-bold">Order ID:</span> {order._id}
        </div>
        <div>
          <span className="font-bold">Status:</span>{' '}
          <select
            value={status}
            onChange={handleStatusChange}
            disabled={updating}
            className="ml-2 p-1 border rounded"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mb-2">
        <span className="font-bold">Receiver:</span> {order.receiverName}<br />
        <span className="font-bold">Phone:</span> {order.phone}<br />
        <span className="font-bold">Address:</span> {order.address}
      </div>
      <div className="mb-2">
        <span className="font-bold">Created At:</span> {new Date(order.createdAt).toLocaleString()}
      </div>
      <div>
        <span className="font-bold">Prescription:</span>{' '}
        {order.filePath ? (
          <a href={`${import.meta.env.VITE_API_URL || 'http://3.238.129.215:5001'}${order.filePath}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">View</a>
        ) : 'N/A'}
      </div>
      {error && <div className="mt-2 text-red-600">{error}</div>}
    </div>
  );
};

export default AdminOrderCard;
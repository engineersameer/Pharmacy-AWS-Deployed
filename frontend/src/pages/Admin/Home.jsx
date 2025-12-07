import React, { useEffect, useMemo, useState } from 'react';
import { admin, API_URL } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

const STATUS_LABELS = {
  pending: 'Pending',
  processing: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
};

const ORDER_GROUPS = [
  { key: 'pending', title: 'Pending' },
  { key: 'processing', title: 'In Progress' },
  { key: 'completed', title: 'Completed' },
];

const AdminHome = () => {
  const { isDarkMode } = useTheme();
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const FILE_BASE_URL = useMemo(() => {
    const base = (API_URL || '').replace(/\/+$/, '');
    if (!base) return import.meta.env.VITE_API_URL || 'http://3.238.129.215:5001';
    if (base.endsWith('/api')) return base.slice(0, -4);
    return base;
  }, []);

  const fetchOrders = async (options = { silent: false }) => {
    const { silent } = options;
    try {
      if (!silent) setLoading(true);
      const res = await admin.orders.getAll();
      setOrders(res.data?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const groupedOrders = useMemo(() => {
    return ORDER_GROUPS.reduce((acc, { key }) => {
      acc[key] = orders.filter((order) => order.status === key);
      return acc;
    }, {});
  }, [orders]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId || !newStatus) return;
    try {
      setUpdatingId(orderId);
      const res = await admin.orders.updateStatus(orderId, newStatus);
      const updated = res.data?.data;
      if (updated) {
        setOrders((prev) => prev.map((order) => (order._id === orderId ? updated : order)));
      }
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return [
          { value: 'processing', label: 'Mark as In Progress' },
          { value: 'completed', label: 'Mark as Completed' },
        ];
      case 'processing':
        return [
          { value: 'pending', label: 'Move back to Pending' },
          { value: 'completed', label: 'Mark as Completed' },
        ];
      case 'completed':
        return [
          { value: 'pending', label: 'Reopen as Pending' },
          { value: 'processing', label: 'Move to In Progress' },
        ];
      default:
        return [];
    }
  };

  const renderOrderCard = (order) => {
    const isExpanded = expandedId === order._id;
    const user = order.userId || {};

    return (
      <div
        key={order._id}
        className={`rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-lg ${
          isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <button
          onClick={() => toggleExpand(order._id)}
          className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-2xl"
        >
          <div className="space-y-2 pr-6">
            <div className="flex items-center gap-3">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {order.receiverName}
              </h3>
              <span
                className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}
              >
                {STATUS_LABELS[order.status]}
              </span>
            </div>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{order.phone}</p>
            <p className="text-xs uppercase tracking-wide text-primary-500">
              Order ID: <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>{order._id}</span>
            </p>
          </div>
          <div className="mt-1 shrink-0 text-primary-500">
            <svg
              className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isExpanded && (
          <div className="px-6 pb-6 space-y-4 text-sm leading-6">
            <div
              className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}
            >
              <h4 className="text-sm font-semibold mb-3">Order Details</h4>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Receiver</p>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{order.receiverName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Phone</p>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{order.phone}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Address</p>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{order.address}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Placed on</p>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                {order.updatedAt && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Updated on</p>
                    <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {new Date(order.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}
            >
              <h4 className="text-sm font-semibold mb-3">Customer Profile</h4>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Name</p>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{user.name ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Phone</p>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{user.phone ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">City</p>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{user.city ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Role</p>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{user.IsAdmin ? 'Admin' : 'Customer'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {order.filePath && (
                  <a
                    href={`${FILE_BASE_URL}/${order.filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1 0V9h-1m2 3h3l-4 4-4-4h3m-7 6h18" />
                    </svg>
                    View Prescription
                  </a>
                )}
              </div>

              <fieldset className="space-y-2">
                <legend className="text-xs uppercase tracking-wide text-gray-400">Update status</legend>
                <div className="flex flex-wrap gap-2">
                  {statusOptions(order.status).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(order._id, option.value)}
                      disabled={updatingId === order._id}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isDarkMode
                          ? 'bg-primary-600/10 text-primary-300 hover:bg-primary-600/20 focus:ring-primary-400 focus:ring-offset-gray-900'
                          : 'bg-primary-50 text-primary-700 hover:bg-primary-100 focus:ring-primary-500 focus:ring-offset-white'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="flex items-center space-x-2 text-primary-600">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span className="text-lg font-medium">Loading orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className={`px-6 py-4 rounded-xl border text-sm ${isDarkMode ? 'bg-red-900/60 text-red-100 border-red-700' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 pb-16 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Orders Overview</h1>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>Track and manage all customer orders</p>
        </div>
        <button
          onClick={async () => {
            setRefreshing(true);
            await fetchOrders({ silent: true });
            setRefreshing(false);
          }}
          disabled={refreshing}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isDarkMode
              ? 'bg-gray-800 text-white hover:bg-gray-700 focus:ring-primary-400 focus:ring-offset-gray-900'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-primary-500 focus:ring-offset-white'
          }`}
        >
          <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m15.356 2H20V6m-2 14a8.001 8.001 0 01-15.356-2H4v5"
            />
          </svg>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {ORDER_GROUPS.map(({ key, title }) => (
          <section
            key={key}
            aria-labelledby={`section-${key}`}
            className={`rounded-3xl border p-6 space-y-5 ${
              isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 id={`section-${key}`} className="text-lg font-semibold">
                {title}
              </h2>
              <span className="text-sm text-gray-500">({groupedOrders[key]?.length ?? 0})</span>
            </div>

            <div className="space-y-4">
              {groupedOrders[key] && groupedOrders[key].length > 0 ? (
                groupedOrders[key].map((order) => renderOrderCard(order))
              ) : (
                <div
                  className={`text-sm text-center py-10 rounded-2xl border-dashed border ${
                    isDarkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-500'
                  }`}
                >
                  No {title.toLowerCase()} orders yet.
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default AdminHome;
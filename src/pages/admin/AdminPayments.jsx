import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminDashboard } from '../../services/adminAPI';
import '../../styles/admin.css';

const AdminPayments = () => {
  const navigate = useNavigate();
  const { adminToken } = useAdminAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken, navigate]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await adminDashboard.getPayments({ token: adminToken });
      setPayments(response.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-2">View and manage payment transactions</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {loading ? (
            <div className="text-center text-gray-500">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="text-center text-gray-500">No payments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Transaction ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id} className="border-b border-gray-200">
                      <td className="px-6 py-4 text-sm">{payment.transactionId}</td>
                      <td className="px-6 py-4 text-sm">₹{payment.amount}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded text-xs font-medium ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{new Date(payment.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;

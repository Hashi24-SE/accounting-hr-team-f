import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import SectionCard from '../../components/ui/SectionCard';

const LeaveDashboard = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Leave Request Form State
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch leave types
      const typesRes = await api.get('/leaves/types');
      setLeaveTypes(typesRes.data.data || []);

      // Note: In a real app, you need a GET /leaves/requests endpoint to fetch pending requests.
      // Since we didn't explicitly build it in Phase 4, we will mock it or handle it gracefully if missing.
      try {
        const reqRes = await api.get('/leaves/requests?status=Pending');
        setPendingRequests(reqRes.data.data || []);
      } catch (err) {
        console.warn('GET /leaves/requests endpoint might not be fully implemented yet.', err);
        setPendingRequests([]); 
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitLeaveRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves/requests', formData);
      alert('Leave request submitted successfully!');
      setFormData({ employee_id: '', leave_type_id: '', start_date: '', end_date: '', reason: '' });
      fetchInitialData(); // Refresh table
    } catch (error) {
      console.error('Failed to submit request:', error);
      alert('Error submitting leave request. Check inputs.');
    }
  };

  const updateRequestStatus = async (id, status) => {
    try {
      await api.patch(`/leaves/requests/${id}/status`, { status });
      alert(`Request ${status} successfully!`);
      fetchInitialData(); // Refresh table
    } catch (error) {
      console.error(`Failed to ${status} request:`, error);
      alert(`Error updating request status.`);
    }
  };

  if (loading) return <p className="text-gray-500 p-6">Loading Leave Dashboard...</p>;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leave Management Dashboard</h1>
        <p className="text-sm text-gray-500">Apply for leaves and manage pending HR approvals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Apply Leave Form */}
        <div className="lg:col-span-1">
          <SectionCard title="Apply for Leave">
            <form onSubmit={submitLeaveRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                <input
                  type="text"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. uuid-format"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                <select
                  name="leave_type_id"
                  value={formData.leave_type_id}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
                >
                  <option value="" disabled>Select Type</option>
                  {leaveTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name} ({type.is_paid ? 'Paid' : 'Unpaid'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows="2"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              >
                Submit Request
              </button>
            </form>
          </SectionCard>
        </div>

        {/* Right Column: Pending Requests Table */}
        <div className="lg:col-span-2">
          <SectionCard title="Pending Leave Approvals (HR View)">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {req.employee_id.substring(0,8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(req.start_date).toLocaleDateString()} to {new Date(req.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                        {req.reason || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                        <button
                          onClick={() => updateRequestStatus(req.id, 'Approved')}
                          className="text-green-600 hover:text-green-900 bg-green-100 px-3 py-1 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateRequestStatus(req.id, 'Rejected')}
                          className="text-red-600 hover:text-red-900 bg-red-100 px-3 py-1 rounded"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pendingRequests.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        No pending leave requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default LeaveDashboard;
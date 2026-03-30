import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import SectionCard from '../ui/SectionCard';

const EmployeeAllowanceManager = ({ employeeId }) => {
  const [assignedAllowances, setAssignedAllowances] = useState([]);
  const [availableAllowances, setAvailableAllowances] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    allowance_type_id: '',
    amount: '',
    effective_date: ''
  });

  useEffect(() => {
    if (employeeId) {
      fetchData();
    }
  }, [employeeId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // FIX 1: Changed URL to use the allowance routes correctly
      const assignedRes = await api.get(`/api/allowances/employee/${employeeId}`);
      setAssignedAllowances(assignedRes.data.data || []);

      // Fetch all available allowances
      const typesRes = await api.get('/api/allowances');
      const activeTypes = (typesRes.data.data || []).filter(a => a.is_active);
      setAvailableAllowances(activeTypes);
    } catch (error) {
      console.error('Error fetching allowance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // FIX 2: Changed URL to use the allowance routes correctly
      await api.post(`/api/allowances/employee/${employeeId}`, {
        allowance_type_id: formData.allowance_type_id,
        amount: parseFloat(formData.amount),
        effective_date: formData.effective_date
      });
      
      setFormData({ allowance_type_id: '', amount: '', effective_date: '' });
      fetchData();
      alert('Allowance assigned successfully!');
    } catch (error) {
      console.error('Failed to assign allowance:', error);
      alert('Error assigning allowance. Please check inputs.');
    }
  };

  if (loading) return <p className="text-gray-500">Loading allowances...</p>;

  return (
    <div className="space-y-6 mt-6">
      <SectionCard title="Assign New Allowance">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Allowance Type</label>
              <select
                name="allowance_type_id"
                value={formData.allowance_type_id}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
              >
                <option value="" disabled>Select Allowance</option>
                {availableAllowances.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Amount (LKR)</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="0.00"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Effective Date</label>
              <input
                type="date"
                name="effective_date"
                value={formData.effective_date}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>

            <div className="md:col-span-1">
              <button
                type="submit"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Assign
              </button>
            </div>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Active Allowances">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allowance Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (LKR)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effective Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignedAllowances.map((assigned) => (
                <tr key={assigned.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {assigned.allowance_types?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Number(assigned.amount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(assigned.effective_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${assigned.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {assigned.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {assignedAllowances.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No allowances assigned to this employee.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default EmployeeAllowanceManager;
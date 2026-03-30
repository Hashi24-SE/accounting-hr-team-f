import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/layout/PageHeader';
import SectionCard from '../../components/ui/SectionCard';

const AllowanceSettings = () => {
  const [allowances, setAllowances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    is_taxable: false,
    is_epf_etf: false,
  });

  useEffect(() => {
    fetchAllowances();
  }, []);

  const fetchAllowances = async () => {
    try {
      const response = await api.get('/allowances');
      setAllowances(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch allowances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/allowances', formData);
      setFormData({ name: '', is_taxable: false, is_epf_etf: false });
      fetchAllowances();
    } catch (error) {
      console.error('Failed to create allowance:', error);
      alert('Error creating allowance');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.patch(`/allowances/${id}`, { is_active: !currentStatus });
      fetchAllowances();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Error updating status');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Allowance Configuration" description="Manage company allowance types and tax rules." />

      <SectionCard title="Create New Allowance">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">Allowance Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="e.g. Transport Allowance"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_taxable"
                  checked={formData.is_taxable}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Is Taxable (APIT)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_epf_etf"
                  checked={formData.is_epf_etf}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Subject to EPF/ETF</span>
              </label>
            </div>
            <div>
              <button
                type="submit"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Allowance
              </button>
            </div>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Allowance Types">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EPF/ETF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allowances.map((allowance) => (
                  <tr key={allowance.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{allowance.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{allowance.is_taxable ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{allowance.is_epf_etf ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${allowance.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {allowance.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleToggleActive(allowance.id, allowance.is_active)}
                        className={`${allowance.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {allowance.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {allowances.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No allowance types found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default AllowanceSettings;
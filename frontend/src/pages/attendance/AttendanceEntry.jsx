import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/layout/PageHeader';
import SectionCard from '../../components/ui/SectionCard';

const AttendanceEntry = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Default to current month and year
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchActiveEmployees();
  }, []);

  const fetchActiveEmployees = async () => {
    setLoading(true);
    try {
      // Fetch all employees (Developer 1's endpoint)
      const res = await api.get('/employees');
      const activeEmployees = (res.data.data || []).filter(emp => emp.status === 'Active');
      
      setEmployees(activeEmployees);

      // Initialize the grid with 0 values for each active employee
      const initialMap = {};
      activeEmployees.forEach(emp => {
        initialMap[emp.id] = { working_days: 0, ot_hours: 0, no_pay_days: 0 };
      });
      setAttendanceMap(initialMap);

    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGridChange = (empId, field, value) => {
    setAttendanceMap(prev => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        [field]: value === '' ? 0 : Number(value)
      }
    }));
  };

  const handleBulkSubmit = async () => {
    setSaving(true);
    try {
      // Format data as an array for the backend Bulk Upsert endpoint
      const payload = employees.map(emp => ({
        employee_id: emp.id,
        month: Number(month),
        year: Number(year),
        working_days: attendanceMap[emp.id].working_days,
        ot_hours: attendanceMap[emp.id].ot_hours,
        no_pay_days: attendanceMap[emp.id].no_pay_days
      }));

      await api.post('/attendance', payload);
      alert('Attendance records saved successfully!');
    } catch (error) {
      console.error('Failed to save attendance:', error);
      alert('Error saving attendance data. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-500 p-6">Loading Employee Grid...</p>;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Monthly Attendance Entry" 
        description="Fast data-entry grid for recording monthly working days, OT, and no-pay days." 
      />

      <SectionCard title="Filter & Setup">
        <div className="flex space-x-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title={`Attendance Grid - ${employees.length} Active Employees`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OT Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No Pay Days</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {emp.full_name} <br/>
                    <span className="text-xs text-gray-500">{emp.id.substring(0,8)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      max="31"
                      value={attendanceMap[emp.id]?.working_days || ''}
                      onChange={(e) => handleGridChange(emp.id, 'working_days', e.target.value)}
                      className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={attendanceMap[emp.id]?.ot_hours || ''}
                      onChange={(e) => handleGridChange(emp.id, 'ot_hours', e.target.value)}
                      className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      max="31"
                      value={attendanceMap[emp.id]?.no_pay_days || ''}
                      onChange={(e) => handleGridChange(emp.id, 'no_pay_days', e.target.value)}
                      className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No active employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleBulkSubmit}
            disabled={saving || employees.length === 0}
            className={`inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${saving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {saving ? 'Saving...' : 'Save All Attendance'}
          </button>
        </div>
      </SectionCard>
    </div>
  );
};

export default AttendanceEntry;
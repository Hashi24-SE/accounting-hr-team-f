const supabase = require('../config/supabase');

// 1. Get all allowance types
const getAllAllowances = async () => {
    const { data, error } = await supabase
        .from('allowance_types')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
};

// 2. Create a new allowance type
const createAllowance = async (allowanceData) => {
    const { data, error } = await supabase
        .from('allowance_types')
        .insert([allowanceData])
        .select();
    
    if (error) throw new Error(error.message);
    return data[0];
};

// 3. Toggle allowance active status
const toggleAllowanceStatus = async (id, isActive) => {
    const { data, error } = await supabase
        .from('allowance_types')
        .update({ is_active: isActive })
        .eq('id', id)
        .select();
    
    if (error) throw new Error(error.message);
    return data[0];
};

// 4. Assign an allowance to an employee
const assignAllowanceToEmployee = async (employeeId, allowanceData) => {
    const { data, error } = await supabase
        .from('employee_allowances')
        .insert([{ employee_id: employeeId, ...allowanceData }])
        .select();
    
    if (error) throw new Error(error.message);
    return data[0];
};

// 5. Get active allowances for a specific employee
const getEmployeeAllowances = async (employeeId) => {
    const { data, error } = await supabase
        .from('employee_allowances')
        .select('*, allowance_types(name, is_taxable, is_epf_etf)')
        .eq('employee_id', employeeId)
        .eq('is_active', true);
    
    if (error) throw new Error(error.message);
    return data;
};

module.exports = {
    getAllAllowances,
    createAllowance,
    toggleAllowanceStatus,
    assignAllowanceToEmployee,
    getEmployeeAllowances
};
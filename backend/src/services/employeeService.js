const supabase = require('../config/supabase');

/**
 * Register a new employee
 */
const registerEmployee = async (employeeData, basicSalary, hourlyOtRate) => {
  // 1. Check for duplicate NIC
  const { data: existingNIC, error: nicError } = await supabase
    .from('employees')
    .select('id')
    .eq('nic', employeeData.nic)
    .single();

  if (nicError && nicError.code !== 'PGRST116') {
    throw Object.assign(new Error('Failed to check NIC uniqueness'), { status: 500 });
  }

  if (existingNIC) {
    throw Object.assign(new Error('An employee with this NIC already exists'), {
      status: 409,
      code: 'DUPLICATE_NIC',
    });
  }

  // 3. Insert into employees table
  const { data: newEmployee, error: empError } = await supabase
    .from('employees')
    .insert([employeeData])
    .select()
    .single();

  if (empError) {
    throw Object.assign(new Error('Failed to register employee'), { status: 500 });
  }

  // 4. Insert into salary_revisions with effective_date = today, end_date = NULL
  const salaryRevisionData = {
    employee_id: newEmployee.id,
    basic_salary: basicSalary,
    hourly_ot_rate: hourlyOtRate,
    effective_date: new Date().toISOString().split('T')[0], // Today's date YYYY-MM-DD
  };

  const { error: salaryError } = await supabase
    .from('salary_revisions')
    .insert([salaryRevisionData]);

  if (salaryError) {
    throw Object.assign(new Error('Failed to initialize salary revision'), { status: 500 });
  }

  return newEmployee;
};

/**
 * List active employees with optional department/search filters
 */
const listEmployees = async (department, search) => {
  let query = supabase
    .from('employees')
    .select('*')
    .eq('status', 'Active');

  if (department) {
    query = query.eq('department', department);
  }

  if (search) {
    // Sanitize commas to prevent PostgREST syntax errors
    const sanitizedSearch = search.replace(/,/g, '');
    query = query.or(`full_name.ilike.%${sanitizedSearch}%,nic.ilike.%${sanitizedSearch}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw Object.assign(new Error('Failed to fetch employees list'), { status: 500 });
  }

  return data;
};

/**
 * Get full employee details by ID including salary history
 */
const getEmployeeById = async (id) => {
  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();

  if (empError) {
    if (empError.code === 'PGRST116') {
      throw Object.assign(new Error('Employee not found'), { status: 404, code: 'NOT_FOUND' });
    }
    throw Object.assign(new Error('Failed to fetch employee'), { status: 500 });
  }

  const { data: salaryRevisions, error: salaryError } = await supabase
    .from('salary_revisions')
    .select('*')
    .eq('employee_id', id)
    .order('effective_date', { ascending: false });

  if (salaryError) {
    throw Object.assign(new Error('Failed to fetch salary revisions'), { status: 500 });
  }

  employee.salary_revisions = salaryRevisions;

  return employee;
};

/**
 * Update employee details (NIC cannot be changed)
 */
const updateEmployee = async (id, updateData) => {
  // Prevent NIC from being updated
  delete updateData.nic;

  const validFields = ['designation', 'department', 'branch', 'bank_name', 'bank_branch', 'account_number'];
  const sanitizedData = {};
  for (const field of validFields) {
    if (updateData[field] !== undefined) {
      sanitizedData[field] = updateData[field];
    }
  }

  sanitizedData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('employees')
    .update(sanitizedData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
       throw Object.assign(new Error('Employee not found'), { status: 404, code: 'NOT_FOUND' });
    }
    throw Object.assign(new Error('Failed to update employee'), { status: 500 });
  }

  return data;
};

/**
 * Soft delete an employee by setting status to 'Inactive'
 */
const deactivateEmployee = async (id) => {
  const { data, error } = await supabase
    .from('employees')
    .update({ status: 'Inactive', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
       throw Object.assign(new Error('Employee not found'), { status: 404, code: 'NOT_FOUND' });
    }
    throw Object.assign(new Error('Failed to deactivate employee'), { status: 500 });
  }

  return data;
};

module.exports = {
  registerEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
};
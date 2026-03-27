const supabase = require('../config/supabase');
const { getDayBefore } = require('../utils/dateHelpers');

/**
 * Add a new salary revision for an employee
 */
const addSalaryRevision = async (employeeId, revisionData) => {
  // 1. Verify employee exists
  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('id')
    .eq('id', employeeId)
    .single();

  if (empError) {
    if (empError.code === 'PGRST116') {
      throw Object.assign(new Error('Employee not found'), { status: 404, code: 'NOT_FOUND' });
    }
    throw Object.assign(new Error('Failed to verify employee'), { status: 500 });
  }

  // 2. Find the current active salary revision for this employee (end_date IS NULL)
  const { data: currentRevision, error: fetchError } = await supabase
    .from('salary_revisions')
    .select('*')
    .eq('employee_id', employeeId)
    .is('end_date', null)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw Object.assign(new Error('Failed to fetch current salary revision'), { status: 500 });
  }

  // 3. Set end_date = effective_date - 1 day on the active record
  if (currentRevision) {
    const newEndDate = getDayBefore(revisionData.effective_date);

    const { error: updateError } = await supabase
      .from('salary_revisions')
      .update({ end_date: newEndDate })
      .eq('id', currentRevision.id);

    if (updateError) {
      throw Object.assign(new Error('Failed to close current salary revision'), { status: 500 });
    }
  }

  // 4. INSERT new salary_revisions record with end_date = NULL
  const newRevisionData = {
    employee_id: employeeId,
    basic_salary: revisionData.basic_salary,
    hourly_ot_rate: revisionData.hourly_ot_rate,
    effective_date: revisionData.effective_date,
    end_date: null,
  };

  const { data: newRevision, error: insertError } = await supabase
    .from('salary_revisions')
    .insert([newRevisionData])
    .select()
    .single();

  if (insertError) {
    throw Object.assign(new Error('Failed to add new salary revision'), { status: 500 });
  }

  return newRevision;
};

/**
 * Get full salary revision history for an employee
 */
const getSalaryHistory = async (employeeId) => {
  // Verify employee exists first
  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('id')
    .eq('id', employeeId)
    .single();

  if (empError) {
    if (empError.code === 'PGRST116') {
      throw Object.assign(new Error('Employee not found'), { status: 404, code: 'NOT_FOUND' });
    }
    throw Object.assign(new Error('Failed to verify employee'), { status: 500 });
  }

  const { data, error } = await supabase
    .from('salary_revisions')
    .select('*')
    .eq('employee_id', employeeId)
    .order('effective_date', { ascending: false });

  if (error) {
    throw Object.assign(new Error('Failed to fetch salary history'), { status: 500 });
  }

  return data;
};

module.exports = {
  addSalaryRevision,
  getSalaryHistory,
};
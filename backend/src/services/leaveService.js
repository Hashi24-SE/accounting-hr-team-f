const supabase = require('../config/supabase');

// 1. Get all leave types
const getLeaveTypes = async () => {
    const { data, error } = await supabase.from('leave_types').select('*');
    if (error) throw new Error(error.message);
    return data;
};

// 2. Allocate yearly leave balances for an employee
const allocateLeaveBalances = async (employeeId, balancesData) => {
    const records = balancesData.map(b => ({ employee_id: employeeId, ...b }));
    const { data, error } = await supabase
        .from('employee_leave_balances')
        .upsert(records, { onConflict: 'employee_id, leave_type_id, year' })
        .select();
        
    if (error) throw new Error(error.message);
    return data;
};

// 3. Submit a leave request
const submitLeaveRequest = async (requestData) => {
    const { data, error } = await supabase
        .from('leave_requests')
        .insert([requestData])
        .select();
        
    if (error) throw new Error(error.message);
    return data[0];
};

// 4. Approve / Reject Leave Request (Core Engine Logic)
const updateLeaveRequestStatus = async (requestId, status) => {
    // Fetch request details
    const { data: request, error: reqError } = await supabase
        .from('leave_requests')
        .select('*, leave_types(is_paid)')
        .eq('id', requestId)
        .single();

    if (reqError || !request) throw new Error("Leave request not found");
    if (request.status !== 'Pending') throw new Error("Only pending requests can be modified");

    // Calculate requested days
    const start = new Date(request.start_date);
    const end = new Date(request.end_date);
    const requestedDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (status === 'Approved') {
        const currentYear = start.getFullYear();
        const currentMonth = start.getMonth() + 1;

        if (request.leave_types.is_paid) {
            // Paid Leave: Check and deduct balance
            const { data: balance, error: balError } = await supabase
                .from('employee_leave_balances')
                .select('*')
                .eq('employee_id', request.employee_id)
                .eq('leave_type_id', request.leave_type_id)
                .eq('year', currentYear)
                .single();

            if (balError || !balance) throw new Error("Leave balance not found for this year");
            if (balance.remaining_days < requestedDays) throw new Error("Insufficient leave balance. Cannot approve.");

            const { error: updateBalError } = await supabase
                .from('employee_leave_balances')
                .update({ remaining_days: balance.remaining_days - requestedDays })
                .eq('id', balance.id);

            if (updateBalError) throw new Error(updateBalError.message);

        } else {
            // Unpaid Leave (No-Pay): Auto-update monthly_attendance
            const { data: attendance } = await supabase
                .from('monthly_attendance')
                .select('*')
                .eq('employee_id', request.employee_id)
                .eq('month', currentMonth)
                .eq('year', currentYear)
                .single();

            if (attendance) {
                await supabase.from('monthly_attendance')
                    .update({ no_pay_days: attendance.no_pay_days + requestedDays })
                    .eq('id', attendance.id);
            } else {
                await supabase.from('monthly_attendance')
                    .insert([{
                        employee_id: request.employee_id,
                        month: currentMonth,
                        year: currentYear,
                        no_pay_days: requestedDays
                    }]);
            }
        }
    }

    // Finally, update the request status
    const { data: updatedRequest, error: updateReqError } = await supabase
        .from('leave_requests')
        .update({ status })
        .eq('id', requestId)
        .select();

    if (updateReqError) throw new Error(updateReqError.message);
    return updatedRequest[0];
};

module.exports = {
    getLeaveTypes,
    allocateLeaveBalances,
    submitLeaveRequest,
    updateLeaveRequestStatus
};
const supabase = require('../config/supabase');

// 1. Submit Monthly Attendance (Supports Bulk Array Insertion)
const submitAttendance = async (attendanceRecords) => {
    // UNIQUE constraint (employee_id, month, year) නිසා onConflict අනිවාර්ය වේ.
    const { data, error } = await supabase
        .from('monthly_attendance')
        .upsert(attendanceRecords, { onConflict: 'employee_id, month, year' })
        .select();
    
    if (error) throw new Error(error.message);
    return data;
};

// 2. Core Engine: Calculate Gross Salary
const calculateGrossSalary = async (employeeId, month, year) => {
    // A. Fetch Basic Salary & OT Rate (Developer 1's table)
    const { data: salaryData, error: salaryError } = await supabase
        .from('salary_revisions')
        .select('basic_salary, hourly_ot_rate')
        .eq('employee_id', employeeId)
        .order('effective_date', { ascending: false })
        .limit(1)
        .single();

    if (salaryError || !salaryData) throw new Error("Salary details not found for the employee.");

    const basicSalary = Number(salaryData.basic_salary);
    const otRate = Number(salaryData.hourly_ot_rate || 0);

    // B. Fetch Active Allowances
    const { data: allowancesData, error: allowError } = await supabase
        .from('employee_allowances')
        .select('amount')
        .eq('employee_id', employeeId)
        .eq('is_active', true);

    if (allowError) throw new Error(allowError.message);

    const totalAllowances = allowancesData.reduce((sum, item) => sum + Number(item.amount), 0);
    const fixedGross = basicSalary + totalAllowances; // Base calculation

    // C. Fetch Monthly Attendance for Overtime & No-Pay
    const { data: attendanceData, error: attError } = await supabase
        .from('monthly_attendance')
        .select('working_days, no_pay_days, ot_hours')
        .eq('employee_id', employeeId)
        .eq('month', month)
        .eq('year', year)
        .single();

    let otPay = 0;
    let noPayDeduction = 0;

    if (attendanceData) {
        // Overtime Pay = ot_hours * hourly_ot_rate
        otPay = Number(attendanceData.ot_hours) * otRate;

        // No-Pay Penalty = (Fixed Gross / Working Days) * no_pay_days
        if (attendanceData.no_pay_days > 0 && attendanceData.working_days > 0) {
            const dailyRate = fixedGross / Number(attendanceData.working_days);
            noPayDeduction = dailyRate * Number(attendanceData.no_pay_days);
        }
    }

    // D. Final Gross Formula
    const finalGrossSalary = fixedGross + otPay - noPayDeduction;

    return {
        employee_id: employeeId,
        month,
        year,
        basic_salary: basicSalary,
        total_allowances: totalAllowances,
        ot_pay: otPay,
        no_pay_deduction: noPayDeduction,
        gross_salary: finalGrossSalary
    };
};

module.exports = {
    submitAttendance,
    calculateGrossSalary
};
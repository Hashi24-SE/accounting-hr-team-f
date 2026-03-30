module.exports = ({ employee, salary }) => ({
  title: 'Salary Revision',
  body: `Your basic salary has been revised to ${salary.basic_salary}.`,
  email: {
    subject: `Your Salary has been Revised`,
    html: `
      <div style="font-family:sans-serif;color:#333;max-width:560px">
        <div style="background:#059669;padding:24px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px">🌿 Salary Revision</h1>
        </div>
        <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
          <p>Hi <strong>${employee.full_name}</strong>,</p>
          <p>Your basic salary has been revised to <strong>${salary.basic_salary}</strong>, effective from <strong>${salary.effective_date}</strong>.</p>
        </div>
      </div>
    `,
  },
});
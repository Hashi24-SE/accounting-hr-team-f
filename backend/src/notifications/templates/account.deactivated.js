module.exports = ({ employee, actorName }) => ({
  title: 'Account Deactivated',
  body: `The account for ${employee.full_name} has been deactivated.`,
  email: {
    subject: `Account Deactivated: ${employee.full_name}`,
    html: `
      <div style="font-family:sans-serif;color:#333;max-width:560px">
        <div style="background:#dc2626;padding:24px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px">🚫 Account Deactivated</h1>
        </div>
        <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
          <p>Hi,</p>
          <p>The payroll account for <strong>${employee.full_name}</strong> has been deactivated by <strong>${actorName}</strong>.</p>
        </div>
      </div>
    `,
  },
});
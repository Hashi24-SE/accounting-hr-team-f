module.exports = ({ employee, actorName }) => ({
  title: 'New Employee Registered',
  body: `${employee.full_name} has been added to the system.`,
  email: {
    subject: `Welcome to Green Solutions Tech, ${employee.full_name}!`,
    html: `
      <div style="font-family:sans-serif;color:#333;max-width:560px">
        <div style="background:#059669;padding:24px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px">🌿 Welcome Aboard!</h1>
        </div>
        <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
          <p>Hi <strong>${employee.full_name}</strong>,</p>
          <p>Your payroll account has been created by <strong>${actorName}</strong>.</p>
          <p>You will receive your login details separately.</p>
        </div>
      </div>
    `,
  },
});
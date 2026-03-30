// 1. Load and validate environment variables
const env = require('./config/env');
const bcryptjs = require('bcryptjs');
const supabase = require('./config/supabase');

// Express App
const express = require('express');
const cors = require('cors');

// Swagger setup
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

// Additional swagger config for Bearer token auth globally
swaggerSpecs.components = {
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
};

// Initialize Listeners
require('./notifications/listeners');

// Routers
const authRoutes = require('./routes/authRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Missing existing routes mock setup
const earningsRoutes = require('./routes/earningsRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const statutoryRoutes = require('./routes/statutoryRoutes');
const taxRoutes = require('./routes/taxRoutes');

// Global error handler
const errorHandler = require('./middlewares/errorHandler');
const { error } = require('./utils/response');

const app = express();

// 3. Mount middleware: cors, express.json()
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// 4. Mount Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// 5. Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/organization', organizationRoutes);

// We mount salary routes onto employees to follow the structure /api/employees/:id/salary
app.use('/api/employees', employeeRoutes);
employeeRoutes.use('/:id/salary', salaryRoutes);

// Mount other developers' routes
app.use('/api/earnings', earningsRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/statutory', statutoryRoutes);
app.use('/api/tax', taxRoutes);

// Mount notifications routes
app.use('/api/notifications', notificationRoutes);

// 6. Mount 404 handler for unmatched routes
app.use((req, res, next) => {
  return error(res, 'ROUTE_NOT_FOUND', 'The requested resource was not found', 404, { path: req.originalUrl });
});

// 7. Mount global error handler (must be last middleware — 4 params)
app.use(errorHandler);

// Seed admin function
async function seedAdmin() {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('email', env.ADMIN_DEFAULT_EMAIL)
    .single();
    
  if (!data) {
    const hash = await bcryptjs.hash(env.ADMIN_DEFAULT_PASSWORD, 12);
    await supabase.from('users').insert({
      email: env.ADMIN_DEFAULT_EMAIL,
      password_hash: hash,
      role: 'Admin',
      active: true,
      email_verified: true
    });
    console.log('Default admin account created');
    console.warn('Change the default password after first login');
  }
}

// 8. Start server on PORT from env
const startServer = async () => {
  try {
    await seedAdmin();
    app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
      console.log(`Swagger docs: http://localhost:${env.PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
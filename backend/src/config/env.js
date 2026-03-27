require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ACCESS_EXPIRY: parseInt(process.env.JWT_ACCESS_EXPIRY, 10) || 86400000,
  JWT_REFRESH_EXPIRY: parseInt(process.env.JWT_REFRESH_EXPIRY, 10) || 604800000,
  ADMIN_DEFAULT_EMAIL: process.env.ADMIN_DEFAULT_EMAIL,
  ADMIN_DEFAULT_PASSWORD: process.env.ADMIN_DEFAULT_PASSWORD,
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: process.env.MAIL_PORT,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  MAIL_FROM: process.env.MAIL_FROM,
  APP_EMAIL_ENABLED: process.env.APP_EMAIL_ENABLED === 'true',
};

const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'JWT_SECRET',
  'ADMIN_DEFAULT_EMAIL',
  'ADMIN_DEFAULT_PASSWORD',
];

const missing = requiredVars.filter((v) => !env[v]);

if (missing.length > 0) {
  console.error(`FATAL ERROR: Missing required environment variables: ${missing.join(', ')}.`);
  console.error('Please configure your .env file. Exiting...');
  process.exit(1);
}

module.exports = env;
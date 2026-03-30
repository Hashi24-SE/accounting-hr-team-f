# Usage Guide

This document explains how to set up and run the Green Solutions Tech HR Payroll System.

## Prerequisites

- Node.js v20 LTS
- npm (Node Package Manager)
- A Supabase account and project (PostgreSQL 15+)

## Database Setup

1. Log in to your Supabase project.
2. Open the SQL Editor.
3. Manually execute the contents of the `database/schema.sql` file to initialize the tables, views, and initial data.
   > **Note:** The schema script must be run manually; it cannot be applied automatically via standard client API credentials.

## Backend (Node.js/Express)

The backend is a Node.js Express application. It does not have custom dev/test scripts configured.

### 1. Environment Variables

Create a `.env` file in the root of the backend directory (or export them in your shell) with the following parameters:

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://<your-supabase-url>.supabase.co
SUPABASE_ANON_KEY=<your-supabase-anon-key>
JWT_SECRET=<your-jwt-secret>
JWT_ACCESS_EXPIRY=86400000
JWT_REFRESH_EXPIRY=604800000
ADMIN_DEFAULT_EMAIL=admin@greensolutions.tech
ADMIN_DEFAULT_PASSWORD=Admin@1234
MAIL_HOST=<smtp-host>
MAIL_PORT=<smtp-port>
MAIL_USER=<smtp-user>
MAIL_PASS=<smtp-password>
MAIL_FROM=noreply@greensolutions.tech
APP_EMAIL_ENABLED=false
```

### 2. Start the Server

```bash
# Install dependencies
npm install

# Start the server directly
node src/index.js
```

The server will be available at `http://localhost:5000`.

## Frontend (React/Vite)

The frontend is built with React 18, Vite, Ant Design, and Tailwind CSS.

### 1. Environment Variables

Create a `.env` file in the `frontend` directory with the following variables:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
```

### 2. Start the Frontend Application

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Authentication / Testing

You can use the default administrator credentials created by the backend to log in to the frontend dashboard:

- **Email:** `admin@greensolutions.tech`
- **Password:** `Admin@1234`

## API Documentation

When the backend server is running, you can view the complete API specification and Swagger UI by visiting the base endpoint or consulting the `docs/api-spec.md` file.

## Architecture & System Flows

For deeper technical details on specific system flows, please consult the following architecture documents:

- [Authentication Flow (`docs/authentication-flow.md`)](./authentication-flow.md): Detailed explanation of JWT tokens, refresh rotation, and password reset procedures.
- [Notification System (`docs/notification-system.md`)](./notification-system.md): Explanation of the Server-Sent Events (SSE) implementation for real-time alerts.

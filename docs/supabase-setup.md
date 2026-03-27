## Step-by-step Supabase setup for the Payroll project

---

### Step 1 — Create your Supabase account and project

1. Go to **https://supabase.com** and sign up or log in
2. Click **"New project"**
3. Fill in:
   - **Organization** — create one if first time (e.g. `Green Solutions Tech`)
   - **Project name** — `payroll-management`
   - **Database password** — generate a strong one and **save it immediately** — you cannot retrieve it later
   - **Region** — pick the closest to Sri Lanka (Singapore `ap-southeast-1`)
4. Click **"Create new project"** — wait ~2 minutes for provisioning

---

### Step 2 — Get your credentials

Once the project is ready:

1. Go to **Project Settings** (gear icon, bottom left)
2. Click **"Data API"** (or "API" in older UI)
3. Copy these three values:

```
Project URL       →  https://xxxxxxxxxxxx.supabase.co
anon public key   →  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key  →  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Now go to **Project Settings → Database**
5. Scroll to **"Connection string"** → select **"JDBC"** tab
6. Copy the JDBC URL — it looks like:

```
jdbc:postgresql://db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

---

### Step 3 — Configure your `.env` file

In your project root, copy the example file:

```bash
cp .env.example .env
```

Open `.env` and fill in the values you just copied:

```env
# Supabase project
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Direct PostgreSQL connection for Spring Boot JPA
SUPABASE_DB_URL=jdbc:postgresql://db.xxxxxxxxxxxx.supabase.co:5432/postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-database-password-from-step-1

# Spring
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080

# Admin seeder
ADMIN_DEFAULT_EMAIL=admin@greensolutions.tech
ADMIN_DEFAULT_PASSWORD=Admin@1234
```

> **Never commit `.env`** — it is already in `.gitignore`

---

### Step 4 — Allow your IP (connection pooler settings)

Supabase blocks direct DB connections by default. You need to:

1. Go to **Project Settings → Database**
2. Scroll to **"Connection pooling"**
3. Make sure **"Connection pooling"** is **enabled**
4. Note the **pooler connection string** — use this instead if you get connection timeouts:

```env
# Use pooler URL instead of direct if you face timeouts
SUPABASE_DB_URL=jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Also add this to the end of your JDBC URL to avoid SSL issues:

```env
SUPABASE_DB_URL=jdbc:postgresql://db.xxxxxxxxxxxx.supabase.co:5432/postgres?sslmode=require
```

---

### Step 5 — Update `application.yml` to load from `.env`

Your `application.yml` already reads from environment variables. Make sure it matches exactly:

```yaml
spring:
  datasource:
    url: ${SUPABASE_DB_URL}
    username: ${SUPABASE_DB_USER}
    password: ${SUPABASE_DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 5        # keep low — Supabase free tier limits connections
      minimum-idle: 1
      connection-timeout: 30000
      idle-timeout: 600000

  jpa:
    hibernate:
      ddl-auto: validate           # Flyway manages schema — never use create or update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect

  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
```

> `ddl-auto: validate` is important — it checks your entities match the DB schema but never modifies it. Flyway handles all schema changes.

---

### Step 6 — Load `.env` into your IDE or terminal

**If running from IntelliJ IDEA:**
1. Open **Run → Edit Configurations**
2. Select your Spring Boot run config
3. Click **"Modify options"** → **"Environment variables"**
4. Add each variable from `.env`, or use the **EnvFile plugin** to load the file directly

**If running from terminal:**

```bash
# Option 1 — export manually
export SUPABASE_DB_URL=jdbc:postgresql://db.xxxx.supabase.co:5432/postgres?sslmode=require
export SUPABASE_DB_USER=postgres
export SUPABASE_DB_PASSWORD=yourpassword
./mvnw spring-boot:run

# Option 2 — use dotenv-maven-plugin (add to pom.xml)
# Then just run:
./mvnw spring-boot:run
```

Or add the `dotenv-java` approach — add to `pom.xml`:

```xml
<dependency>
    <groupId>io.github.cdimascio</groupId>
    <artifactId>dotenv-java</artifactId>
    <version>3.0.0</version>
</dependency>
```

Then in `PayrollApplication.java`:

```java
@SpringBootApplication
public class PayrollApplication {

    public static void main(String[] args) {
        // Load .env file before Spring context starts
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        dotenv.entries().forEach(e ->
            System.setProperty(e.getKey(), e.getValue()));

        SpringApplication.run(PayrollApplication.class, args);
    }
}
```

---

### Step 7 — Run the application and verify Flyway migrations

```bash
./mvnw spring-boot:run
```

On first startup you should see in the logs:

```
Flyway Community Edition ... by Redgate
Database: jdbc:postgresql://db.xxxx.supabase.co:5432/postgres (PostgreSQL ...)
Successfully validated 2 migrations
Creating Schema History table "public"."flyway_schema_history"
Current version of schema "public": << Empty Schema >>
Migrating schema "public" to version "1 - create employees"
Migrating schema "public" to version "2 - create salary components"
Successfully applied 2 migrations to schema "public"
```

---

### Step 8 — Verify tables were created in Supabase

1. Go to your Supabase project dashboard
2. Click **"Table Editor"** in the left sidebar
3. You should see these tables created by Flyway:

```
departments
employees
employee_bank_accounts
salary_component_definitions
employee_salary_components
salary_revisions
flyway_schema_history
```

4. Click **"departments"** — you should see the 5 seeded rows (HR, FIN, IT, OPS, MKT)

---

### Step 9 — Verify Swagger is working

Open your browser:

```
http://localhost:8080/swagger-ui.html
```

You should see all your endpoints listed under the **Employee** and **Salary** tags.

---

### Step 10 — Commit

```bash
git add .env.example application.yml pom.xml
git commit -m "New: configure Supabase PostgreSQL connection with Flyway migrations"
git push origin feature/your-name/employee-management
```

> Do not `git add .env` — only `.env.example` gets committed.

---

### Quick troubleshooting

| Error | Fix |
|---|---|
| `Connection refused` | Check SUPABASE_DB_URL — make sure it has `?sslmode=require` at the end |
| `password authentication failed` | Re-check SUPABASE_DB_PASSWORD — copy it again from Supabase dashboard |
| `Flyway checksum mismatch` | You edited a migration file after it ran — never edit V1 or V2 after first run, create V3 instead |
| `Too many connections` | Reduce `maximum-pool-size` to 3 in `application.yml` — free tier allows max 60 total |
| `SSL SYSCALL error` | Add `?sslmode=require&sslrootcert=system` to the JDBC URL |

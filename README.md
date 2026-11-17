# Employee Management System

A full-stack employee management system built with **Spring Boot** (backend) and **React** (frontend).

## Features

- **Authentication & Authorization** — JWT-based login with role-based access (Admin, HR, Employee)
- **Employee Management** — Add, edit, delete, search, and filter employees
- **Department Management** — Organize employees by department
- **Leave Management** — Apply for leave, approve/reject requests, track leave balance
- **Salary/Payroll** — Generate payslips, calculate salary components, download PDF payslips
- **Profile Self-Service** — Employees can view and update their own profile
- **Search & Filter** — Search employees by name, department, or designation

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Java 17, Spring Boot 3, Spring Security, JPA |
| Frontend | React 18, Vite, Axios, React Router |
| Database | PostgreSQL (production), H2 (development) |
| Auth     | JWT (JSON Web Tokens)               |
| PDF      | iText 8                             |

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- Maven 3.8+ (or use the included wrapper)

### Run Backend (Development Mode)

```bash
cd backend
./mvnw spring-boot:run
```

The backend starts on **http://localhost:8080** with an in-memory H2 database.

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:5173** and proxies API calls to the backend.

### Default Login

| Role  | Email           | Password  |
|-------|-----------------|-----------|
| Admin | admin@ems.com   | admin123  |

The admin account and 4 default departments (Engineering, HR, Finance, Marketing) are created automatically on startup.

## Deployment

### Backend — Render.com

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Set build command: `cd backend && ./mvnw clean package -DskipTests`
4. Set start command: `cd backend && java -jar target/*.jar --spring.profiles.active=prod`
5. Add environment variables:
   - `DATABASE_URL` — your PostgreSQL connection URL
   - `DATABASE_USERNAME` — database username
   - `DATABASE_PASSWORD` — database password
   - `JWT_SECRET` — a strong 256-bit secret key

### Database — Render PostgreSQL

1. Create a free **PostgreSQL** instance on Render
2. Copy the connection details to your backend environment variables

### Frontend — Vercel

1. Import your GitHub repository on Vercel
2. Set root directory to `frontend`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable:
   - `VITE_API_URL` — your Render backend URL (e.g., `https://your-backend.onrender.com`)

## API Endpoints

### Authentication
- `POST /api/auth/login` — Login

### Employees
- `GET /api/employees` — List all (Admin/HR)
- `GET /api/employees/{id}` — Get one
- `POST /api/employees` — Create (Admin/HR)
- `PUT /api/employees/{id}` — Update
- `DELETE /api/employees/{id}` — Delete (Admin/HR)
- `GET /api/employees/search?keyword=` — Search
- `GET /api/employees/department/{id}` — Filter by department
- `GET /api/employees/me` — Current user's profile

### Departments
- `GET /api/departments` — List all
- `POST /api/departments` — Create (Admin)
- `PUT /api/departments/{id}` — Update (Admin)
- `DELETE /api/departments/{id}` — Delete (Admin)

### Leave Management
- `POST /api/leaves` — Apply for leave
- `GET /api/leaves/my` — My leaves
- `GET /api/leaves` — All leaves (Admin/HR)
- `GET /api/leaves/pending` — Pending leaves (Admin/HR)
- `PUT /api/leaves/{id}/approve` — Approve (Admin/HR)
- `PUT /api/leaves/{id}/reject` — Reject (Admin/HR)
- `GET /api/leaves/balance` — My leave balance

### Payroll
- `POST /api/payroll/generate/{employeeId}?month=&year=` — Generate payslip (Admin/HR)
- `GET /api/payroll/employee/{employeeId}` — Employee payslips (Admin/HR)
- `GET /api/payroll/my` — My payslips
- `GET /api/payroll/download/{payslipId}` — Download PDF

## Project Structure

```
employee-management-system/
├── backend/
│   ├── src/main/java/com/ems/
│   │   ├── config/          # Security, JWT, CORS, DataInitializer
│   │   ├── controller/      # REST API controllers
│   │   ├── dto/             # Request/Response objects
│   │   ├── entity/          # JPA entity classes
│   │   ├── enums/           # Role, LeaveType, LeaveStatus
│   │   ├── exception/       # Custom exceptions & handler
│   │   ├── repository/      # JPA repositories
│   │   └── service/         # Business logic
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios config
│   │   ├── components/      # Sidebar, PrivateRoute
│   │   ├── context/         # AuthContext
│   │   └── pages/           # All page components
│   ├── package.json
│   └── vite.config.js
└── README.md
```

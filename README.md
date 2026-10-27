# StaffSync — Enterprise Human Resource Management System (HRMS)

StaffSync is a production-grade, full-stack Human Resource Management System built with a dark navy interface, real-time role-based access control (RBAC), and persistent data management via MongoDB (Mongoose) with an atomic persistent JSON fallback.

---

## 1. Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend**: Node.js, Express, TypeScript (`tsx` in dev, `esbuild` for production).
- **Database & Persistence**:
  - **Mongoose / MongoDB**: Official ODM and schemas (`User`, `Employee`, `Leave`, `Attendance`, `Announcement`, `Training`, `Kanban`).
  - **Unified Adapter**: Automatically connects to MongoDB when `MONGODB_URI` is provided; seamlessly falls back to atomic persistent JSON storage (`data/staffsync_db.json`) if running in standalone or disconnected environments.
- **Security & Cryptography**:
  - **Password Hashing**: `bcryptjs` with work factor 10.
  - **Session Tokens**: Cryptographically signed HMAC-SHA256 tokens with timestamp expiration (`exp`) and signature verification.
  - **Authentication Rate Limiting**: In-memory sliding window limiter preventing brute-force credential stuffing.
  - **RBAC**: Strict server-side route guards enforcing manager vs employee privilege boundaries.
  - **Data Isolation**: Confidential fields (such as salaries and password hashes) are never exposed to non-manager roles or client bundles.
- **AI Integration**: Optional server-side `@google/genai` integration for automated announcement drafting with graceful template fallback.

---

## 2. Core Functional Modules

### A. Employee Portal
- **Announcements**: Company-wide broadcasts and departmental news with pinned alerts.
- **Training & Development**: Scheduled skill cohorts with trainer names, curriculum descriptions, and target audiences.
- **Leaves**:
  - **Card A (Apply for Leave)**: Side-by-side date range picker, full-width reason input, start/end date validation (`endDate >= startDate`), and `Pending` status submission.
  - **Card B (My Leaves)**: Submission history sorted by newest first with visual status badges (Approved, Pending, Rejected) and manager review notes.
- **Attendance**:
  - Real-time status badge (Checked In, Checked Out, Absent).
  - Server-verified check-in and check-out timestamps with active shift duration calculation.
  - Constraint engine preventing duplicate check-ins or premature check-outs.
  - Complete personal attendance log history.
- **Profile**:
  - Employee contact card displaying department, role, title, and join date.
  - In-place editing for permissible fields (phone number and mailing address). Role, email, and salary remain server-protected.

### B. HR Manager Dashboard
- **Leave Applications**:
  - Real-time tabular queue of all employee requests.
  - One-click **Approve** (green) and **Reject** (red) actions with audit trail (decider ID, name, timestamp, and review notes).
  - Multi-status filter tabs (All, Pending, Approved, Rejected) and employee text search.
- **Employee Management**:
  - 3-column responsive employee onboarding form (Name, Email, Department, Position, Salary, Join Date, Phone, Address).
  - Full CRUD operations with unique email constraint and positive salary validation.
  - Confirmation modal for permanent employee deletion.
- **Announcements Management**:
  - Broadcast creation form supporting audience targeting (All Employees or specific departments).
  - Optional AI-assisted draft generator powered by Gemini.
  - List of live broadcasts with deletion capability.
- **Attendance Records**:
  - Organization-wide daily attendance logs.
  - Filtering by specific employee and date.
- **Training & Development**:
  - Workshop creation form (Title, Date, Trainer, Description, and Assigned Cohort).
  - Compact curriculum cards with Edit and Delete controls. Synchronizes directly with the Employee Portal.

### C. Workspace Navigation & Auxiliary Views
- **Operational Overview**: Real-time workforce metrics (Total Employees, Pending Leaves, Attendance Rate, and Active Training Programs).
- **HR Kanban Board**: 4-lane agile pipeline (Backlog, In Progress, Review, Completed) with priority tags, due dates, assignee chips, and lane navigation.

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env` or configure the variables in your hosting environment:

```bash
# Database Configuration
# MongoDB connection URI. If omitted or unreachable, StaffSync uses persistent atomic local storage.
MONGODB_URI="mongodb://localhost:27017/staffsync"

# Authentication & Token Security
# 64+ char random secret key used to sign session tokens.
SESSION_SECRET="your_secure_random_64_character_secret_key"

# Environment Mode
NODE_ENV="development"

# Demo Mode Setting
# Set to 'true' in development to enable the instant demo persona switcher.
ENABLE_DEMO_SWITCH="true"

# Server Port
PORT=3000

# Optional: Server-side Gemini AI API Key
GEMINI_API_KEY="your_gemini_api_key"
```

---

## 4. Getting Started & Development

### Prerequisites
- Node.js v20+ or v22+
- npm or pnpm

### Installation
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000` with Express backend routes and Vite middleware mounted.

### Run Automated Tests
```bash
npm test
```
Executes the comprehensive backend test suite testing password hashing, user retrieval, salary isolation, leave submission & approval, duplicate attendance prevention, announcements filtering, training CRUD, Kanban workflow, and stats aggregation.

### Check TypeScript Types
```bash
npm run lint
```

### Build for Production
```bash
npm run build
```
Generates production client assets in `dist/` and compiles `server.ts` into an optimized ES module `server.js`.

### Run Production Server
```bash
npm start
```

---

## 5. Seed Accounts & Roles

StaffSync includes pre-seeded demo accounts with bcrypt password hashes (`Password123!`):

| Name | Role | Department | Email |
| :--- | :--- | :--- | :--- |
| **Sarah Jenkins** | HR Director (Manager) | Human Resources | `sarah.hr@staffsync.io` |
| **John Doe** | Sr. Software Engineer (Employee) | Engineering | `john.doe@staffsync.io` |
| **Emily Chen** | Lead Product Designer (Employee) | Design | `emily.chen@staffsync.io` |
| **Marcus Vance** | Marketing Lead (Employee) | Marketing | `marcus.vance@staffsync.io` |
| **David Kim** | Operations Specialist (Employee) | Operations | `david.kim@staffsync.io` |

---

## 6. API Reference

### Authentication
- `POST /api/auth/login` — Sign in with email and password (rate-limited).
- `POST /api/auth/demo-switch` — Whitelisted quick switch for evaluation (disabled in production unless `ENABLE_DEMO_SWITCH=true`).
- `GET /api/auth/me` — Retrieve active authenticated user profile.

### Leaves
- `GET /api/leaves` — List leave applications (employees see only their own; managers see all).
- `POST /api/leaves` — Submit leave application (`startDate`, `endDate`, `reason`).
- `PATCH /api/leaves/:id/status` — Approve or Reject application (Manager only).

### Attendance
- `GET /api/attendance` — Get attendance records and today's session.
- `POST /api/attendance/check-in` — Check in for today's shift (duplicate prevention).
- `POST /api/attendance/check-out` — Check out and calculate duration.

### Employees
- `GET /api/employees` — List employees (salaries sanitized for non-managers).
- `POST /api/employees` — Onboard new employee (Manager only).
- `PUT /api/employees/:id` — Update employee record (full for manager, contact info for self).
- `DELETE /api/employees/:id` — Delete employee record (Manager only).

### Announcements & Training
- `GET /api/announcements` — List announcements (targeted by department for employees).
- `POST /api/announcements` — Create announcement (Manager only).
- `DELETE /api/announcements/:id` — Delete announcement (Manager only).
- `GET /api/trainings` — List training sessions.
- `POST /api/trainings` — Create training session (Manager only).
- `PUT /api/trainings/:id` — Update training session (Manager only).
- `DELETE /api/trainings/:id` — Delete training session (Manager only).

### Kanban & Analytics
- `GET /api/kanban` — List Kanban pipeline tasks.
- `POST /api/kanban` — Create task.
- `PATCH /api/kanban/:id` — Update task status or priority.
- `DELETE /api/kanban/:id` — Remove task.
- `GET /api/stats` — Summary metrics for dashboard counters.
- `POST /api/ai/draft-announcement` — Optional Gemini AI drafting endpoint.

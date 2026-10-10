# Smart Support Ticket Management System

A full-stack MERN (MongoDB, Express, React, Node.js) support ticket management system with role-based access control, server-side search and filtering, ticket resolution workflows, and an admin dashboard.

## Tech Stack

- **Frontend**: React 18 + Vite, React Router v6, vanilla CSS
- **Backend**: Node.js, Express 4, Mongoose ODM
- **Database**: MongoDB (local or Atlas)
- **Auth**: JWT (Bearer tokens), bcrypt password hashing (12 rounds)

---

## Environment Variables

### Server (`server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/support_tickets
JWT_SECRET=your_jwt_secret_here

# Required for create-admin.js script
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password_here
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000
```

---

## Setup Instructions

### 1. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment

Copy the `.env.example` or create `.env` files for both `server/` and `client/` directories using the variables listed above.

### 3. Seed admin user

```bash
cd server
node create-admin.js
```

This requires `ADMIN_EMAIL` and `ADMIN_PASSWORD` to be set in `server/.env`. No hardcoded default credentials exist.

### 4. Start development servers

```bash
# Backend (from server/)
npm run dev

# Frontend (from client/)
npm run dev
```

The backend runs on `http://localhost:5000` and the frontend on `http://localhost:5173` (Vite default).

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint         | Description               | Auth Required |
| ------ | ---------------- | ------------------------- | ------------- |
| POST   | `/register`      | Register new customer     | No            |
| POST   | `/login`         | Login and receive JWT     | No            |
| GET    | `/me`            | Get current user profile  | Yes           |
| PATCH  | `/profile`       | Update user name          | Yes           |

### Customer Tickets (`/api/tickets`)

| Method | Endpoint   | Description                        | Auth Required |
| ------ | ---------- | ---------------------------------- | ------------- |
| POST   | `/`        | Create a new ticket                | Yes           |
| GET    | `/`        | List own tickets (with filters)    | Yes           |
| GET    | `/:id`     | Get single ticket (ownership only) | Yes           |
| PATCH  | `/:id`     | Update ticket title/description    | Yes           |

**Query params** for `GET /api/tickets`: `page`, `limit`, `search`, `status`, `priority`, `category`

### Admin (`/api/admin`)

| Method | Endpoint                | Description                   | Auth + Role |
| ------ | ----------------------- | ----------------------------- | ----------- |
| GET    | `/tickets`              | List all tickets (with search)| ADMIN       |
| GET    | `/tickets/:id`          | Inspect single ticket         | ADMIN       |
| PATCH  | `/tickets/:id`          | Update status/priority        | ADMIN       |
| PATCH  | `/tickets/:id/resolve`  | Resolve ticket with note      | ADMIN       |
| PATCH  | `/tickets/:id/assign`   | Assign ticket to user         | ADMIN       |
| GET    | `/stats`                | Dashboard statistics          | ADMIN       |

---

## Testing and Verification

### Backend Tests

```bash
cd server
npm test
```

**Last run**: 251 tests passing across 7 test suites (auth, tickets, admin, middleware, validators).

### Frontend Build

```bash
cd client
npm run build
```

**Last run**: 86 modules transformed, zero errors. The production build compiles successfully but does not include end-to-end UI tests.

> **Note**: Frontend unit tests are **not yet implemented**. The `npm run build` step confirms compilation only.

### Manual Verification Checklist

Before submission, verify these workflows work end-to-end:

- [ ] Customer registration and login
- [ ] Admin login and access restrictions
- [ ] Ticket creation and customer ticket listing
- [ ] Server-side search, filtering, and pagination
- [ ] Admin ticket status/priority updates
- [ ] Ticket resolution with resolution note
- [ ] Profile viewing
- [ ] Logout and protected-route behaviour

Only report workflows as verified after actually testing them.

---

## Project Structure

```
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # AuthContext (global state)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── layouts/         # DashboardLayout, AdminLayout
│   │   ├── pages/           # Route pages
│   │   ├── services/        # API client (api.js)
│   │   ├── styles/          # CSS modules
│   │   └── utils/           # Formatters and helpers
│   └── vite.config.js
├── server/                  # Express + Mongoose backend
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Auth, authorization
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Logger
│   │   └── validators/      # Input validation
│   ├── tests/               # Jest test suites
│   └── create-admin.js      # Admin seeding script
└── README.md
```

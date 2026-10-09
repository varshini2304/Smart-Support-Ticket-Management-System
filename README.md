# Smart Support Ticket Management System

A full-stack web application for managing customer support tickets with admin capabilities. Built as a technical assessment for StartupMeu's Software Engineer Intern position.

## Project Overview

This MERN (MongoDB, Express, React, Node.js) stack application allows:
- **Customers**: Create and track support tickets
- **Administrators**: View, assign, and manage tickets

### Current Status: Phase 1 - Environment Setup Complete ✓

Phase 1 focuses on environment setup, project scaffolding, and verification only. No business functionality has been implemented yet.

## Planned Core Features

### Phase 1: Environment Setup (✓ Complete)
- [x] Project structure and directory organization
- [x] React frontend with Vite
- [x] Express backend with Node.js
- [x] Development environment configuration
- [x] Git repository initialization

### Phase 2: Authentication & Database (Planned)
- [ ] User registration and login
- [ ] JWT-based authentication
- [ ] Password hashing with bcrypt
- [ ] MongoDB integration with Mongoose
- [ ] Database schema design for tickets and users

### Phase 3: Ticket Management (Planned)
- [ ] Customer ticket creation (POST /api/tickets)
- [ ] Ticket retrieval and filtering
- [ ] Ticket status updates
- [ ] Admin ticket assignment

### Phase 4: Dashboard & UI (Planned)
- [ ] Customer dashboard
- [ ] Admin dashboard
- [ ] Ticket detail pages
- [ ] Form validation
- [ ] Error handling and notifications

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 18.2.0 |
| **Frontend Build** | Vite | 4.4.9 |
| **Backend** | Node.js | 24.14.1 |
| **Backend Framework** | Express | 4.18.2 |
| **Database** | MongoDB | (Atlas - Phase 2) |
| **ORM** | Mongoose | 7.5.0 |
| **Authentication** | JWT + bcrypt | (Phase 2) |
| **Version Control** | Git | 2.53.0 |
| **Package Manager** | npm | 11.11.0 |
| **Development Tool** | Kiro | (environment setup) |

## Proposed Architecture

```
smart-support-tickets/
├── client/                           # React + Vite frontend
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   ├── pages/                    # Page-level components
│   │   ├── services/                 # API client logic
│   │   ├── context/                  # React Context providers
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                           # Express backend
│   ├── src/
│   │   ├── config/                   # Configuration files
│   │   ├── models/                   # Mongoose schemas (Phase 2)
│   │   ├── controllers/              # Request handlers (Phase 2)
│   │   ├── routes/                   # API route definitions
│   │   ├── middleware/               # Custom middleware
│   │   ├── services/                 # Business logic (Phase 2)
│   │   ├── validators/               # Input validation (Phase 2)
│   │   └── app.js
│   ├── server.js                     # Entry point
│   └── package.json
│
├── .gitignore                        # Git exclusion rules
├── .env.example                      # Example environment variables
└── README.md                         # This file
```

### Architecture Responsibilities

- **client/**: Handles UI rendering, user interactions, and API communication. Runs on port 5173 (Vite dev server).
- **server/**: Handles business logic, database operations, and API endpoints. Runs on port 5000.
- **REST API**: JSON communication between frontend and backend via `/api/*` endpoints.
- **Separation of Concerns**: Frontend and backend are independent; either can be developed or deployed separately.

## Prerequisites

### Required
- **Node.js**: v18+ (verified: v24.14.1)
- **npm**: v9+ (verified: 11.11.0)
- **Git**: v2.30+ (verified: 2.53.0)

### Optional (for Phase 2)
- **MongoDB Atlas Account** (free tier): https://www.mongodb.com/cloud/atlas

## Installation Instructions

### Step 1: Clone or Navigate to the Project

```bash
cd d:\smart_support_ticket_management_system
```

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### Step 3: Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

### Step 4: Verify Installation

Both `server/node_modules` and `client/node_modules` should exist.

## Environment Variable Configuration

### For Local Development

1. **Create `.env` file in the server directory** (not committed to Git):

   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your local configuration**:

   ```
   PORT=5000
   MONGODB_URI=<your_atlas_connection_string>  # Phase 2
   JWT_SECRET=dev_secret_key_change_in_prod    # Phase 2
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

### Security Notes

- ⚠️ **NEVER commit `.env` files** to Git. The `.gitignore` file already excludes them.
- ⚠️ **Never place secrets** (passwords, API keys, JWT secrets) in the client code or frontend `.env`.
- ⚠️ **Use `.env.example`** as a template; it contains only placeholder values.

### Phase 2: MongoDB Atlas Setup

When you're ready for Phase 2:

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster (free tier available)
3. Generate a connection string: `mongodb+srv://username:password@cluster.mongodb.net/smart_support_tickets`
4. Add this to your `.env` file as `MONGODB_URI`
5. Never commit your actual connection string to Git

## How to Run

### Run Frontend (Development)

Open a terminal and navigate to the project root:

```bash
cd client
npm run dev
```

Expected output:
```
  VITE v4.4.9  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Access the frontend at `http://localhost:5173`

### Run Backend (Development)

Open a separate terminal and navigate to the project root:

```bash
cd server
npm run dev
```

Expected output:
```
Server running on http://localhost:5000
Health check available at http://localhost:5000/api/health
```

### Test Health Check Endpoint

In a third terminal or via a tool like `curl`:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2026-10-09T12:34:56.789Z"
}
```

## Project Scripts

### Backend

- `npm start` — Run production server
- `npm run dev` — Run development server with auto-reload
- `npm test` — Run tests (not yet implemented)

### Frontend

- `npm run dev` — Run development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm test` — Run tests (not yet implemented)

## Current Development Status

### Phase 1: Environment Setup ✓

**Completed:**
- ✓ Directory structure created
- ✓ React frontend initialized with Vite
- ✓ Express backend initialized with health-check endpoint
- ✓ Dependencies installed (React, Express, Mongoose, CORS, dotenv)
- ✓ Environment configuration files created (`.env.example`, `.gitignore`)
- ✓ Development scripts configured
- ✓ Git repository initialized
- ✓ Health-check endpoint verified

**What's NOT implemented in Phase 1:**
- ❌ Authentication system
- ❌ MongoDB integration
- ❌ Ticket CRUD APIs
- ❌ Database models
- ❌ Admin dashboard
- ❌ Customer dashboard
- ❌ Input validation
- ❌ Error handling beyond basics
- ❌ Tests

### Phase 2 and Beyond

Subsequent phases will implement the features listed above in logical order, with verification and testing at each step.

## Development Phases Overview

| Phase | Focus | Duration |
|-------|-------|----------|
| Phase 1 | Environment & scaffolding | ✓ Complete |
| Phase 2 | Authentication & database | Pending approval |
| Phase 3 | Ticket CRUD APIs | Pending approval |
| Phase 4 | Dashboards & UI | Pending approval |

## AI Development Tool: Kiro

This project is being developed using **Kiro**, an AI-powered development environment built on VS Code. Kiro is being used for:

- Environment setup and project scaffolding (Phase 1)
- Code generation and boilerplate creation
- Verification and testing

Kiro is NOT being used for business logic generation or architectural decisions beyond Phase 1. All critical decisions are made in collaboration with you.

## Getting Help

- Review the `.env.example` file for configuration options
- Check individual `package.json` files for available scripts
- Refer to the Technology Stack section for library documentation links
- Phase-specific implementation details will be provided as development progresses

## Next Steps

After Phase 1 verification:

1. **Review** the project structure and initialization
2. **Approve** to proceed to Phase 2 (Authentication & Database)
3. **Provide MongoDB Atlas connection string** (if available) for Phase 2
4. **Create GitHub repository** and authorize the push (when ready)

---

**Project Start Date:** October 9, 2026  
**Current Phase:** 1 (Complete - awaiting approval for Phase 2)  
**Assessment:** StartupMeu Software Engineer Intern Position

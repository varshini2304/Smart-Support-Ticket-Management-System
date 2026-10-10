# Smart Support Ticket Management System

A full-stack MERN web application for managing customer support tickets with role-based access control and admin capabilities. Built with React 18, Express, Node.js, and MongoDB.

## Project Overview

This application enables:
- **Customers**: Register, authenticate, create support tickets, track ticket status, view their own tickets
- **Administrators**: View all tickets, filter by status/priority, update ticket status/priority, assign tickets to themselves or other admins
- **Authentication**: Secure registration and login with JWT tokens and bcrypt password hashing
- **Authorization**: Role-based access control (CUSTOMER vs ADMIN)

### Current Status: Phase 3 - React Frontend Complete ✓

All core features implemented and tested:
- ✅ Phase 1: Environment Setup & Scaffolding
- ✅ Phase 2: Authentication & Database Integration
- ✅ Phase 3: Ticket API & React Frontend

## Core Features

### Implemented

#### Authentication & Security
- ✅ User registration with email and password
- ✅ User login with JWT token generation
- ✅ Password hashing with bcrypt (12-round salt)
- ✅ Session persistence using localStorage
- ✅ JWT token refresh on page reload
- ✅ Bearer token auto-attachment to API requests
- ✅ Role-based route protection (frontend + backend)
- ✅ Logout with token clearance

#### Customer Features
- ✅ Create tickets (title, description, priority)
- ✅ List own tickets with pagination (10 per page)
- ✅ View ticket status (OPEN, IN_PROGRESS, RESOLVED)
- ✅ View ticket priority (LOW, MEDIUM, HIGH)
- ✅ View assignment information
- ✅ Filter and navigate ticket lists
- ✅ Form validation and error handling

#### Admin Features
- ✅ View all tickets across all customers
- ✅ Dashboard statistics:
  - Total ticket count
  - Breakdown by status (Open, In Progress, Resolved)
  - Breakdown by priority (High, Medium, Low)
  - Assignment overview
- ✅ Filter tickets by status and/or priority
- ✅ Update ticket status (OPEN → IN_PROGRESS → RESOLVED)
- ✅ Update ticket priority (HIGH/MEDIUM/LOW)
- ✅ Assign tickets to users by ID
- ✅ Pagination through all tickets (10 per page)

#### Database & Models
- ✅ User model (name, email, passwordHash, role, timestamps)
- ✅ Ticket model (title, description, status, priority, createdBy, assignedTo, timestamps)
- ✅ User-ticket relationships (ownership, assignment)
- ✅ Validation and error handling at model level

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 18.2.0 | UI framework with hooks |
| **Frontend Router** | React Router | 7.18.4 | Client-side routing |
| **Frontend Build** | Vite | 6.4.4 | Fast build tool and dev server |
| **Backend** | Node.js | 24.14.1 | JavaScript runtime |
| **Backend Framework** | Express | 4.18.2 | HTTP server and routing |
| **Database** | MongoDB | 7.5.0 (Atlas) | Document database |
| **ORM** | Mongoose | 7.5.0 | MongoDB schema validation |
| **Authentication** | JWT | 9.0.2 | Token-based authentication |
| **Hashing** | bcrypt | 5.1.1 | Secure password hashing |
| **CORS** | cors | 2.8.5 | Cross-origin resource sharing |
| **Environment** | dotenv | 16.3.1 | Environment variable loading |
| **Testing** | Jest | 29.7.0 | Unit and middleware testing |
| **HTTP Testing** | Supertest | 6.3.3 | API endpoint testing |
| **Version Control** | Git | 2.53.0 | Source control |
| **Package Manager** | npm | 11.11.0 | Dependency management |

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React)                       │
│              http://localhost:5173 (Vite)                    │
├─────────────────────────────────────────────────────────────┤
│  Pages: Login, Register, CustomerDashboard, AdminDashboard   │
│  State: AuthContext (user, token, login/logout/register)    │
│  Services: Centralized HTTP client with JWT auto-attachment │
│  Routes: Protected routes with role-based access control    │
└────────────────────────┬────────────────────────────────────┘
                         │
                    REST API /api/*
                 (Bearer token required)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Backend (Express)                          │
│              http://localhost:5000                           │
├─────────────────────────────────────────────────────────────┤
│  Routes: /auth/*, /tickets/*, /admin/*                      │
│  Middleware: authenticate (JWT verify), authorize (role)    │
│  Models: User, Ticket (Mongoose schemas)                    │
│  Controllers: Request handling and business logic           │
│  Database: MongoDB with Mongoose ODM                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                   MongoDB Atlas
                         │
         mongodb+srv://cluster.mongodb.net
```

### Project Structure

```
smart-support-tickets/
│
├── client/                          # React + Vite Frontend
│   ├── src/
│   │   ├── App.jsx                  # React Router configuration
│   │   ├── main.jsx                 # React entry point
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state + methods
│   │   │
│   │   ├── hooks/
│   │   │   └── useAuth.js           # useAuth hook for auth context
│   │   │
│   │   ├── services/
│   │   │   └── api.js               # Centralized HTTP client
│   │   │                            # - authAPI (register/login/getCurrentUser)
│   │   │                            # - ticketAPI (create/list/get/update)
│   │   │                            # - adminAPI (getAllTickets/update/assign/stats)
│   │   │                            # - tokenAPI (get/set/clear token)
│   │   │
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx   # Route protection wrapper
│   │   │
│   │   └── pages/
│   │       ├── LoginPage.jsx        # User login form
│   │       ├── RegisterPage.jsx     # User registration form
│   │       ├── CustomerDashboard.jsx # Ticket creation & listing
│   │       └── AdminDashboard.jsx   # Statistics, filtering, management
│   │
│   ├── index.html                   # HTML template
│   ├── vite.config.js               # Vite configuration (port 5173, /api proxy)
│   ├── package.json
│   └── dist/                        # Production build output
│
├── server/                          # Express + MongoDB Backend
│   ├── src/
│   │   ├── app.js                   # Express app setup, middleware, error handler
│   │   │
│   │   ├── config/
│   │   │   └── db.js                # MongoDB connection (Mongoose)
│   │   │
│   │   ├── models/
│   │   │   ├── User.js              # User schema (name, email, passwordHash, role)
│   │   │   └── Ticket.js            # Ticket schema (title, desc, status, priority, etc.)
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js    # register/login/getCurrentUser
│   │   │   ├── ticketController.js  # createTicket/getMyTickets/getTicket/updateTicket
│   │   │   └── adminTicketController.js # getAllTickets/update/assign/getDashboardStats
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # POST /api/auth/register, /login, GET /me
│   │   │   ├── ticketRoutes.js      # CRUD for customer tickets
│   │   │   └── adminRoutes.js       # Admin-only ticket operations & stats
│   │   │
│   │   ├── middleware/
│   │   │   ├── authenticate.js      # JWT verification, Bearer token extraction
│   │   │   └── authorize.js         # Role-based authorization (ADMIN check)
│   │   │
│   │   ├── services/
│   │   │   └── authService.js       # JWT generation/verification, password hashing
│   │   │
│   │   └── validators/
│   │       └── authValidators.js    # Input validation (email format, password length)
│   │
│   ├── server.js                    # Entry point, DB connection, server startup
│   ├── jest.config.js               # Test configuration
│   ├── package.json
│   └── tests/                       # Unit and middleware tests
│       ├── auth.unit.test.js        # Authentication logic tests
│       ├── auth.middleware.test.js  # Auth middleware tests
│       ├── auth.test.js             # Integration tests (requires MongoDB)
│       ├── ticket.unit.test.js      # Ticket logic tests
│       ├── ticket.middleware.test.js # Ticket middleware tests
│       ├── admin.unit.test.js       # Admin logic tests
│       └── admin.middleware.test.js # Admin middleware tests
│
├── .gitignore                       # Git exclusion rules
├── .env.example                     # Environment variable template
└── README.md                        # This file
```

### Data Flow

1. **User Registration/Login**
   - Frontend: RegisterPage/LoginPage → authAPI.register/login()
   - Backend: POST /api/auth/register/login → authController → User.create/findOne
   - Response: user object + JWT token (stored in localStorage)

2. **Customer Ticket Workflow**
   - Frontend: CustomerDashboard → ticketAPI.createTicket() (with Bearer token)
   - Backend: POST /api/tickets → authenticate → ticketController → Ticket.create
   - Response: Created ticket object

3. **Admin Ticket Management**
   - Frontend: AdminDashboard → adminAPI.getAllTickets/updateTicket/assignTicket (Bearer + admin role)
   - Backend: GET/PATCH /api/admin/tickets → authenticate → authorizeRoles('ADMIN') → adminController
   - Response: Ticket list, updated ticket, or statistics

## Prerequisites

### Required
- **Node.js**: v18+ (verified with v24.14.1)
- **npm**: v9+ (verified with 11.11.0)
- **Git**: v2.30+ (verified with 2.53.0)

### For Phase 3+ (Backend Live Testing)
- **MongoDB Atlas Account** (free tier): https://www.mongodb.com/cloud/atlas
- **Connection String**: `mongodb+srv://username:password@cluster.mongodb.net/smart_support_tickets`

### Verification
Check installed versions:
```bash
node --version
npm --version
git --version
```

## Installation

### 1. Clone or Navigate to Project
```bash
cd d:\smart_support_ticket_management_system
# or clone: git clone <repo_url>
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
cd ..
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Verify Installation
Both directories should have `node_modules/` folder:
```bash
ls server/node_modules     # Should exist
ls client/node_modules     # Should exist
```

## Environment Configuration

### Setup: Create .env File

1. **Create `.env` in project root** (NOT committed to Git):
   ```bash
   # Copy template
   cp .env.example .env
   
   # Edit with your values
   # On Windows: Use notepad .env
   ```

2. **Configure for Development** (example values):
   ```bash
   PORT=5000
   MONGODB_URI=mongodb+srv://<your_username>:<your_password>@<cluster>.mongodb.net/smart_support_tickets?retryWrites=true&w=majority
   JWT_SECRET=your_strong_random_secret_key_here
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

### Security Notes

- ⚠️ **NEVER commit `.env`** - it contains real credentials
- ✅ `.env` is in `.gitignore` - won't be accidentally pushed
- ✅ Use `.env.example` as reference (contains only placeholders)
- ✅ Generate strong JWT_SECRET: `openssl rand -base64 32` or similar
- ✅ Use unique, strong MongoDB password
- ⚠️ Never hardcode secrets in frontend code

### MongoDB Atlas Setup (If Not Already Done)

1. Create account: https://www.mongodb.com/cloud/atlas
2. Create free cluster (M0 tier)
3. Create database user with strong password
4. Add your IP to Network Access (or use 0.0.0.0/0 for development)
5. Click "Connect" → "Drivers" → Copy connection string
6. Replace placeholders in connection string:
   - `<username>` → your MongoDB user
   - `<password>` → your MongoDB password
   - `<cluster>` → your cluster name
7. Paste into `.env` as `MONGODB_URI`

## How to Run

### Terminal 1: Start Backend

```bash
cd server
npm start
```

**Expected Output:**
```
Connecting to MongoDB...
✓ Database connected successfully
✓ Server running on http://localhost:5000
✓ Health check available at http://localhost:5000/api/health
```

### Terminal 2: Start Frontend

```bash
cd client
npm run dev
```

**Expected Output:**
```
  VITE v6.4.4  ready in 421 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### Access Application

Open in browser: **http://localhost:5173**

### Test Backend Health

```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2026-10-09T12:34:56.789Z"
}
```

## Available Scripts

### Backend

```bash
cd server

npm start           # Production mode
npm run dev         # Development mode (auto-reload)
npm test            # Run unit and middleware tests
                    # Integration tests require MONGODB_URI
```

### Frontend

```bash
cd client

npm run dev         # Development server (port 5173)
npm run build       # Production build to dist/
npm run preview     # Preview production build locally
npm test            # Tests not yet implemented
```

## API Endpoint Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Authentication: Bearer token in `Authorization` header

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"  // min 8 chars
}

Response 201:
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "CUSTOMER",
  "createdAt": "2026-10-09T12:00:00.000Z"
}

Response 400: Validation error
Response 409: Email already registered
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER"
  }
}

Response 400: Validation error
Response 401: Invalid credentials
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response 200:
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "CUSTOMER"
}

Response 401: Missing or invalid token
```

### Customer Ticket Endpoints

#### Create Ticket
```
POST /api/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Cannot login",
  "description": "I keep getting 'Invalid credentials' error...",
  "priority": "HIGH"  // LOW, MEDIUM, HIGH
}

Response 201: Created ticket object
Response 400: Validation error
Response 401: Not authenticated
```

#### List My Tickets
```
GET /api/tickets?page=1&limit=10
Authorization: Bearer <token>

Response 200:
{
  "tickets": [ ... ],
  "total": 25,
  "page": 1,
  "pages": 3
}
```

#### Get Ticket Details
```
GET /api/tickets/:id
Authorization: Bearer <token>

Response 200: Ticket object
Response 404: Not found or not owned by you
```

#### Update My Ticket
```
PATCH /api/tickets/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description"
}

Response 200: Updated ticket
Response 404: Not found
Response 403: Not your ticket
```

### Admin Ticket Endpoints

#### Get All Tickets (Admin Only)
```
GET /api/admin/tickets?page=1&limit=10&status=OPEN&priority=HIGH
Authorization: Bearer <admin_token>

Query Parameters:
  page: 1           # Page number for pagination
  limit: 10         # Tickets per page
  status: OPEN      # Optional: OPEN, IN_PROGRESS, RESOLVED
  priority: HIGH    # Optional: LOW, MEDIUM, HIGH

Response 200:
{
  "tickets": [ ... ],
  "total": 15,
  "page": 1,
  "pages": 2
}

Response 401: Not authenticated
Response 403: Not an admin
```

#### Update Ticket Status/Priority (Admin Only)
```
PATCH /api/admin/tickets/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "IN_PROGRESS",  // Optional
  "priority": "MEDIUM"      // Optional
}

Response 200: Updated ticket object
Response 400: Invalid status/priority
Response 403: Not an admin
Response 404: Ticket not found
```

#### Assign Ticket (Admin Only)
```
PATCH /api/admin/tickets/:id/assign
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "assignedTo": "507f1f77bcf86cd799439011"  // User ID
}

Response 200: Updated ticket with assignment
Response 400: Invalid or non-existent user ID
Response 403: Not an admin
Response 404: Ticket not found
```

#### Get Dashboard Statistics (Admin Only)
```
GET /api/admin/stats
Authorization: Bearer <admin_token>

Response 200:
{
  "total": 47,
  "byStatus": {
    "OPEN": 12,
    "IN_PROGRESS": 20,
    "RESOLVED": 15
  },
  "byPriority": {
    "HIGH": 8,
    "MEDIUM": 22,
    "LOW": 17
  },
  "assignment": {
    "assigned": 35,
    "unassigned": 12
  }
}

Response 401: Not authenticated
Response 403: Not an admin
```

## Security Features

### Implemented

- ✅ **Password Hashing**: bcrypt with 12-round salt (not stored in plaintext)
- ✅ **JWT Authentication**: Stateless token-based auth (expires in configurable time)
- ✅ **Bearer Tokens**: Auto-attached to all authenticated API requests
- ✅ **Role-Based Access Control**: CUSTOMER vs ADMIN roles enforced
- ✅ **Input Validation**: Email format, password length (8-128 chars), ticket fields
- ✅ **SQL Injection Protection**: Using MongoDB + Mongoose (no SQL)
- ✅ **CORS**: Configured to allow frontend on localhost:5173
- ✅ **Environment Variables**: Secrets never hardcoded (MONGODB_URI, JWT_SECRET)
- ✅ **Ownership Validation**: Customers can only see/edit their own tickets
- ✅ **Error Handling**: Sensitive info not exposed in error messages

### Not Yet Implemented (Future)

- Rate limiting on authentication endpoints
- Email verification for registration
- Password reset functionality
- Refresh token rotation
- HTTPS/SSL for production
- Request size limits
- API key authentication for third-party integrations

## Testing

### Backend Unit & Middleware Tests

```bash
cd server
npm test
```

**Test Results (Phase 3):**
- Unit Tests: 217 passing ✅
- Integration Tests: 14 failing (require MongoDB configuration)
- Test Suites: 6 passing, 1 conditional
- Total Coverage: Authentication, Tickets, Admin endpoints

**To Run Only Unit Tests (skip integration):**

Tests automatically skip integration tests if `MONGODB_URI` is not set. Configure `.env` with MongoDB to run full integration tests.

### Frontend Build Verification

```bash
cd client
npm run build
```

**Build Results (Phase 3):**
- ✅ 46 modules bundled
- ✅ 204.29 kB JavaScript (64.84 kB gzipped)
- ✅ 0.41 kB HTML (0.28 kB gzipped)
- ✅ Build time: ~2 seconds
- ✅ No errors or warnings

## Development Status

### ✅ Completed

#### Phase 1: Environment & Scaffolding
- Project structure and git initialization
- React + Vite frontend setup
- Express backend setup
- Health-check endpoint
- Development and production scripts

#### Phase 2: Authentication & Database
- User registration and login
- JWT token generation and verification
- Password hashing with bcrypt
- MongoDB integration with Mongoose
- User and Ticket database models
- Middleware for authentication and authorization
- Input validation

#### Phase 3: Ticket Management & Frontend
- Customer ticket creation (title, description, priority)
- Ticket listing with pagination and filtering
- Ticket status and priority management
- Admin dashboard with statistics
- Ticket assignment functionality
- React Router with protected routes
- Global auth state management (Context API)
- Centralized HTTP client with JWT handling
- Form validation and error handling
- Loading and success states

### ⚠️ Known Limitations

- **Admin Assignment**: Requires knowing exact MongoDB ObjectId of user (no user lookup UI)
- **Email Notifications**: Not implemented (future feature)
- **Real-Time Updates**: No WebSocket support for live ticket updates
- **File Uploads**: Not implemented (future feature)
- **Mobile Optimization**: Not optimized for mobile devices
- **Accessibility**: WCAG compliance not fully implemented
- **Search**: Basic list-only interface (no full-text search)
- **Duplicate Email Error**: Shows generic error instead of "Email already registered"

### 📋 Future Enhancements

- Email notifications on ticket updates
- Real-time updates with WebSockets
- File attachment support
- Ticket comments/notes
- Advanced search and filtering
- User profile management
- Ticket history and audit logs
- Mobile-responsive design
- Dark mode
- Internationalization (i18n)

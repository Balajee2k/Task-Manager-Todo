# Task Manager - Full-Stack CRUD Application

A modern, secure, and user-friendly task management application built with Next.js 15, TypeScript, MongoDB, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- ✅ **Complete CRUD Operations** - Create, Read, Update, and Delete tasks
- 🔐 **JWT Authentication** - Secure user registration and login
- 👤 **User Authorization** - Role-based access control
- 🎨 **Responsive UI** - Mobile-first design with Tailwind CSS
- 🔍 **Search & Filter** - Find tasks by status, priority, or keywords
- 🏷️ **Task Organization** - Tags, priorities, due dates, and status tracking
- ⚡ **Real-time Updates** - Instant task updates without page refresh

### Security Features
- 🔒 Password encryption with bcrypt (12 salt rounds)
- 🛡️ Input validation and sanitization (Zod schemas)
- 🚦 Rate limiting on authentication endpoints
- 🔑 JWT-based stateless authentication
- 🚫 Protected API routes with middleware
- 📝 MongoDB injection prevention

### Performance Optimizations
- ⚡ Next.js 15 with Turbopack
- 💾 MongoDB connection pooling
- 📊 Database indexing for efficient queries
- 🎯 Pagination for large datasets
- 🔄 Server-side rendering (SSR)
- 📦 Code splitting and lazy loading

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI primitives
- **State Management:** React Context API

### Backend
- **Runtime:** Node.js
- **API:** Next.js API Routes (RESTful)
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod

### Database
- **Database:** MongoDB
- **ODM:** Mongoose
- **Features:** Schemas, validation, middleware, indexing

### Testing & Quality
- **Unit Tests:** Jest + React Testing Library
- **E2E Tests:** Playwright
- **Linting:** ESLint
- **Type Safety:** TypeScript strict mode

### DevOps
- **Hosting:** Vercel
- **CI/CD:** GitHub Actions
- **Version Control:** Git

## 📁 Project Structure

```
task-manager/
├── app/                      # Next.js 15 App Router
│   ├── api/                 # RESTful API endpoints
│   │   ├── auth/           # Authentication (login, register)
│   │   └── tasks/          # CRUD operations
│   ├── dashboard/          # Main app interface
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── page.tsx            # Landing page
├── components/ui/           # Reusable UI components
├── contexts/               # React contexts (Auth)
├── lib/                    # Utility libraries
│   ├── mongodb.ts          # DB connection with pooling
│   ├── auth.ts             # JWT utilities
│   ├── middleware.ts       # API protection
│   ├── validations.ts      # Zod schemas
│   ├── api-utils.ts        # API helpers
│   └── utils.ts            # General utilities
├── models/                 # Mongoose models
│   ├── User.ts             # User schema
│   └── Task.ts             # Task schema
├── e2e/                    # E2E tests (Playwright)
├── .github/workflows/      # CI/CD pipeline
├── README.md               # Comprehensive docs
└── SECURITY.md             # Security guide
```

## 🔑 Key Features

### User Management
- Secure registration with validation
- Email uniqueness enforcement
- Password complexity requirements
- JWT token generation
- User-specific data isolation

### Task Management
- Create tasks with title, description, priority, status
- Due date tracking with overdue indicators
- Tag system for organization
- Status tracking (todo, in-progress, completed, cancelled)
- Priority levels (low, medium, high, urgent)
- Search functionality
- Filter by status and priority
- Pagination for performance

### Security Features
- Password hashing (bcrypt, 12 rounds)
- JWT authentication (7-day expiration)
- Rate limiting (login: 10/15min, register: 5/hour)
- Input sanitization (XSS prevention)
- MongoDB injection prevention
- Protected API routes
- Role-based authorization

### Performance Optimizations
- MongoDB connection pooling
- Database indexing (compound indexes)
- Pagination (10 items per page)
- Server-side rendering
- Code splitting (Next.js automatic)
- Optimized images (Next.js Image)
- Caching headers on API responses

## 🧪 Testing

### Unit Tests
- Jest + React Testing Library configured
- Test setup with @testing-library/jest-dom
- Coverage collection configured
- Module path mapping

### E2E Tests
- Playwright configuration
- Multi-browser testing (Chromium, Firefox, WebKit)
- Complete user flows tested:
  - Homepage navigation
  - User registration
  - User login
  - Task CRUD operations

### CI/CD Pipeline
- Automated on every push
- Stages: Lint → Test → E2E → Build → Deploy
- Test reports uploaded as artifacts
- Environment-specific deployments


## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd task-manager
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/taskmanager
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskmanager

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NEXTAUTH_SECRET=your-nextauth-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

### 4. Start MongoDB
**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas:**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string and update `.env.local`

### 5. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

### Unit Tests
```bash
npm test                # Run once
npm run test:watch      # Watch mode
```

### E2E Tests
```bash
npm run test:e2e        # Headless mode
npm run test:e2e:ui     # Interactive UI mode
```

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Task Endpoints

#### Get All Tasks
```http
GET /api/tasks?status=todo&priority=high&search=meeting&page=1&limit=10
Authorization: Bearer <token>
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the full-stack application",
  "status": "todo",
  "priority": "high",
  "dueDate": "2025-12-31T23:59:59Z",
  "tags": ["work", "urgent"]
}
```

#### Update Task
```http
PATCH /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "priority": "medium"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

## 🔒 Security Best Practices

1. **Password Security**
   - Passwords hashed with bcrypt (12 rounds)
   - Minimum 8 characters with complexity requirements
   - Passwords never returned in API responses

2. **Authentication**
   - JWT tokens with 7-day expiration
   - Secure token storage (localStorage with HTTP-only alternative recommended for production)
   - Token validation on every protected route

3. **Input Validation**
   - Zod schema validation on all inputs
   - Sanitization to prevent XSS attacks
   - MongoDB injection prevention through parameterized queries

4. **Rate Limiting**
   - Login: 10 requests per 15 minutes
   - Register: 5 requests per hour
   - Prevents brute force attacks

5. **Error Handling**
   - Generic error messages in production
   - Detailed errors only in development
   - No sensitive data in error responses

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Set Environment Variables** in Vercel Dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

3. **Configure MongoDB Atlas**
   - Whitelist Vercel IP addresses
   - Update connection string in environment variables

### GitHub Actions CI/CD

The repository includes a complete CI/CD pipeline that:
- ✅ Runs linting on every push
- ✅ Executes unit tests
- ✅ Performs E2E tests
- ✅ Builds the application
- ✅ Deploys to Vercel on main branch

**Required GitHub Secrets:**
- `MONGODB_URI`
- `JWT_SECRET`
- `NEXTAUTH_SECRET`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## 🎯 Real-World Considerations

### Scalability
- MongoDB indexing for efficient queries
- Connection pooling to handle multiple requests
- Pagination to limit response sizes
- Caching strategies with Next.js

### Error Handling
- Comprehensive try-catch blocks
- User-friendly error messages
- Logging for debugging and monitoring
- Graceful fallbacks for failed requests

### Data Integrity
- Mongoose schema validation
- Referential integrity with user-task relationships
- Atomic operations for data consistency

### Monitoring & Maintenance
- Error tracking (consider Sentry integration)
- Performance monitoring (Vercel Analytics)
- Regular dependency updates
- Database backups (MongoDB Atlas automated backups)

## 📄 License

MIT License - Feel free to use this project for learning or commercial purposes.

---

**Built with ❤️ using Next.js 15, TypeScript, and MongoDB**


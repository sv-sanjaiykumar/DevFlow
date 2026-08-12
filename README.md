# DevFlow — AI-Powered Developer Project & Task Management Platform

DevFlow is a full-stack, developer-focused project tracking and task management platform featuring a dark developer tool aesthetic, real-time Kanban board drag-and-drop task management, comprehensive telemetry dashboard analytics, team collaboration RBAC controls, and OpenAI-powered task spec generation & beginner-friendly technical explanations.

---

## 🚀 Key Features

- **Developer UI Aesthetic**: Linear/Vercel-inspired dark interface (`#09090b` canvas, glassmorphic panels, status/priority indicators).
- **Interactive 5-Column Kanban Board**: Drag and drop tasks across columns (`Backlog`, `In Progress`, `Code Review`, `Testing`, `Completed`) with `@dnd-kit`. Every drop instantly persists `status` and `position` to PostgreSQL.
- **AI Task Generator**: Describe bugs or requirements in natural language to generate structured specs (Title, Description, Priority, Labels, Root Causes, Next Steps) with edit-before-confirm workflow.
- **AI Task Explainer**: Beginner-friendly technical breakdowns explaining why tasks matter and step-by-step implementation objectives.
- **Telemetry Dashboard**: Aggregate project metrics, 7-day task creation & completion velocity charts via Recharts, and per-project completion progress tracking.
- **Multi-User Collaboration & RBAC**: Projects support `OWNER`, `ADMIN`, and `MEMBER` roles with member invitation and role management.
- **Secure Authentication**: JWT Access Tokens (15m) + Refresh Tokens (7d) with token rotation, revocation, and bcrypt password hashing.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Lucide React, `@dnd-kit` (drag-and-drop), Recharts, Sonner (toasts), Axios (API client with silent refresh interceptor), React Router v7.
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL 17/18, JWT, bcryptjs, Zod validation, Helmet, CORS, Express Rate Limit.
- **AI Integration**: OpenAI API (`gpt-4o-mini`) via backend endpoints.
- **Infrastructure**: Docker Compose (`db` service + health checks, `app` service).

---

## 📦 Prerequisites

- **Node.js**: v18.0.0 or higher (v22+ recommended)
- **npm**: v9.0.0 or higher
- **Docker & Docker Compose** (Optional for containerized run)
- **OpenAI API Key** (Optional for AI task generation)

---

## ⚡ Quick Start with Docker Compose

1. **Clone repository and set up environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Start full stack with Docker Compose**:
   ```bash
   docker compose up -d --build
   ```

3. **Access Application**:
   - Backend API: `http://localhost:5000/api/health`
   - Postgres DB: `localhost:5432`

---

## 💻 Local Development Setup (Without Docker)

### 1. Database Setup
Ensure PostgreSQL is running locally on port `5432` with a database named `devflow`.
Update `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/devflow?schema=public"
```

### 2. Install & Seed Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```
Backend will start on `http://localhost:5000`.

### 3. Install & Start Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:5173`.

---

## 🔑 Demo Login Credentials

The database is pre-populated with demo accounts (Password for all: `Password123!`):

| Username | Role | Email |
| :--- | :--- | :--- |
| `sarah_lead` | Engineering Lead / Project Owner | `sarah@devflow.io` |
| `alex_dev` | Senior Full-Stack Developer | `alex@devflow.io` |
| `marcus_qa` | QA & Security Engineer | `marcus@devflow.io` |

---

## 📜 NPM Scripts Reference

### Root Directory
- `npm run dev`: Concurrently start backend and frontend dev servers
- `npm run build`: Build both backend and frontend for production
- `npm run docker:up`: Launch Docker Compose stack
- `npm run docker:down`: Stop Docker Compose stack

### Backend Directory (`/backend`)
- `npm run dev`: Run server with `tsx watch`
- `npm run build`: Compile TypeScript and generate Prisma client
- `npm run prisma:migrate`: Run Prisma migrations
- `npm run prisma:seed`: Populate database with seed data
- `npm run prisma:studio`: Open Prisma Studio UI at `localhost:5555`

### Frontend Directory (`/frontend`)
- `npm run dev`: Start Vite development server
- `npm run build`: Build production frontend bundle

---

## 📡 API Endpoint Documentation

All protected endpoints require `Authorization: Bearer <accessToken>` header.

### 🔐 Authentication (`/api/auth`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | No | Register new user account |
| `POST` | `/api/auth/login` | No | Login with username/email & password |
| `POST` | `/api/auth/refresh` | No | Refresh expired access token |
| `POST` | `/api/auth/logout` | No | Revoke refresh token |
| `GET` | `/api/auth/me` | Yes | Get current user profile |

### 📁 Projects & Members (`/api/projects`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | Yes | List user's project workspaces |
| `POST` | `/api/projects` | Yes | Create new workspace |
| `GET` | `/api/projects/:id` | Yes | Get project details, members & labels |
| `PATCH` | `/api/projects/:id` | Yes | Update project name or description |
| `DELETE` | `/api/projects/:id` | Yes | Delete workspace (Owner only) |
| `POST` | `/api/projects/:id/members` | Yes | Invite member by username/email |
| `DELETE` | `/api/projects/:id/members/:memberId` | Yes | Remove team member |
| `POST` | `/api/projects/:id/labels` | Yes | Create custom label |

### 📋 Tasks (`/api/tasks`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Yes | List/filter tasks (by status, priority, assignee, label, text) |
| `POST` | `/api/tasks` | Yes | Create new task |
| `GET` | `/api/tasks/:id` | Yes | Get task details with comments timeline |
| `PATCH` | `/api/tasks/:id` | Yes | Update task attributes |
| `PATCH` | `/api/tasks/:id/status` | Yes | Kanban DnD update (updates `status` and `position` in 1 transaction) |
| `DELETE` | `/api/tasks/:id` | Yes | Delete task |

### 💬 Comments (`/api`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks/:taskId/comments` | Yes | List comments on task |
| `POST` | `/api/tasks/:taskId/comments` | Yes | Add comment to task |
| `DELETE` | `/api/comments/:id` | Yes | Delete comment |

### 📊 Telemetry Dashboard (`/api/dashboard`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Yes | Returns total projects, tasks, completed, overdue, 7-day velocity chart data, & recent tasks |

### 🤖 AI Assistant (`/api/ai`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/generate-task` | Yes | Generate structured JSON task spec from prompt |
| `POST` | `/api/ai/tasks/confirm` | Yes | Persist confirmed AI task into PostgreSQL |
| `POST` | `/api/ai/explain-task` | Yes | Generate beginner-friendly developer explanation |

---

## 🛠️ Troubleshooting

- **Database Connection Error**: Ensure PostgreSQL is running on port 5432 and `DATABASE_URL` in `.env` matches credentials.
- **Port Conflict (5000 / 5173)**: Change `PORT` in `.env` or Vite port in `frontend/vite.config.ts`.
- **OpenAI Key Missing**: If no OpenAI API key is set, the system uses an intelligent built-in fallback parser so all AI task workflows remain 100% testable offline.

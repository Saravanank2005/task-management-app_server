# Task360 - Backend Server API

> **Task360 Express & Node.js API**

Task360 backend is a REST API built with **Node.js**, **Express**, **JWT Authentication**, and **MongoDB Atlas** (`kovai_task` database).

---

## 🌐 Live API URL
- **Live Deployed Server API**: [https://task-management-app-server-uc6q.onrender.com](https://task-management-app-server-uc6q.onrender.com)
- **Health Check**: [https://task-management-app-server-uc6q.onrender.com/api/health](https://task-management-app-server-uc6q.onrender.com/api/health)

---

## ⚡ How to Run Locally (Offline / Dev Mode)

1. Open terminal in the `server` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file (refer to `.env.example`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://saravanan:amada1234@cluster0.1d6gi.mongodb.net/kovai_task?retryWrites=true&w=majority
   JWT_SECRET=kovai_task_manager_jwt_secret_key_2026_spec
   GOOGLE_CLIENT_ID=674600937844-sbkl3phfi8g8cene5ektcco0rnac5ja2.apps.googleusercontent.com
   ```
4. Start backend server:
   ```bash
   npm start
   ```
5. API server runs locally on `http://localhost:5000`.

---

## 📡 Essential REST API Endpoints

- `POST /api/auth/google` — Authenticate user (Google OAuth / Demo Account)
- `GET /api/auth/me` — Get current user profile
- `GET /api/tasks` — Fetch user tasks (supports search & status filters)
- `POST /api/tasks` — Create new task
- `PATCH /api/tasks/:id/status` — Update status (`Planned`, `In Progress`, `Complete`)
- `PUT /api/tasks/:id` — Edit task details
- `DELETE /api/tasks/:id` — Delete task

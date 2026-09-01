# Nexus - Modern Authentication App

A clean, full-stack login and registration application built with Node.js, Express, SQLite, and a modern responsive frontend.

---

## 🚀 Features

- **Authentication**: User Registration, Login, and Profile session management with JWT and bcrypt hashing.
- **Frontend**: Clean dark mode UI, password visibility toggle, password strength meter, and forgot password modal.
- **Database**: SQLite database for persistent user storage.
- **Docker Support**: Pre-configured `Dockerfile` and `docker-compose.yml` for quick container deployment.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Authentication**: JSON Web Tokens (JWT), Bcrypt.js

---

## 💻 Quick Setup & Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the application**:
   ```bash
   npm start
   ```

3. Open your browser and go to: `http://localhost:3000`

---

## 🐳 Running with Docker

```bash
docker-compose up --build -d
```
App will be accessible at `http://localhost:80`.

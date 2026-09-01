# 🚀 AWS DevOps Full-Stack Login Application

A production-ready Full-Stack Login & Registration Application built for DevOps demonstration. It features Node.js Express backend, SQLite database, bcrypt password hashing, JWT authentication, Docker containerization, and automated CI/CD deployment to AWS EC2 using GitHub Actions.

---

## 📁 Project Structure

```text
Devops/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions CI/CD Deployment Workflow
├── data/                   # SQLite database persistent storage folder
├── public/                 # Frontend UI Assets
│   ├── index.html          # Login & Register UI HTML
│   ├── style.css           # Glassmorphism Styling & Responsive Layout
│   └── script.js           # AJAX Fetch, JWT Session & Auth Logic
├── .env.example            # Environment variables template
├── .gitignore              # Ignored files (node_modules, .env, DB)
├── db.js                   # SQLite Database initialization & User queries
├── server.js               # Express Server & REST API endpoints
├── Dockerfile              # Container build definition
├── docker-compose.yml      # Docker Compose orchestration setup
└── package.json            # Node.js dependencies
```

---

## 💻 1. Local Setup & Testing

### Option A: Running with Node.js
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open your browser and visit:
   - **Frontend App**: `http://localhost:3000`
   - **Health Check**: `http://localhost:3000/health`

### Option B: Running with Docker
1. Build and run container:
   ```bash
   docker-compose up --build -d
   ```
2. Access the application on `http://localhost:80`

---

## ☁️ 2. AWS EC2 & GitHub Actions Deployment Guide (Step-by-Step)

Follow these simple steps to deploy this application on AWS using GitHub Actions:

### Step 1: Launch an AWS EC2 Instance
1. Log in to your **AWS Management Console** and go to **EC2**.
2. Click **Launch Instance**:
   - **Name**: `devops-login-server`
   - **AMI**: Ubuntu Server 22.04 LTS (Free Tier eligible)
   - **Instance Type**: `t2.micro` (or `t3.micro`)
   - **Key Pair**: Create or select an existing `.pem` key pair (e.g., `my-aws-key.pem`).
3. **Network Settings (Security Group)**:
   Allow inbound traffic for:
   - `SSH` (Port `22`) -> My IP or Anywhere (`0.0.0.0/0`)
   - `HTTP` (Port `80`) -> Anywhere (`0.0.0.0/0`)
   - `Custom TCP` (Port `3000`) -> Anywhere (`0.0.0.0/0`)
4. Click **Launch Instance**.

---

### Step 2: Prepare your EC2 Instance (One-Time Setup)
SSH into your EC2 instance from your terminal:
```bash
ssh -i "path/to/your-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
```

Run these commands inside your EC2 terminal to install Docker & Git:
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker & Git
sudo apt install -y docker.io docker-compose git

# Enable Docker service
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu

# Create app directory
mkdir -p ~/app
cd ~/app
```

---

### Step 3: Push Code to your GitHub Repository
1. Initialize Git in this directory on your local machine:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Full-stack DevOps login app"
   ```
2. Create a new repository on GitHub (e.g., `devops-login-app`).
3. Link and push to GitHub:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/devops-login-app.git
   git push -u origin main
   ```

---

### Step 4: Configure GitHub Secrets for Automated Deployment
In your GitHub Repository:
1. Go to **Settings** -> **Secrets and variables** -> **Actions**.
2. Click **New repository secret** and add the following 3 secrets:

| Secret Name | Description / Value |
|---|---|
| `EC2_HOST` | Your EC2 Public IPv4 Address (e.g. `54.210.12.34`) |
| `EC2_USERNAME` | `ubuntu` |
| `EC2_SSH_KEY` | Entire content of your `.pem` SSH Private Key file (including `-----BEGIN RSA PRIVATE KEY-----`) |

---

### Step 5: Test Automated CI/CD Deployment
Whenever you push code changes to the `main` branch on GitHub:
1. GitHub Actions automatically runs `.github/workflows/deploy.yml`.
2. It builds and tests the app.
3. It connects to your AWS EC2 instance over SSH, builds the Docker container, and launches your app on Port 80!
4. Open `http://<YOUR_EC2_PUBLIC_IP>` in your browser to showcase your live AWS deployment! 🚀

---

## 🛡️ Features Included

- ✅ **Full-Stack Application**: Modern responsive Glassmorphism UI + Express REST API.
- ✅ **Database**: Persistent SQLite database with user registration, login, and profile lookup.
- ✅ **Security**: `bcryptjs` password hashing and JWT token authentication.
- ✅ **DevOps & Cloud Ready**: Includes `Dockerfile`, `docker-compose.yml`, `/health` endpoint for uptime monitoring, and GitHub Actions CI/CD pipeline for AWS EC2.

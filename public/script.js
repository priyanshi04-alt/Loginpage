// API Endpoints
const API_BASE = window.location.origin;

// DOM Elements
const authCard = document.getElementById('auth-card');
const dashboardCard = document.getElementById('dashboard-card');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const headerTitle = document.getElementById('header-title');
const headerSubtitle = document.getElementById('header-subtitle');
const alertBox = document.getElementById('alert-box');
const alertIcon = document.getElementById('alert-icon');
const alertMessage = document.getElementById('alert-message');

// On Page Load: Check authentication
document.addEventListener('DOMContentLoaded', () => {
  checkExistingSession();
  fetchServerHealth();
});

// Tab Switcher Function
function switchTab(tab) {
  hideAlert();
  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    headerTitle.textContent = 'Welcome Back';
    headerSubtitle.textContent = 'Sign in to access your secure DevOps dashboard';
  } else {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    headerTitle.textContent = 'Create Account';
    headerSubtitle.textContent = 'Register to join the DevOps demonstration portal';
  }
}

// Password Visibility Toggle
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fa-solid fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fa-solid fa-eye';
  }
}

// Show Alert Notification
function showAlert(message, type = 'error') {
  alertBox.className = `alert ${type}`;
  alertMessage.textContent = message;
  alertIcon.className = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation';
  alertBox.classList.remove('hidden');
}

// Hide Alert
function hideAlert() {
  alertBox.classList.add('hidden');
}

// Handle Login Submission
async function handleLogin(event) {
  event.preventDefault();
  hideAlert();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const loginBtn = document.getElementById('login-btn');

  try {
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

    const response = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      localStorage.setItem('devops_token', data.token);
      showAlert('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        showDashboard(data.user);
      }, 800);
    } else {
      showAlert(data.message || 'Invalid credentials.');
    }
  } catch (error) {
    showAlert('Unable to connect to backend server.');
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<span>Sign In</span><i class="fa-solid fa-arrow-right"></i>';
  }
}

// Handle Register Submission
async function handleRegister(event) {
  event.preventDefault();
  hideAlert();

  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const regBtn = document.getElementById('register-btn');

  try {
    regBtn.disabled = true;
    regBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';

    const response = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      localStorage.setItem('devops_token', data.token);
      showAlert('Account registered successfully!', 'success');
      setTimeout(() => {
        showDashboard(data.user);
      }, 800);
    } else {
      showAlert(data.message || 'Registration failed.');
    }
  } catch (error) {
    showAlert('Server error during registration.');
  } finally {
    regBtn.disabled = false;
    regBtn.innerHTML = '<span>Create Account</span><i class="fa-solid fa-user-check"></i>';
  }
}

// Check Existing Token
async function checkExistingSession() {
  const token = localStorage.getItem('devops_token');
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/api/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (response.ok && data.success) {
      showDashboard(data.user);
    } else {
      localStorage.removeItem('devops_token');
    }
  } catch (err) {
    console.error('Session validation error:', err);
  }
}

// Display Dashboard view
function showDashboard(user) {
  authCard.classList.add('hidden');
  dashboardCard.classList.remove('hidden');
  headerTitle.textContent = `Welcome, ${user.username}!`;
  headerSubtitle.textContent = 'AWS DevOps Authentication Session Active';

  document.getElementById('user-display-name').textContent = user.username;
  document.getElementById('user-display-email').textContent = user.email;
  hideAlert();
}

// Handle Logout
function handleLogout() {
  localStorage.removeItem('devops_token');
  dashboardCard.classList.add('hidden');
  authCard.classList.remove('hidden');
  switchTab('login');
  showAlert('Signed out successfully.', 'success');
}

// Fetch Health Endpoint
async function fetchServerHealth() {
  const healthBadge = document.getElementById('health-status');
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    if (response.ok && data.status === 'UP') {
      healthBadge.className = 'status-value success';
      healthBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> UP (${data.environment})`;
    } else {
      healthBadge.className = 'status-value error';
      healthBadge.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Down`;
    }
  } catch (err) {
    healthBadge.className = 'status-value error';
    healthBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Unreachable`;
  }
}

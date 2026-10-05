const API_BASE = window.location.origin;

// DOM Elements
const authContainer = document.getElementById('auth-container');
const authCard = document.getElementById('auth-card');
const userDashboardView = document.getElementById('user-dashboard-view');
const adminDashboardView = document.getElementById('admin-dashboard-view');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const btnLoginTab = document.getElementById('btn-login-tab');
const btnRegTab = document.getElementById('btn-reg-tab');
const formTitle = document.getElementById('form-title');
const formSubtitle = document.getElementById('form-subtitle');
const alertBanner = document.getElementById('alert-banner');
const alertText = document.getElementById('alert-text');
const forgotModal = document.getElementById('forgot-modal');
const addUserModal = document.getElementById('add-user-modal');
const usersTableBody = document.getElementById('users-table-body');
const totalUserCount = document.getElementById('total-user-count');
const themeIcon = document.getElementById('theme-icon');

// Initialize Theme & Forms on Page Load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  resetAuthForms();
  checkExistingSession();
});

// Theme Management (Light / Dark Mode)
function initTheme() {
  const savedTheme = localStorage.getItem('nexus_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('nexus_theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  if (themeIcon) {
    themeIcon.className = theme === 'dark' ? 'fa-regular fa-sun' : 'fa-regular fa-moon';
  }
}

// Reset Inputs to ensure 100% clean blank form on load
function resetAuthForms() {
  if (loginForm) loginForm.reset();
  if (registerForm) registerForm.reset();
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('reg-name').value = '';
  document.getElementById('reg-email').value = '';
  document.getElementById('reg-password').value = '';
}

// Switch Auth Tab
function switchAuthTab(tab) {
  hideBanner();
  resetAuthForms();
  if (tab === 'login') {
    btnLoginTab.classList.add('active');
    btnRegTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    formTitle.textContent = 'Welcome back';
    formSubtitle.textContent = 'Enter your credentials to access your account';
  } else {
    btnRegTab.classList.add('active');
    btnLoginTab.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    formTitle.textContent = 'Create an account';
    formSubtitle.textContent = 'Start your 14-day free trial, no credit card required';
  }
}

// Password Visibility Toggle
function togglePassVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fa-regular fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fa-regular fa-eye';
  }
}

// Password Strength Meter
function checkPasswordStrength(val) {
  const bar = document.getElementById('strength-bar');
  const label = document.getElementById('strength-label');
  if (!val) {
    bar.style.width = '0%';
    label.textContent = '';
    return;
  }

  let score = 0;
  if (val.length >= 6) score += 25;
  if (val.length >= 10) score += 25;
  if (/[A-Z]/.test(val)) score += 25;
  if (/[0-9!@#$%^&*]/.test(val)) score += 25;

  bar.style.width = `${score}%`;
  if (score <= 25) {
    bar.style.backgroundColor = '#f43f5e';
    label.textContent = 'Weak password';
    label.style.color = '#fb7185';
  } else if (score <= 75) {
    bar.style.backgroundColor = '#f59e0b';
    label.textContent = 'Medium strength';
    label.style.color = '#fbbf24';
  } else {
    bar.style.backgroundColor = '#10b981';
    label.textContent = 'Strong password';
    label.style.color = '#34d399';
  }
}

// Alert Notification Banner
function showBanner(message, type = 'error') {
  alertBanner.className = `alert-banner ${type}`;
  alertText.textContent = message;
  alertBanner.classList.remove('hidden');
}

function hideBanner() {
  alertBanner.classList.add('hidden');
}

// Forgot Password Modal
function openForgotModal(e) {
  if (e) e.preventDefault();
  forgotModal.classList.remove('hidden');
}

function closeForgotModal() {
  forgotModal.classList.add('hidden');
}

function handleResetRequest(e) {
  e.preventDefault();
  const email = document.getElementById('reset-email').value;
  closeForgotModal();
  showBanner(`Password reset instructions sent to ${email}`, 'success');
}

// Login Submission
async function onLoginSubmit(event) {
  event.preventDefault();
  hideBanner();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const rememberMe = document.getElementById('remember-me').checked;
  const submitBtn = document.getElementById('login-submit-btn');

  if (!email || !password) {
    showBanner('Please fill in all fields.');
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sign in...';

    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      localStorage.setItem('auth_token', data.token);
      showBanner('Welcome back! Redirecting...', 'success');
      setTimeout(() => {
        renderRoleDashboard(data.user);
      }, 500);
    } else {
      showBanner(data.message || 'Invalid email or password.');
    }
  } catch (err) {
    showBanner('Unable to connect to server.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Sign in</span><i class="fa-solid fa-arrow-right text-xs"></i>';
  }
}

// Register Submission
async function onRegisterSubmit(event) {
  event.preventDefault();
  hideBanner();

  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const submitBtn = document.getElementById('reg-submit-btn');

  if (!name || !email || !password) {
    showBanner('Please fill in all required fields.');
    return;
  }

  if (password.length < 6) {
    showBanner('Password must be at least 6 characters.');
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating account...';

    const res = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: name, email, password })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      localStorage.setItem('auth_token', data.token);
      showBanner('Account created successfully!', 'success');
      setTimeout(() => {
        renderRoleDashboard(data.user);
      }, 500);
    } else {
      showBanner(data.message || 'Registration failed.');
    }
  } catch (err) {
    showBanner('Server error during registration.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Create account</span><i class="fa-solid fa-user-plus text-xs"></i>';
  }
}

// Session Check
async function checkExistingSession() {
  const token = localStorage.getItem('auth_token');
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (res.ok && data.success) {
      renderRoleDashboard(data.user);
    } else {
      localStorage.removeItem('auth_token');
    }
  } catch (err) {
    console.error('Session check failed:', err);
  }
}

// Render Dashboard based on User Role
function renderRoleDashboard(user) {
  authContainer.classList.add('hidden');
  hideBanner();

  const initials = user.username.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';

  if (user.role === 'admin') {
    userDashboardView.classList.add('hidden');
    adminDashboardView.classList.remove('hidden');

    document.getElementById('admin-avatar-initials').textContent = initials;
    document.getElementById('admin-dash-name').textContent = user.username;
    document.getElementById('admin-dash-email').textContent = user.email;

    fetchAdminUsers();
  } else {
    adminDashboardView.classList.add('hidden');
    userDashboardView.classList.remove('hidden');

    document.getElementById('user-avatar-initials').textContent = initials;
    document.getElementById('user-dash-name').textContent = user.username;
    document.getElementById('user-dash-email').textContent = user.email;
  }
}

// Fetch Admin Users List
async function fetchAdminUsers() {
  const token = localStorage.getItem('auth_token');
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (res.ok && data.success) {
      renderUsersTable(data.users);
    } else {
      usersTableBody.innerHTML = `<tr><td colspan="3" class="loading-td">Unable to load users.</td></tr>`;
    }
  } catch (err) {
    console.error('Fetch Admin Users Error:', err);
  }
}

// Render Users in Table
function renderUsersTable(users) {
  totalUserCount.textContent = `${users.length} ${users.length === 1 ? 'User' : 'Users'}`;

  if (!users || users.length === 0) {
    usersTableBody.innerHTML = `<tr><td colspan="3" class="loading-td">No registered users found.</td></tr>`;
    return;
  }

  usersTableBody.innerHTML = users.map(u => `
    <tr>
      <td>
        <div class="user-name-cell">
          <span>${escapeHtml(u.username)}</span>
          <span class="user-email-sub">${escapeHtml(u.email)}</span>
        </div>
      </td>
      <td>
        <span class="role-tag ${u.role || 'user'}">${escapeHtml(u.role || 'user')}</span>
      </td>
      <td class="text-right">
        <button type="button" class="btn-delete-user" onclick="handleDeleteUser(${u.id})" title="Remove User">
          <i class="fa-regular fa-trash-can"></i> Remove
        </button>
      </td>
    </tr>
  `).join('');
}

// Delete User Action
async function handleDeleteUser(userId) {
  if (!confirm('Are you sure you want to remove this user from database?')) return;

  const token = localStorage.getItem('auth_token');
  try {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (res.ok && data.success) {
      fetchAdminUsers();
    } else {
      alert(data.message || 'Error deleting user.');
    }
  } catch (err) {
    alert('Server error while deleting user.');
  }
}

// Add User Modal Handlers
function openAddUserModal() {
  addUserModal.classList.remove('hidden');
}

function closeAddUserModal() {
  addUserModal.classList.add('hidden');
}

async function handleAdminAddUser(e) {
  e.preventDefault();
  const username = document.getElementById('admin-add-name').value.trim();
  const email = document.getElementById('admin-add-email').value.trim();
  const password = document.getElementById('admin-add-password').value;
  const role = document.getElementById('admin-add-role').value;
  const token = localStorage.getItem('auth_token');

  try {
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ username, email, password, role })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      closeAddUserModal();
      document.getElementById('admin-add-name').value = '';
      document.getElementById('admin-add-email').value = '';
      document.getElementById('admin-add-password').value = '';
      fetchAdminUsers();
    } else {
      alert(data.message || 'Failed to add user.');
    }
  } catch (err) {
    alert('Server error while adding user.');
  }
}

// Utility: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Logout
function handleLogout() {
  localStorage.removeItem('auth_token');
  userDashboardView.classList.add('hidden');
  adminDashboardView.classList.add('hidden');
  authContainer.classList.remove('hidden');
  switchAuthTab('login');
  resetAuthForms();
  showBanner('Signed out successfully.', 'success');
}

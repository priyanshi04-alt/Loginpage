const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'data', 'users.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let dbInstance = null;

try {
  const { DatabaseSync } = require('node:sqlite');
  dbInstance = new DatabaseSync(dbPath);
  console.log('✅ Native SQLite connected at:', dbPath);
} catch (e) {
  console.log('⚠️ Native node:sqlite not available, falling back to persistent JSON database.');
}

// Initialize database schema and seed default Admin account
async function initDB() {
  try {
    if (dbInstance) {
      dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      try {
        dbInstance.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';`);
      } catch (e) {
        // Column already exists
      }
    } else {
      const jsonPath = dbPath + '.json';
      if (!fs.existsSync(jsonPath)) {
        fs.writeFileSync(jsonPath, JSON.stringify([]));
      }
    }

    // Seed default Admin Account: admin@nexus.com / admin123
    await seedAdminAccount();
    console.log('✅ Database and Admin account initialized.');
  } catch (err) {
    console.error('❌ Failed to initialize users database:', err);
    throw err;
  }
}

// Seed Admin Account
async function seedAdminAccount() {
  const adminEmail = 'admin@nexus.com';
  const existingAdmin = await findUserByEmail(adminEmail);

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await createUser({
      username: 'Nexus Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });
    console.log('👑 Default Admin account created: admin@nexus.com / admin123');
  }
}

// Find user by email
function findUserByEmail(email) {
  return new Promise((resolve, reject) => {
    try {
      if (dbInstance) {
        const stmt = dbInstance.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
        const user = stmt.get(email);
        resolve(user || null);
      } else {
        const jsonPath = dbPath + '.json';
        const users = JSON.parse(fs.readFileSync(jsonPath, 'utf8') || '[]');
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        resolve(user || null);
      }
    } catch (err) {
      reject(err);
    }
  });
}

// Find user by ID
function findUserById(id) {
  return new Promise((resolve, reject) => {
    try {
      if (dbInstance) {
        const stmt = dbInstance.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?');
        const user = stmt.get(id);
        resolve(user || null);
      } else {
        const jsonPath = dbPath + '.json';
        const users = JSON.parse(fs.readFileSync(jsonPath, 'utf8') || '[]');
        const user = users.find(u => u.id === Number(id));
        if (user) {
          const { password, ...safeUser } = user;
          resolve(safeUser);
        } else {
          resolve(null);
        }
      }
    } catch (err) {
      reject(err);
    }
  });
}

// Create new user
function createUser({ username, email, password, role = 'user' }) {
  return new Promise((resolve, reject) => {
    try {
      if (dbInstance) {
        const stmt = dbInstance.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)');
        const info = stmt.run(username, email, password, role);
        resolve({ id: Number(info.lastInsertRowid), username, email, role });
      } else {
        const jsonPath = dbPath + '.json';
        const users = JSON.parse(fs.readFileSync(jsonPath, 'utf8') || '[]');
        const newUser = { id: Date.now(), username, email, password, role, created_at: new Date().toISOString() };
        users.push(newUser);
        fs.writeFileSync(jsonPath, JSON.stringify(users, null, 2));
        resolve({ id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role });
      }
    } catch (err) {
      reject(err);
    }
  });
}

// Admin: Get all registered users
function getAllUsers() {
  return new Promise((resolve, reject) => {
    try {
      if (dbInstance) {
        const stmt = dbInstance.prepare('SELECT id, username, email, role, created_at FROM users ORDER BY id DESC');
        const users = stmt.all();
        resolve(users || []);
      } else {
        const jsonPath = dbPath + '.json';
        const users = JSON.parse(fs.readFileSync(jsonPath, 'utf8') || '[]');
        const safeUsers = users.map(({ password, ...u }) => u);
        resolve(safeUsers);
      }
    } catch (err) {
      reject(err);
    }
  });
}

// Admin: Delete user by ID
function deleteUserById(id) {
  return new Promise((resolve, reject) => {
    try {
      if (dbInstance) {
        const stmt = dbInstance.prepare('DELETE FROM users WHERE id = ?');
        stmt.run(id);
        resolve({ success: true });
      } else {
        const jsonPath = dbPath + '.json';
        let users = JSON.parse(fs.readFileSync(jsonPath, 'utf8') || '[]');
        users = users.filter(u => u.id !== Number(id));
        fs.writeFileSync(jsonPath, JSON.stringify(users, null, 2));
        resolve({ success: true });
      }
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  initDB,
  findUserByEmail,
  findUserById,
  createUser,
  getAllUsers,
  deleteUserById
};

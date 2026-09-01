const path = require('path');
const fs = require('fs');

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

// Initialize database schema
function initDB() {
  return new Promise((resolve, reject) => {
    try {
      if (dbInstance) {
        dbInstance.exec(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } else {
        const jsonPath = dbPath + '.json';
        if (!fs.existsSync(jsonPath)) {
          fs.writeFileSync(jsonPath, JSON.stringify([]));
        }
      }
      console.log('✅ Users database ready.');
      resolve();
    } catch (err) {
      console.error('❌ Failed to initialize users database:', err);
      reject(err);
    }
  });
}

// Find user by email
function findUserByEmail(email) {
  return new Promise((resolve, reject) => {
    try {
      if (dbInstance) {
        const stmt = dbInstance.prepare('SELECT * FROM users WHERE email = ?');
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
        const stmt = dbInstance.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?');
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
function createUser({ username, email, password }) {
  return new Promise((resolve, reject) => {
    try {
      if (dbInstance) {
        const stmt = dbInstance.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
        const info = stmt.run(username, email, password);
        resolve({ id: Number(info.lastInsertRowid), username, email });
      } else {
        const jsonPath = dbPath + '.json';
        const users = JSON.parse(fs.readFileSync(jsonPath, 'utf8') || '[]');
        const newUser = { id: Date.now(), username, email, password, created_at: new Date().toISOString() };
        users.push(newUser);
        fs.writeFileSync(jsonPath, JSON.stringify(users, null, 2));
        resolve({ id: newUser.id, username: newUser.username, email: newUser.email });
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
  createUser
};

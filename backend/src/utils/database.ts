import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
export const initializeDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          username TEXT UNIQUE NOT NULL,
          displayName TEXT NOT NULL,
          password TEXT NOT NULL,
          userType TEXT CHECK(userType IN ('influencer', 'fan')) NOT NULL,
          avatar TEXT,
          bio TEXT,
          socialLinks TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Virtual Spaces table
      db.run(`
        CREATE TABLE IF NOT EXISTS virtual_spaces (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          template TEXT NOT NULL,
          customization TEXT NOT NULL,
          isPublic BOOLEAN DEFAULT 1,
          visitCount INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users (id)
        )
      `);

      // Chat Messages table
      db.run(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          spaceId INTEGER NOT NULL,
          userId INTEGER,
          username TEXT NOT NULL,
          message TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (spaceId) REFERENCES virtual_spaces (id),
          FOREIGN KEY (userId) REFERENCES users (id)
        )
      `);

      // Reactions table
      db.run(`
        CREATE TABLE IF NOT EXISTS reactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          spaceId INTEGER NOT NULL,
          userId INTEGER,
          type TEXT CHECK(type IN ('like', 'love', 'wow', 'applause')) NOT NULL,
          targetType TEXT CHECK(targetType IN ('space', 'content', 'object')) NOT NULL,
          targetId TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (spaceId) REFERENCES virtual_spaces (id),
          FOREIGN KEY (userId) REFERENCES users (id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database tables initialized successfully');
          resolve();
        }
      });
    });
  });
};

export default db; 
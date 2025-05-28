"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = process.env.DATABASE_URL || path_1.default.join(__dirname, '../../database.sqlite');
const db = new sqlite3_1.default.Database(dbPath);
// Initialize database tables
const initializeDatabase = () => {
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
                }
                else {
                    console.log('✅ Database tables initialized successfully');
                    resolve();
                }
            });
        });
    });
};
exports.initializeDatabase = initializeDatabase;
exports.default = db;
//# sourceMappingURL=database.js.map
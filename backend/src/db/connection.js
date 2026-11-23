const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
require('dotenv').config();

const dbPath = path.resolve(__dirname, '../../', process.env.DB_PATH || './data/reservas.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('foreign_keys = ON'); // sin esto SQLite ignora las llaves foráneas
db.pragma('journal_mode = WAL');

module.exports = db;

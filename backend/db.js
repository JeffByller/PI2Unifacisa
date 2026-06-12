const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`, (err) => {
            if (err) {
                console.log('Erro ao criar tabela users:', err);
            } else {
                db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
                    if (!row) {
                        const bcrypt = require('bcryptjs');
                        const hash = bcrypt.hashSync('admin123', 10);
                        db.run("INSERT INTO users (username, password) VALUES ('admin', ?)", [hash]);
                    }
                });
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT,
            completed BOOLEAN,
            status TEXT DEFAULT 'todo',
            priorityColor TEXT,
            createdAt TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )`, (err) => {
            if (err) {
                console.log('Erro ao criar tabela settings:', err);
            } else {
                db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('version', 'v1.0.0')");
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS kanban_columns (
            id TEXT PRIMARY KEY,
            status TEXT UNIQUE,
            name TEXT,
            position INTEGER
        )`);
    }
});

module.exports = db;

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

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
                        const bcrypt = require('bcrypt');
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
    }
});

module.exports = db;

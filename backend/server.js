const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta frontend
app.use(express.static(path.join(__dirname, '../frontend')));

const PORT = 3000;

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });

        const match = bcrypt.compareSync(password, user.password);
        if (match) {
            res.json({ message: 'Login bem-sucedido', token: 'fake-jwt-token-123' });
        } else {
            res.status(401).json({ error: 'Senha incorreta' });
        }
    });
});

app.get('/api/tasks', (req, res) => {
    db.all("SELECT * FROM tasks", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const tasks = rows.map(t => ({...t, completed: t.completed === 1}));
        res.json(tasks);
    });
});

app.post('/api/tasks', (req, res) => {
    const { id, title, completed, status, priorityColor, createdAt } = req.body;
    const isCompleted = completed ? 1 : 0;
    const taskStatus = status || 'todo';
    
    db.run(
        "INSERT INTO tasks (id, title, completed, status, priorityColor, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
        [id, title, isCompleted, taskStatus, priorityColor, createdAt],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id, title, completed: !!isCompleted, status: taskStatus, priorityColor, createdAt });
        }
    );
});

app.put('/api/tasks/:id', (req, res) => {
    const { completed, status, title, priorityColor } = req.body;
    const isCompleted = completed ? 1 : 0;
    
    db.run(
        "UPDATE tasks SET completed = ?, status = ?, title = ?, priorityColor = ? WHERE id = ?",
        [isCompleted, status, title, priorityColor, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        }
    );
});

app.delete('/api/tasks/:id', (req, res) => {
    db.run("DELETE FROM tasks WHERE id = ?", req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

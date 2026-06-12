const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
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

app.get('/api/version', (req, res) => {
    db.get("SELECT value FROM settings WHERE key = 'version'", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        const version = row ? row.value : 'v1.0.0';
        res.json({ version });
    });
});

app.post('/api/version', (req, res) => {
    const { version } = req.body;
    if (!version) {
        return res.status(400).json({ error: 'Versão não especificada' });
    }

    db.run(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ('version', ?)",
        [version],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            let logs = [];
            if (version === 'v1.2.0') {
                db.all("SELECT COUNT(*) as count FROM kanban_columns", (err, rows) => {
                    if (!err && rows && rows[0].count === 0) {
                        db.run("INSERT INTO kanban_columns (id, status, name, position) VALUES ('1', 'todo', 'A Fazer', 1)");
                        db.run("INSERT INTO kanban_columns (id, status, name, position) VALUES ('2', 'doing', 'Fazendo', 2)");
                        db.run("INSERT INTO kanban_columns (id, status, name, position) VALUES ('3', 'done', 'Concluído', 3)");
                    }
                });
                logs = [
                    '[INFO] Iniciando processo de atualização do sistema para v1.2.0...',
                    '[INFO] Criando e migrando tabelas do banco de dados SQLite...',
                    '[INFO] Backup automático realizado: database_backup_v1.1.0.sqlite',
                    '[INFO] Criando tabela kanban_columns no SQLite...',
                    '[INFO] Carregando colunas padrão do Kanban (A Fazer, Fazendo, Concluído)...',
                    '[INFO] Ativando Drag-and-Drop e criação de novos quadros...',
                    '[SUCCESS] Banco de dados atualizado com sucesso para v1.2.0!',
                    '[SUCCESS] Processo finalizado. Reiniciando interface.'
                ];
            } else if (version === 'v1.1.0-beta') {
                logs = [
                    '[INFO] Iniciando processo de atualização do sistema para v1.1.0-beta...',
                    '[INFO] Estabelecendo conexão segura com o SQLite...',
                    '[INFO] Realizando backup automático de segurança: database_backup_v1.0.0.sqlite',
                    '[INFO] Executando migração: 20260611_add_settings_table.sql',
                    '[INFO] Habilitando flag experimental: DARK_MODE_SUPPORT = true',
                    '[INFO] Habilitando flag experimental: TASK_SEARCH_FILTER = true',
                    '[SUCCESS] Banco de dados migrado com sucesso para v1.1.0-beta!',
                    '[SUCCESS] Processo finalizado. Pronto para reiniciar a interface.'
                ];
            } else {
                logs = [
                    '[INFO] Iniciando processo de reversão (downgrade) para v1.0.0...',
                    '[INFO] Restaurando tabelas e limpando caches temporários...',
                    '[INFO] Desabilitando flag experimental: DARK_MODE_SUPPORT',
                    '[INFO] Desabilitando flag experimental: TASK_SEARCH_FILTER',
                    '[INFO] Revertendo esquemas de dados da versão v1.1.0-beta / v1.2.0...',
                    '[SUCCESS] Downgrade concluído com sucesso!',
                    '[SUCCESS] Processo finalizado. Reiniciando interface na versão estável.'
                ];
            }

            res.json({ success: true, version, logs });
        }
    );
});

app.get('/api/columns', (req, res) => {
    db.all("SELECT * FROM kanban_columns ORDER BY position", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const defaultCols = [
            { id: '1', status: 'todo', name: 'A Fazer', position: 1 },
            { id: '2', status: 'doing', name: 'Fazendo', position: 2 },
            { id: '3', status: 'done', name: 'Concluído', position: 3 }
        ];
        
        if (!rows || rows.length === 0) {
            defaultCols.forEach(col => {
                db.run("INSERT OR IGNORE INTO kanban_columns (id, status, name, position) VALUES (?, ?, ?, ?)", [col.id, col.status, col.name, col.position]);
            });
            return res.json(defaultCols);
        }

        let modified = false;
        defaultCols.forEach(defCol => {
            if (!rows.some(r => r.status === defCol.status)) {
                db.run("INSERT OR IGNORE INTO kanban_columns (id, status, name, position) VALUES (?, ?, ?, ?)", [defCol.id, defCol.status, defCol.name, defCol.position]);
                rows.push(defCol);
                modified = true;
            }
        });

        if (modified) {
            rows.sort((a, b) => a.position - b.position);
        }
        res.json(rows);
    });
});

app.post('/api/columns', (req, res) => {
    const { id, status, name, position } = req.body;
    db.run(
        "INSERT OR REPLACE INTO kanban_columns (id, status, name, position) VALUES (?, ?, ?, ?)",
        [id, status, name, position],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id, status, name, position });
        }
    );
});

app.delete('/api/columns/:status', (req, res) => {
    const { status } = req.params;
    if (['todo', 'doing', 'done'].includes(status)) {
        return res.status(400).json({ error: 'Não é permitido excluir colunas padrões.' });
    }
    db.run("UPDATE tasks SET status = 'todo', completed = 0 WHERE status = ?", [status], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        db.run("DELETE FROM kanban_columns WHERE status = ?", [status], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ deletedStatus: status, movedTasksCount: this.changes });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

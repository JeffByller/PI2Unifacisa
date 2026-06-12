document.addEventListener('DOMContentLoaded', async () => {
    const boardElement = document.getElementById('kanban-board-element');

    let tasks = [];
    let columns = [];

    function saveToLocal() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadFromLocal() {
        const stored = localStorage.getItem('tasks');
        tasks = stored ? JSON.parse(stored) : [];
    }

    async function fetchColumns() {
        const isOffline = localStorage.getItem('offline_mode') === 'true';
        const isV12 = document.body.classList.contains('version-v1_2_0') || localStorage.getItem('system_version') === 'v1.2.0';
        
        if (!isV12) {
            columns = [
                { id: '1', status: 'todo', name: 'A Fazer', position: 1 },
                { id: '2', status: 'doing', name: 'Fazendo', position: 2 },
                { id: '3', status: 'done', name: 'Concluído', position: 3 }
            ];
            return;
        }

        if (isOffline) {
            const stored = localStorage.getItem('kanban_columns');
            columns = stored ? JSON.parse(stored) : [
                { id: '1', status: 'todo', name: 'A Fazer', position: 1 },
                { id: '2', status: 'doing', name: 'Fazendo', position: 2 },
                { id: '3', status: 'done', name: 'Concluído', position: 3 }
            ];
            return;
        }

        try {
            const res = await fetch(`${window.API_URL}/columns`);
            if (res.ok) {
                columns = await res.json();
                localStorage.setItem('kanban_columns', JSON.stringify(columns));
            } else {
                throw new Error('Server columns query failed');
            }
        } catch (err) {
            console.warn('Erro ao buscar colunas do back-end, usando locais...', err);
            const stored = localStorage.getItem('kanban_columns');
            columns = stored ? JSON.parse(stored) : [
                { id: '1', status: 'todo', name: 'A Fazer', position: 1 },
                { id: '2', status: 'doing', name: 'Fazendo', position: 2 },
                { id: '3', status: 'done', name: 'Concluído', position: 3 }
            ];
        }
    }

    async function fetchTasks() {
        const isOffline = localStorage.getItem('offline_mode') === 'true';
        if (isOffline) {
            console.log('Modo offline ativo no Kanban. Carregando do localStorage...');
            loadFromLocal();
            renderKanban();
            return;
        }

        try {
            const res = await fetch(`${window.API_URL}/tasks`);
            if (res.ok) {
                tasks = await res.json();
                saveToLocal();
                renderKanban();
            } else {
                throw new Error('Resposta do servidor não foi ok');
            }
        } catch (err) {
            console.warn('Erro de conexão no Kanban, mudando para modo offline...', err);
            localStorage.setItem('offline_mode', 'true');
            loadFromLocal();
            renderKanban();
        }
    }

    window.moveTask = async function(id, newStatus) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.status = newStatus;
            task.completed = (newStatus === 'done'); // Sincroniza estado de completado
            
            saveToLocal();
            renderKanban();

            const isOffline = localStorage.getItem('offline_mode') === 'true';
            if (!isOffline) {
                try {
                    const res = await fetch(`${window.API_URL}/tasks/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(task)
                    });
                    if (!res.ok) throw new Error('Falha ao mover no back-end');
                } catch (err) {
                    console.warn('Erro ao mover no back-end, mudando para modo offline...', err);
                    localStorage.setItem('offline_mode', 'true');
                }
            }
        }
    };

    window.deleteTask = async function(id, btnElement) {
        const card = btnElement.closest('.kanban-card');
        if(card) card.style.opacity = '0'; // Simples fade out

        setTimeout(async () => {
            tasks = tasks.filter(t => t.id !== id);
            saveToLocal();
            renderKanban();

            const isOffline = localStorage.getItem('offline_mode') === 'true';
            if (!isOffline) {
                try {
                    const res = await fetch(`${window.API_URL}/tasks/${id}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Falha ao deletar no back-end');
                } catch (err) {
                    console.warn('Erro ao deletar no back-end, mudando para modo offline...', err);
                    localStorage.setItem('offline_mode', 'true');
                }
            }
        }, 300);
    };

    window.deleteColumn = async function(status) {
        if (confirm('Tem certeza que deseja excluir esta coluna? As tarefas serão movidas para "A Fazer".')) {
            const isOffline = localStorage.getItem('offline_mode') === 'true';
            
            tasks.forEach(t => {
                if (t.status === status) {
                    t.status = 'todo';
                    t.completed = false;
                }
            });
            columns = columns.filter(c => c.status !== status);
            
            saveToLocal();
            localStorage.setItem('kanban_columns', JSON.stringify(columns));
            renderKanban();

            if (!isOffline) {
                try {
                    const res = await fetch(`${window.API_URL}/columns/${status}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error();
                } catch (err) {
                    console.warn('Erro ao deletar coluna no backend, migrando para offline...');
                    localStorage.setItem('offline_mode', 'true');
                }
            }
        }
    };

    function renderKanban() {
        if (!boardElement) return;
        boardElement.innerHTML = '';

        const isV12 = document.body.classList.contains('version-v1_2_0') || localStorage.getItem('system_version') === 'v1.2.0';

        columns.forEach(col => {
            const columnDiv = document.createElement('div');
            columnDiv.className = 'kanban-column';
            columnDiv.setAttribute('data-status', col.status);

            const headerDiv = document.createElement('div');
            headerDiv.className = 'column-header';

            const isDefault = ['todo', 'doing', 'done'].includes(col.status);
            let deleteBtnHtml = '';
            if (isV12 && !isDefault) {
                deleteBtnHtml = `<button class="btn-delete-column" onclick="deleteColumn('${col.status}')" title="Excluir Coluna">&times;</button>`;
            }

            headerDiv.innerHTML = `
                <span>${window.escapeHTML(col.name)}</span>
                ${deleteBtnHtml}
            `;
            columnDiv.appendChild(headerDiv);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'column-content';
            contentDiv.id = `col-${col.status}`;

            if (isV12) {
                contentDiv.addEventListener('dragover', e => {
                    e.preventDefault();
                    contentDiv.classList.add('drag-over');
                });
                contentDiv.addEventListener('dragenter', e => {
                    e.preventDefault();
                    contentDiv.classList.add('drag-over');
                });
                contentDiv.addEventListener('dragleave', () => {
                    contentDiv.classList.remove('drag-over');
                });
                contentDiv.addEventListener('drop', async e => {
                    e.preventDefault();
                    contentDiv.classList.remove('drag-over');
                    const taskId = e.dataTransfer.getData('text/plain');
                    if (taskId) {
                        await window.moveTask(taskId, col.status);
                    }
                });
            }

            columnDiv.appendChild(contentDiv);
            boardElement.appendChild(columnDiv);
        });

        tasks.forEach(task => {
            const colContent = document.getElementById(`col-${task.status}`);
            if (!colContent) return;

            const card = document.createElement('div');
            card.className = 'kanban-card';
            card.style.setProperty('--task-color', task.priorityColor);

            if (isV12) {
                card.setAttribute('draggable', 'true');
                card.addEventListener('dragstart', e => {
                    e.dataTransfer.setData('text/plain', task.id);
                    card.classList.add('dragging');
                });
                card.addEventListener('dragend', () => {
                    card.classList.remove('dragging');
                });
            }

            let actionsHTML = '<div class="kanban-actions">';
            if (isV12) {
                actionsHTML += `<button class="btn-move" style="background: rgba(239, 68, 68, 0.2); color: #ef4444;" onclick="deleteTask('${task.id}', this)">Excluir</button>`;
            } else {
                if (task.status === 'todo') {
                    actionsHTML += `<button class="btn-move" onclick="moveTask('${task.id}', 'doing')">Iniciar</button>`;
                } else if (task.status === 'doing') {
                    actionsHTML += `<button class="btn-move" onclick="moveTask('${task.id}', 'todo')">A Fazer</button>`;
                    actionsHTML += `<button class="btn-move" onclick="moveTask('${task.id}', 'done')">Concluir</button>`;
                } else if (task.status === 'done') {
                    actionsHTML += `<button class="btn-move" onclick="moveTask('${task.id}', 'doing')">Voltar</button>`;
                    actionsHTML += `<button class="btn-move" style="background: rgba(239, 68, 68, 0.2); color: #ef4444;" onclick="deleteTask('${task.id}', this)">Excluir</button>`;
                }
            }
            actionsHTML += '</div>';

            card.innerHTML = `
                <div class="kanban-card-title">${window.escapeHTML(task.title)}</div>
                <div class="kanban-card-date">${window.formatDate(task.createdAt)}</div>
                ${actionsHTML}
            `;

            colContent.appendChild(card);
        });
    }

    // Bind Column Add UI elements
    const addColumnBtn = document.getElementById('add-column-btn');
    const addColumnForm = document.getElementById('add-column-form');
    const newColumnTitle = document.getElementById('new-column-title');
    const saveColumnBtn = document.getElementById('save-column-btn');
    const cancelColumnBtn = document.getElementById('cancel-column-btn');

    if (addColumnBtn) {
        addColumnBtn.addEventListener('click', () => {
            addColumnBtn.classList.add('hidden');
            addColumnForm.classList.remove('hidden');
            newColumnTitle.focus();
        });
    }

    if (cancelColumnBtn) {
        cancelColumnBtn.addEventListener('click', () => {
            addColumnForm.classList.add('hidden');
            addColumnBtn.classList.remove('hidden');
            newColumnTitle.value = '';
        });
    }

    if (saveColumnBtn) {
        saveColumnBtn.addEventListener('click', async () => {
            const name = newColumnTitle.value.trim();
            if (!name) return;

            const status = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

            if (columns.some(c => c.status === status)) {
                alert('Já existe uma coluna com esse nome.');
                return;
            }

            const newCol = {
                id: window.generateUUID(),
                status,
                name,
                position: columns.length + 1
            };

            columns.push(newCol);
            localStorage.setItem('kanban_columns', JSON.stringify(columns));

            addColumnForm.classList.add('hidden');
            addColumnBtn.classList.remove('hidden');
            newColumnTitle.value = '';

            renderKanban();

            const isOffline = localStorage.getItem('offline_mode') === 'true';
            if (!isOffline) {
                try {
                    const res = await fetch(`${window.API_URL}/columns`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newCol)
                    });
                    if (!res.ok) throw new Error();
                } catch (err) {
                    console.warn('Erro ao salvar coluna no backend, migrando para offline...');
                    localStorage.setItem('offline_mode', 'true');
                }
            }
        });
    }

    // Init data fetching
    await fetchColumns();
    await fetchTasks();
});

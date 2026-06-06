document.addEventListener('DOMContentLoaded', () => {
    const colTodo = document.getElementById('col-todo');
    const colDoing = document.getElementById('col-doing');
    const colDone = document.getElementById('col-done');

    let tasks = [];

    function saveToLocal() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadFromLocal() {
        const stored = localStorage.getItem('tasks');
        tasks = stored ? JSON.parse(stored) : [];
        renderKanban();
    }

    async function fetchTasks() {
        const isOffline = localStorage.getItem('offline_mode') === 'true';
        if (isOffline) {
            console.log('Modo offline ativo no Kanban. Carregando do localStorage...');
            loadFromLocal();
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

    function renderKanban() {
        if (!colTodo || !colDoing || !colDone) return;
        
        colTodo.innerHTML = '';
        colDoing.innerHTML = '';
        colDone.innerHTML = '';

        tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'kanban-card';
            card.style.setProperty('--task-color', task.priorityColor);
            
            let actionsHTML = '<div class="kanban-actions">';
            if (task.status === 'todo') {
                actionsHTML += `<button class="btn-move" onclick="moveTask('${task.id}', 'doing')">Iniciar</button>`;
            } else if (task.status === 'doing') {
                actionsHTML += `<button class="btn-move" onclick="moveTask('${task.id}', 'todo')">A Fazer</button>`;
                actionsHTML += `<button class="btn-move" onclick="moveTask('${task.id}', 'done')">Concluir</button>`;
            } else if (task.status === 'done') {
                actionsHTML += `<button class="btn-move" onclick="moveTask('${task.id}', 'doing')">Voltar</button>`;
                actionsHTML += `<button class="btn-move" style="background: rgba(239, 68, 68, 0.2); color: #ef4444;" onclick="deleteTask('${task.id}', this)">Excluir</button>`;
            }
            actionsHTML += '</div>';

            card.innerHTML = `
                <div class="kanban-card-title">${window.escapeHTML(task.title)}</div>
                <div class="kanban-card-date">${window.formatDate(task.createdAt)}</div>
                ${actionsHTML}
            `;

            if (task.status === 'todo') colTodo.appendChild(card);
            else if (task.status === 'doing') colDoing.appendChild(card);
            else colDone.appendChild(card);
        });
    }

    // Init fetch
    fetchTasks();
});

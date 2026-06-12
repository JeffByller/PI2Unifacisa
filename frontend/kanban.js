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
        
        const defaultCols = [
            { id: '1', status: 'todo', name: 'A Fazer', position: 1 },
            { id: '2', status: 'doing', name: 'Fazendo', position: 2 },
            { id: '3', status: 'done', name: 'Concluído', position: 3 }
        ];

        function healColumns(cols) {
            let healed = false;
            defaultCols.forEach(defCol => {
                if (!cols.some(c => c.status === defCol.status)) {
                    cols.push(defCol);
                    healed = true;
                }
            });
            if (healed) {
                cols.sort((a, b) => a.position - b.position);
            }
            return healed;
        }

        if (!isV12) {
            columns = defaultCols;
            return;
        }

        if (isOffline) {
            const stored = localStorage.getItem('kanban_columns');
            columns = stored ? JSON.parse(stored) : defaultCols;
            if (healColumns(columns)) {
                localStorage.setItem('kanban_columns', JSON.stringify(columns));
            }
            return;
        }

        try {
            const res = await fetch(`${window.API_URL}/columns`);
            if (res.ok) {
                columns = await res.json();
                healColumns(columns);
                localStorage.setItem('kanban_columns', JSON.stringify(columns));
            } else {
                throw new Error('Server columns query failed');
            }
        } catch (err) {
            console.warn('Erro ao buscar colunas do back-end, usando locais...', err);
            const stored = localStorage.getItem('kanban_columns');
            columns = stored ? JSON.parse(stored) : defaultCols;
            if (healColumns(columns)) {
                localStorage.setItem('kanban_columns', JSON.stringify(columns));
            }
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
        if (btnElement) {
            const card = btnElement.closest('.kanban-card');
            if(card) card.style.opacity = '0'; // Simples fade out
        }

        const executeDelete = async () => {
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
        };

        if (btnElement) {
            setTimeout(executeDelete, 300);
        } else {
            await executeDelete();
        }
    };

    window.deleteColumn = async function(status) {
        if (['todo', 'doing', 'done'].includes(status)) {
            alert('Não é permitido excluir as colunas padrões (A Fazer, Fazendo, Concluído).');
            return;
        }
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

    window.reorderColumns = async function(dragColId, targetColId) {
        const dragCol = columns.find(c => c.id === dragColId);
        const targetCol = columns.find(c => c.id === targetColId);
        if (!dragCol || !targetCol) return;

        const dragIndex = columns.indexOf(dragCol);
        const targetIndex = columns.indexOf(targetCol);

        columns.splice(dragIndex, 1);
        columns.splice(targetIndex, 0, dragCol);

        columns.forEach((col, idx) => {
            col.position = idx + 1;
        });

        localStorage.setItem('kanban_columns', JSON.stringify(columns));
        renderKanban();

        const isOffline = localStorage.getItem('offline_mode') === 'true';
        if (!isOffline) {
            try {
                for (const col of columns) {
                    await fetch(`${window.API_URL}/columns`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(col)
                    });
                }
            } catch (err) {
                console.warn('Erro ao salvar reordenação das colunas no backend', err);
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
            columnDiv.setAttribute('data-id', col.id);

            const headerDiv = document.createElement('div');
            headerDiv.className = 'column-header';

            let editBtnHtml = '';
            if (isV12) {
                editBtnHtml = `<button class="btn-edit-column" onclick="openColumnModal('${col.id}', '${col.status}', '${window.escapeHTML(col.name).replace(/'/g, "\\'")}')" title="Editar Coluna">&#9998;</button>`;
            }

            headerDiv.innerHTML = `
                <span>${window.escapeHTML(col.name)}</span>
                ${editBtnHtml}
            `;

            if (isV12) {
                headerDiv.setAttribute('draggable', 'true');
                headerDiv.addEventListener('dragstart', e => {
                    e.dataTransfer.setData('text/column-id', col.id);
                    columnDiv.classList.add('column-dragging');
                });
                headerDiv.addEventListener('dragend', () => {
                    columnDiv.classList.remove('column-dragging');
                });

                columnDiv.addEventListener('dragover', e => {
                    if (e.dataTransfer.types.includes('text/column-id')) {
                        e.preventDefault();
                        columnDiv.classList.add('column-drag-over');
                    }
                });
                columnDiv.addEventListener('dragenter', e => {
                    if (e.dataTransfer.types.includes('text/column-id')) {
                        e.preventDefault();
                        columnDiv.classList.add('column-drag-over');
                    }
                });
                columnDiv.addEventListener('dragleave', () => {
                    columnDiv.classList.remove('column-drag-over');
                });
                columnDiv.addEventListener('drop', async e => {
                    if (e.dataTransfer.types.includes('text/column-id')) {
                        e.preventDefault();
                        columnDiv.classList.remove('column-drag-over');
                        const dragColId = e.dataTransfer.getData('text/column-id');
                        if (dragColId && dragColId !== col.id) {
                            await window.reorderColumns(dragColId, col.id);
                        }
                    }
                });
            }

            columnDiv.appendChild(headerDiv);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'column-content';
            contentDiv.id = `col-${col.status}`;

            if (isV12) {
                contentDiv.addEventListener('dragover', e => {
                    if (e.dataTransfer.types.includes('text/plain')) {
                        e.preventDefault();
                        contentDiv.classList.add('drag-over');
                    }
                });
                contentDiv.addEventListener('dragenter', e => {
                    if (e.dataTransfer.types.includes('text/plain')) {
                        e.preventDefault();
                        contentDiv.classList.add('drag-over');
                    }
                });
                contentDiv.addEventListener('dragleave', () => {
                    contentDiv.classList.remove('drag-over');
                });
                contentDiv.addEventListener('drop', async e => {
                    if (e.dataTransfer.types.includes('text/plain')) {
                        e.preventDefault();
                        contentDiv.classList.remove('drag-over');
                        const taskId = e.dataTransfer.getData('text/plain');
                        if (taskId) {
                            await window.moveTask(taskId, col.status);
                        }
                    }
                });
            }

            columnDiv.appendChild(contentDiv);

            const addCardBtn = document.createElement('button');
            addCardBtn.className = 'btn-add-task-col';
            addCardBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Adicionar Tarefa
            `;
            addCardBtn.addEventListener('click', () => {
                window.openTaskModalForCreate(col.status);
            });
            columnDiv.appendChild(addCardBtn);

            boardElement.appendChild(columnDiv);
        });

        tasks.forEach(task => {
            const colContent = document.getElementById(`col-${task.status}`);
            if (!colContent) return;

            const card = document.createElement('div');
            card.className = `kanban-card ${task.completed ? 'completed' : ''}`;
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
            actionsHTML += `<button class="btn-move" onclick="openTaskModal('${task.id}')">Editar</button>`;
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

    // Modal elements setup
    const columnModal = document.getElementById('column-modal');
    const columnModalTitle = document.getElementById('column-modal-title');
    const columnModalId = document.getElementById('column-modal-id');
    const columnModalStatus = document.getElementById('column-modal-status');
    const columnModalName = document.getElementById('column-modal-name');
    const columnModalSaveBtn = document.getElementById('column-modal-save-btn');
    const columnModalCancelBtn = document.getElementById('column-modal-cancel-btn');
    const columnModalDeleteBtn = document.getElementById('column-modal-delete-btn');
    const columnModalCloseBtn = document.getElementById('column-modal-close-btn');

    const taskModal = document.getElementById('task-modal');
    const taskModalId = document.getElementById('task-modal-id');
    const taskModalTitle = document.getElementById('task-modal-title');
    const taskModalStatusSelect = document.getElementById('task-modal-status');
    const taskModalSaveBtn = document.getElementById('task-modal-save-btn');
    const taskModalCancelBtn = document.getElementById('task-modal-cancel-btn');
    const taskModalDeleteBtn = document.getElementById('task-modal-delete-btn');
    const taskModalCloseBtn = document.getElementById('task-modal-close-btn');

    window.openColumnModal = function(id, status, name) {
        if (!columnModal) return;
        columnModalId.value = id || '';
        columnModalStatus.value = status || '';
        columnModalName.value = name || '';

        if (id) {
            columnModalTitle.textContent = 'Editar Coluna';
            const isDefault = ['todo', 'doing', 'done'].includes(status);
            if (isDefault) {
                columnModalDeleteBtn.classList.add('hidden');
            } else {
                columnModalDeleteBtn.classList.remove('hidden');
            }
        } else {
            columnModalTitle.textContent = 'Nova Coluna';
            columnModalDeleteBtn.classList.add('hidden');
        }
        columnModal.classList.add('active');
        columnModalName.focus();
    };

    window.closeColumnModal = function() {
        if (columnModal) {
            columnModal.classList.remove('active');
        }
    };

    window.openTaskModalForCreate = function(columnStatus) {
        if (!taskModal) return;
        
        const modalHeaderTitle = taskModal.querySelector('.modal-header h3');
        if (modalHeaderTitle) modalHeaderTitle.textContent = 'Nova Tarefa';
        
        if (taskModalSaveBtn) taskModalSaveBtn.textContent = 'Criar Tarefa';
        if (taskModalDeleteBtn) taskModalDeleteBtn.classList.add('hidden');
        
        taskModalId.value = '';
        taskModalTitle.value = '';
        
        const radios = document.getElementsByName('task-modal-priority');
        for (const radio of radios) {
            radio.checked = (radio.value === '#3b82f6');
        }
        
        if (taskModalStatusSelect) {
            taskModalStatusSelect.innerHTML = '';
            columns.forEach(col => {
                const opt = document.createElement('option');
                opt.value = col.status;
                opt.textContent = col.name;
                if (col.status === columnStatus) {
                    opt.selected = true;
                }
                taskModalStatusSelect.appendChild(opt);
            });
        }
        
        taskModal.classList.add('active');
        taskModalTitle.focus();
    };

    window.openTaskModal = function(id) {
        if (!taskModal) return;
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const modalHeaderTitle = taskModal.querySelector('.modal-header h3');
        if (modalHeaderTitle) modalHeaderTitle.textContent = 'Editar Tarefa';
        
        if (taskModalSaveBtn) taskModalSaveBtn.textContent = 'Salvar Alterações';
        if (taskModalDeleteBtn) taskModalDeleteBtn.classList.remove('hidden');

        taskModalId.value = task.id;
        taskModalTitle.value = task.title;

        // Set priority radio
        const radios = document.getElementsByName('task-modal-priority');
        for (const radio of radios) {
            radio.checked = (radio.value === task.priorityColor);
        }

        // Fill status options dynamically from current columns
        if (taskModalStatusSelect) {
            taskModalStatusSelect.innerHTML = '';
            columns.forEach(col => {
                const opt = document.createElement('option');
                opt.value = col.status;
                opt.textContent = col.name;
                if (col.status === task.status) {
                    opt.selected = true;
                }
                taskModalStatusSelect.appendChild(opt);
            });
        }

        taskModal.classList.add('active');
        taskModalTitle.focus();
    };

    window.closeTaskModal = function() {
        if (taskModal) {
            taskModal.classList.remove('active');
        }
    };

    // Close buttons event listeners
    if (columnModalCloseBtn) columnModalCloseBtn.addEventListener('click', window.closeColumnModal);
    if (columnModalCancelBtn) columnModalCancelBtn.addEventListener('click', window.closeColumnModal);
    if (taskModalCloseBtn) taskModalCloseBtn.addEventListener('click', window.closeTaskModal);
    if (taskModalCancelBtn) taskModalCancelBtn.addEventListener('click', window.closeTaskModal);

    // Save column event listener
    if (columnModalSaveBtn) {
        columnModalSaveBtn.addEventListener('click', async () => {
            const name = columnModalName.value.trim();
            if (!name) return;

            const id = columnModalId.value;
            const isOffline = localStorage.getItem('offline_mode') === 'true';

            if (!id) {
                // Add new column
                const status = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                if (columns.some(c => c.status === status)) {
                    alert('Já existe uma coluna com esse nome.');
                    return;
                }

                const doneIndex = columns.findIndex(c => c.status === 'done');
                const newCol = {
                    id: window.generateUUID(),
                    status,
                    name,
                    position: 1
                };

                if (doneIndex !== -1) {
                    columns.splice(doneIndex, 0, newCol);
                } else {
                    columns.push(newCol);
                }

                columns.forEach((col, idx) => {
                    col.position = idx + 1;
                });

                localStorage.setItem('kanban_columns', JSON.stringify(columns));
                renderKanban();
                window.closeColumnModal();

                if (!isOffline) {
                    try {
                        for (const col of columns) {
                            await fetch(`${window.API_URL}/columns`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(col)
                            });
                        }
                    } catch (err) {
                        console.warn('Erro ao salvar coluna no backend, migrando para offline...');
                        localStorage.setItem('offline_mode', 'true');
                    }
                }
            } else {
                // Edit existing column name (keep status the same)
                const col = columns.find(c => c.id === id);
                if (col) {
                    col.name = name;
                    localStorage.setItem('kanban_columns', JSON.stringify(columns));
                    renderKanban();
                    window.closeColumnModal();

                    if (!isOffline) {
                        try {
                            const res = await fetch(`${window.API_URL}/columns`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(col)
                            });
                            if (!res.ok) throw new Error();
                        } catch (err) {
                            console.warn('Erro ao salvar coluna no backend, migrando para offline...');
                            localStorage.setItem('offline_mode', 'true');
                        }
                    }
                }
            }
        });
    }

    // Delete column inside modal event listener
    if (columnModalDeleteBtn) {
        columnModalDeleteBtn.addEventListener('click', async () => {
            const status = columnModalStatus.value;
            if (status) {
                window.closeColumnModal();
                await window.deleteColumn(status);
            }
        });
    }

    // Save task event listener
    if (taskModalSaveBtn) {
        taskModalSaveBtn.addEventListener('click', async () => {
            const id = taskModalId.value;
            const title = taskModalTitle.value.trim();
            if (!title) return;

            // Get selected priority
            let priorityColor = '#3b82f6';
            const radios = document.getElementsByName('task-modal-priority');
            for (const radio of radios) {
                if (radio.checked) {
                    priorityColor = radio.value;
                    break;
                }
            }

            const newStatus = taskModalStatusSelect.value;
            const isOffline = localStorage.getItem('offline_mode') === 'true';

            if (!id) {
                // CREATE NEW TASK
                const newTask = {
                    id: window.generateUUID(),
                    title: title,
                    completed: (newStatus === 'done'),
                    status: newStatus,
                    priorityColor: priorityColor,
                    createdAt: new Date().toISOString()
                };

                tasks.push(newTask);
                saveToLocal();
                renderKanban();
                window.closeTaskModal();

                if (!isOffline) {
                    try {
                        const res = await fetch(`${window.API_URL}/tasks`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(newTask)
                        });
                        if (!res.ok) throw new Error();
                    } catch (err) {
                        console.warn('Erro ao criar tarefa no backend, migrando para offline...');
                        localStorage.setItem('offline_mode', 'true');
                    }
                }
            } else {
                // EDIT EXISTING TASK
                const task = tasks.find(t => t.id === id);
                if (!task) return;

                task.title = title;
                task.priorityColor = priorityColor;
                task.status = newStatus;
                task.completed = (newStatus === 'done');

                saveToLocal();
                renderKanban();
                window.closeTaskModal();

                if (!isOffline) {
                    try {
                        const res = await fetch(`${window.API_URL}/tasks/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(task)
                        });
                        if (!res.ok) throw new Error();
                    } catch (err) {
                        console.warn('Erro ao salvar tarefa no backend, migrando para offline...');
                        localStorage.setItem('offline_mode', 'true');
                    }
                }
            }
        });
    }

    // Delete task inside modal event listener
    if (taskModalDeleteBtn) {
        taskModalDeleteBtn.addEventListener('click', async () => {
            const id = taskModalId.value;
            if (id) {
                if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                    window.closeTaskModal();
                    await window.deleteTask(id, null);
                }
            }
        });
    }

    if (addColumnBtn) {
        addColumnBtn.addEventListener('click', () => {
            window.openColumnModal('', '', '');
        });
    }

    // Keydown event listener for modals (Escape to close, Enter to save)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (columnModal && columnModal.classList.contains('active')) {
                window.closeColumnModal();
            }
            if (taskModal && taskModal.classList.contains('active')) {
                window.closeTaskModal();
            }
        } else if (e.key === 'Enter') {
            const activeEl = document.activeElement;
            if (activeEl && (activeEl.tagName === 'BUTTON' || activeEl.tagName === 'A')) {
                return;
            }
            if (columnModal && columnModal.classList.contains('active')) {
                e.preventDefault();
                columnModalSaveBtn.click();
            } else if (taskModal && taskModal.classList.contains('active')) {
                e.preventDefault();
                taskModalSaveBtn.click();
            }
        }
    });

    // Init data fetching
    await fetchColumns();
    await fetchTasks();
});

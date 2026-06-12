// Version Switcher and Feature Manager (v1.0.0 & v1.1.0-beta)

document.addEventListener('DOMContentLoaded', async () => {
    let activeVersion = 'v1.0.0';
    let activeTheme = localStorage.getItem('version_theme') || 'default';

    // 1. Fetch current version from server
    try {
        const response = await fetch('/api/version');
        if (response.ok) {
            const data = await response.json();
            activeVersion = data.version || 'v1.0.0';
        } else {
            throw new Error('Server returned non-200');
        }
    } catch (err) {
        console.warn('Could not connect to API for versioning, falling back to localStorage.', err);
        activeVersion = localStorage.getItem('system_version') || 'v1.0.0';
    }

    // Apply version class to body for CSS rules
    const bodyClass = `version-${activeVersion.replace(/\./g, '-').replace(/-/, '_')}`;
    document.body.classList.add(bodyClass);
    
    // Also add standardized class names (using all dashes and all underscores) to ensure matching
    const dashedVersion = `version-${activeVersion.replace(/\./g, '-').replace(/_/g, '-')}`;
    const underscoreVersion = `version-${activeVersion.replace(/\./g, '_').replace(/-/g, '_')}`;
    document.body.classList.add(dashedVersion);
    document.body.classList.add(underscoreVersion);

    window.SYSTEM_VERSION = activeVersion;

    // Apply theme if version is v1.1.0-beta and theme is midnight
    if (activeVersion === 'v1.1.0-beta' && activeTheme === 'midnight') {
        document.body.classList.add('theme-midnight');
    }
    
    // Apply theme if version is v1.2.0
    let activeThemeMode = localStorage.getItem('theme_mode') || 'dark';
    if (activeVersion === 'v1.2.0') {
        if (activeThemeMode === 'light') {
            document.body.classList.add('theme-light');
        } else {
            document.body.classList.remove('theme-light');
        }
    }



    // 2. Inject Badge into UI
    const isSidebar = document.querySelector('.sidebar');
    const footer = document.querySelector('.sidebar-footer');
    let badgeHtml = '';

    if (activeVersion === 'v1.1.0-beta') {
        badgeHtml = `<span class="dot-indicator beta"></span> Versão ${activeVersion}`;
    } else {
        badgeHtml = `<span class="dot-indicator"></span> Versão ${activeVersion}`;
    }
    if (isSidebar && footer) {
        // Render theme toggle if on v1.1.0-beta
        if (activeVersion === 'v1.1.0-beta') {
            const themeToggleContainer = document.createElement('div');
            themeToggleContainer.className = 'theme-switch-container v1-1-only';
            themeToggleContainer.innerHTML = `
                <span class="theme-switch-label">Tema Midnight</span>
                <button class="theme-toggle-btn" id="theme-toggle-btn" aria-label="Alterar Tema">
                    ${activeTheme === 'midnight' ? '☀️' : '🌙'}
                </button>
            `;
            footer.prepend(themeToggleContainer);

            const themeBtn = document.getElementById('theme-toggle-btn');
            if (themeBtn) {
                themeBtn.addEventListener('click', () => {
                    if (document.body.classList.contains('theme-midnight')) {
                        document.body.classList.remove('theme-midnight');
                        localStorage.setItem('version_theme', 'default');
                        themeBtn.textContent = '🌙';
                    } else {
                        document.body.classList.add('theme-midnight');
                        localStorage.setItem('version_theme', 'midnight');
                        themeBtn.textContent = '☀️';
                    }
                });
            }
        }

        // Render theme toggle if on v1.2.0
        if (activeVersion === 'v1.2.0') {
            const themeToggleContainer = document.createElement('div');
            themeToggleContainer.className = 'theme-switch-container v1-2-only';
            themeToggleContainer.innerHTML = `
                <span class="theme-switch-label">Tema Claro</span>
                <button class="theme-toggle-btn" id="theme-toggle-btn-v12" aria-label="Alternar Modo Claro/Escuro">
                    ${activeThemeMode === 'light' ? '🌙' : '☀️'}
                </button>
            `;
            footer.prepend(themeToggleContainer);

            const themeBtn = document.getElementById('theme-toggle-btn-v12');
            if (themeBtn) {
                themeBtn.addEventListener('click', () => {
                    if (document.body.classList.contains('theme-light')) {
                        document.body.classList.remove('theme-light');
                        localStorage.setItem('theme_mode', 'dark');
                        themeBtn.textContent = '☀️';
                    } else {
                        document.body.classList.add('theme-light');
                        localStorage.setItem('theme_mode', 'light');
                        themeBtn.textContent = '🌙';
                    }
                });
            }
        }        // Render Version Badge
        const versionBadge = document.createElement('div');
        versionBadge.className = 'version-badge-sidebar';
        versionBadge.id = 'version-badge-trigger';
        versionBadge.innerHTML = badgeHtml;
        footer.appendChild(versionBadge);
    } else {
        // Floating badge for login page (where sidebar doesn't exist)
        const versionBadge = document.createElement('div');
        versionBadge.className = 'version-badge-floating';
        versionBadge.id = 'version-badge-trigger';
        versionBadge.innerHTML = badgeHtml;
        document.body.appendChild(versionBadge);
    }

    // 3. Inject Modal into body
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'vmodal-overlay';
    modalOverlay.id = 'version-modal';
    modalOverlay.innerHTML = `
        <div class="vmodal-card">
            <div class="vmodal-header">
                <h3>Painel de Versionamento</h3>
                <button class="vmodal-close" id="vmodal-close-btn">&times;</button>
            </div>
            
            <div class="vmodal-current">
                <span>Versão Ativa Rodando</span>
                <span class="vtag">${activeVersion}</span>
            </div>

            <div class="vmodal-options">
                <div class="voption ${activeVersion === 'v1.0.0' ? 'selected' : ''}" data-version="v1.0.0">
                    <div class="voption-radio"></div>
                    <div class="voption-info">
                        <span class="voption-name">v1.0.0 (Base Estável)</span>
                        <span class="voption-desc">Login + Kanban + Tarefas essenciais. Persistência SQLite3/Local.</span>
                    </div>
                </div>
                
                <div class="voption ${activeVersion === 'v1.1.0-beta' ? 'selected' : ''}" data-version="v1.1.0-beta">
                    <div class="voption-radio"></div>
                    <div class="voption-info">
                        <span class="voption-name">v1.1.0-beta (Experimental)</span>
                        <span class="voption-desc">Novas features: Barra de busca de tarefas em tempo real + Tema Midnight.</span>
                    </div>
                </div>

                <div class="voption ${activeVersion === 'v1.2.0' ? 'selected' : ''}" data-version="v1.2.0">
                    <div class="voption-radio"></div>
                    <div class="voption-info">
                        <span class="voption-name">v1.2.0 (Completa - Drag & Drop)</span>
                        <span class="voption-desc">Novas features: Quadro Kanban interativo (Drag & Drop), criação de novas colunas/quadros e alternador de tema Claro/Escuro completo.</span>
                    </div>
                </div>
            </div>

            <div class="vmodal-terminal" id="vmodal-terminal">
                <div class="vterminal-line">[SYSTEM] Terminal de logs pronto. Escolha uma versão para atualizar ou reverter.</div>
            </div>

            <button class="btn-primary" id="vmodal-submit" style="margin-top: 0;" disabled>Versão já instalada</button>
        </div>
    `;
    document.body.appendChild(modalOverlay);

    // Modal elements and logic
    const trigger = document.getElementById('version-badge-trigger');
    const closeBtn = document.getElementById('vmodal-close-btn');
    const submitBtn = document.getElementById('vmodal-submit');
    const options = document.querySelectorAll('.voption');
    const terminal = document.getElementById('vmodal-terminal');

    let selectedVersion = activeVersion;

    const toggleModal = (show) => {
        if (show) {
            modalOverlay.classList.add('active');
        } else {
            modalOverlay.classList.remove('active');
        }
    };

    if (trigger) trigger.addEventListener('click', () => toggleModal(true));
    if (closeBtn) closeBtn.addEventListener('click', () => toggleModal(false));
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) toggleModal(false);
    });

    options.forEach(opt => {
        opt.addEventListener('click', () => {
            options.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectedVersion = opt.getAttribute('data-version');

            if (selectedVersion === activeVersion) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Versão já instalada';
            } else {
                submitBtn.disabled = false;
                if (selectedVersion === 'v1.2.0') {
                    submitBtn.textContent = 'Atualizar para v1.2.0';
                } else if (selectedVersion === 'v1.1.0-beta') {
                    submitBtn.textContent = 'Atualizar para v1.1.0-beta';
                } else {
                    submitBtn.textContent = 'Reverter para v1.0.0';
                }
            }
        });
    });

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const printToTerminal = (text, type = '') => {
        const line = document.createElement('div');
        line.className = `vterminal-line ${type}`;
        line.textContent = text;
        terminal.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight;
    };

    submitBtn.addEventListener('click', async () => {
        submitBtn.disabled = true;
        closeBtn.style.display = 'none';
        options.forEach(opt => opt.style.pointerEvents = 'none');

        terminal.innerHTML = '';
        printToTerminal(`[INFO] Solicitando transição do sistema para ${selectedVersion}...`, '');

        let serverSuccess = false;
        let migrationLogs = [];

        try {
            printToTerminal('[INFO] Enviando requisição ao servidor de controle...', '');
            await sleep(400);

            const res = await fetch('/api/version', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ version: selectedVersion })
            });

            if (res.ok) {
                const data = await res.json();
                serverSuccess = data.success;
                migrationLogs = data.logs;
                // Also sync local storage
                localStorage.setItem('system_version', selectedVersion);
            } else {
                throw new Error('Falha ao comunicar com o servidor');
            }
        } catch (err) {
            console.warn('Atualização via servidor falhou. Simulando offline...', err);
            serverSuccess = true;
            localStorage.setItem('system_version', selectedVersion);

            if (selectedVersion === 'v1.2.0') {
                migrationLogs = [
                    '[INFO] (MODO OFFLINE) Iniciando migração local para v1.2.0...',
                    '[INFO] Salvando nova configuração no localStorage...',
                    '[INFO] Configurando tabelas locais no IndexedDB/localStorage...',
                    '[INFO] Habilitando suporte completo para Drag-and-Drop e colunas dinâmicas...',
                    '[SUCCESS] Recursos de v1.2.0 aplicados localmente com sucesso!',
                    '[SUCCESS] Reiniciando interface...'
                ];
            } else if (selectedVersion === 'v1.1.0-beta') {
                migrationLogs = [
                    '[INFO] (MODO OFFLINE) Iniciando migração local para v1.1.0-beta...',
                    '[INFO] Salvando nova configuração no localStorage...',
                    '[INFO] Carregando arquivos CSS locais para suporte ao Tema Midnight...',
                    '[SUCCESS] Configurações de v1.1.0-beta aplicadas localmente no navegador!',
                    '[SUCCESS] Reiniciando interface...'
                ];
            } else {
                migrationLogs = [
                    '[INFO] (MODO OFFLINE) Iniciando downgrade local para v1.0.0...',
                    '[INFO] Salvando nova configuração no localStorage...',
                    '[INFO] Desativando flags de recursos do beta/v1.2.0...',
                    '[SUCCESS] Downgrade para v1.0.0 finalizado localmente!',
                    '[SUCCESS] Reiniciando interface...'
                ];
            }
        }

        // Type logs into the virtual terminal
        for (const log of migrationLogs) {
            const isSuccess = log.includes('[SUCCESS]');
            const isError = log.includes('[ERROR]');
            const type = isSuccess ? 'success' : (isError ? 'error' : '');
            printToTerminal(log, type);
            await sleep(250);
        }

        await sleep(500);
        printToTerminal(`[SYSTEM] Atualização concluída. Recarregando página...`, 'success');
        await sleep(800);
        window.location.reload();
    });
});

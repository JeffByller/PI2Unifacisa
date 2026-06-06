document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${window.API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('offline_mode', 'false');
                    window.location.href = 'tasks.html'; // Redireciona para as tarefas
                } else {
                    loginError.textContent = data.error || 'Usuário ou senha inválidos';
                }
            } catch (error) {
                console.warn('Servidor offline. Tentando autenticação local (localStorage)...');
                if (username === 'admin' && password === 'admin123') {
                    localStorage.setItem('token', 'fake-jwt-token-123');
                    localStorage.setItem('offline_mode', 'true');
                    window.location.href = 'tasks.html';
                } else {
                    loginError.textContent = 'Servidor offline. Tente admin / admin123 para entrar localmente.';
                }
            }
        });
    }
});

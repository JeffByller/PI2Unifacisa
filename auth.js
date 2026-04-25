document.addEventListener('DOMContentLoaded', () => {
    let token = localStorage.getItem('token') || null;

    // Redireciona para o login se não houver token (para páginas protegidas)
    const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('login.html');
    
    if (!token && !isLoginPage) {
        window.location.href = 'index.html';
        return;
    }

    if (token && isLoginPage) {
        window.location.href = 'tasks.html';
        return;
    }

    // Configuração de Logout se o botão existir
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }

    // Destacar link ativo no sidebar
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') && currentPath.endsWith(link.getAttribute('href'))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

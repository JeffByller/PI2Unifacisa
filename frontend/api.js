const API_URL = 'http://localhost:3000/api';

// Funções utilitárias comuns
function generateUUID() {
    return crypto.randomUUID ? crypto.randomUUID() : 
           'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Exportações globais para uso nos outros scripts
window.API_URL = API_URL;
window.generateUUID = generateUUID;
window.formatDate = formatDate;
window.escapeHTML = escapeHTML;

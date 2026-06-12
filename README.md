# 🎯 Gerenciador de Tarefas Minimalista (Task Manager Kanban)

Este é um projeto integrador full-stack projetado para oferecer um gerenciador de tarefas ágil e minimalista, incorporando listas de tarefas dinâmicas, quadro Kanban interativo e autenticação de usuários. 

O projeto foi estruturado com foco em **Vibe Coding** (programação guiada por intenções e linguagem natural) e desenvolvimento orientado a agentes de IA.

---

## 💡 Sobre o Projeto e Persona

* **O Problema:** A dificuldade de organizar pendências rápidas do dia a dia devido a aplicativos complexos e cheios de recursos que causam distração.
* **A Persona (Lucas):** Um estudante de 20 anos que esquece prazos e necessita de uma ferramenta de organização ágil.
* **Proposta de Valor:** Um aplicativo ultra-minimalista, focado em tirar a carga mental em menos de 5 segundos.
* **Estilo e Paleta de Cores:** Design limpo focado em prioridades:
  * 🔴 **Vermelho** (#ef4444) — Urgente
  * 🟡 **Amarelo** (#eab308) — Importante
  * 🔵 **Azul** (#3b82f6) — Comum

---

## 🛠️ Tecnologias Utilizadas

* **Front-end:** HTML5, CSS3 (Vanilla CSS minimalista) e JavaScript (Vanilla JS modularizado).
* **Back-end:** Node.js, Express.js, `bcryptjs` (garantindo compatibilidade cross-platform) e CORS.
* **Banco de Dados:** SQLite3 (banco de dados em arquivo local).
* **Versionamento:** Git com regras estruturadas para compatibilidade entre diferentes sistemas operacionais.

---

## 📁 Estrutura de Diretórios

O projeto foi organizado de forma limpa, eliminando redundâncias e separando as responsabilidades:

```text
/
├── .agents/                  # Definições de agentes e workflows de desenvolvimento
├── backend/                  # API REST em Node.js
│   ├── db.js                 # Configuração e inicialização do SQLite
│   ├── server.js             # Rotas e controladores da API
│   ├── package.json          # Dependências do servidor (com bcryptjs)
│   └── database.sqlite       # Banco de dados local (ignorado pelo versionamento)
├── frontend/                 # Interface do usuário (SPA)
│   ├── index.html            # Tela de Login
│   ├── tasks.html            # Lista de Tarefas Minimalista
│   ├── kanban.html           # Quadro Kanban Interativo
│   ├── *.css                 # Estilos visuais minimalistas e responsivos
│   └── *.js                  # Lógica do front-end e comunicação com API
├── .gitignore                # Arquivo para controle de versionamento
├── implementation_plan.md    # Especificações de arquitetura do sistema
├── task.md                   # Controle de tarefas do projeto
└── README.md                 # Documentação principal do repositório
```

---

## 🚀 Como Executar o Projeto (Subir o App)

O sistema foi preparado para funcionar em **qualquer sistema operacional** (Windows, Linux, macOS) e possui um mecanismo de **fallback offline**: caso o servidor backend não esteja ativo, a aplicação funcionará de forma standalone salvando os dados no `localStorage` do navegador.

### Opção A: Execução Completa (Front + Back)

#### 1. Inicializar o Banco e Servidor (Back-end)
Abra o terminal, navegue até a pasta `backend`, instale as dependências e inicie o servidor:
```bash
cd backend
npm install
npm start
```
*O servidor estará rodando em `http://localhost:3000`.*

#### 2. Executar a Interface (Front-end)
Abra outro terminal na raiz do projeto e sirva os arquivos estáticos:
```bash
npx serve frontend
```
Ou simplesmente abra o arquivo `frontend/index.html` no navegador usando a extensão **Live Server** no VS Code.

* Credenciais padrão de acesso: **Usuário:** `admin` | **Senha:** `admin123`

---

### Opção B: Execução Standalone (Apenas Front-end via localStorage)

Se você não quiser ou não puder subir o servidor Node.js, o sistema entrará automaticamente em **modo offline**. 
* Basta abrir `frontend/index.html` no navegador.
* Faça login com o usuário `admin` e senha `admin123`.
* A lógica do front-end redirecionará o fluxo para o uso de `localStorage` (`saveToLocal()`), mantendo todas as funções de adicionar, marcar como concluída, quadro Kanban e exclusão ativas diretamente no seu navegador.

---
## 🔄 Versionamento e Gestão de Versões

O projeto implementa um **Painel de Versionamento** integrado (acessível clicando no badge de versão no rodapé da barra lateral). Esse painel permite simular e aplicar atualizações e downgrades em tempo real com logs de migração do banco de dados SQLite (ou localStorage se estiver offline).

### Versões Disponíveis:
* **`v1.0.0` (Base Estável):** Login + Kanban com botões de ação + Lista de Tarefas essenciais.
* **`v1.1.0-beta` (Experimental):** Barra de busca em tempo real na lista de tarefas e Tema Midnight (violeta).
* **`v1.2.0` (Completa - Drag & Drop):** Quadro Kanban móvel por arraste (estilo Jira), criação de novas colunas customizadas e alternador completo de Tema Claro/Escuro.

---

## 🛑 Como parar a execução

Para encerrar o servidor no terminal, basta ir até a janela onde o back-end está executando e pressionar:
**`Ctrl + C`** (digite `S` e aperte Enter se o terminal perguntar se deseja finalizar o arquivo em lotes).

# Meu Projeto Integrador: Gerenciador de Tarefas Minimalista (To-Do List)

Olá! Este é o repositório do meu projeto individual, onde estou desenvolvendo uma aplicação com foco em Vibe Coding, ou seja, programando através da intuição e linguagem natural. Neste projeto, atuarei como um "arquiteto de intenções", enquanto a IA assume o papel de gerar os códigos pesados. 

Para construir essa solução, utilizarei ferramentas de IA assistiva baseadas em agentes, como o Lovable ou o Gemini Assistente, descrevendo o que desejo construir para que a IA gere e implemente a aplicação.

## Sobre o Projeto
Escolhi desenvolver um **Gerenciador de Tarefas Simples (To-Do List)**. A ideia é criar um sistema que permita adicionar, remover e marcar tarefas como concluídas, explorando também o uso de persistência local e categorização de prioridades por cores.
---

### FASE 1: Ideação e Estruturação
Nesta fase inicial, defini a base e o propósito do meu aplicativo:
*   **O Problema:** A dificuldade de organizar pendências rápidas do dia a dia devido à complexidade de aplicativos cheios de recursos que causam distração.
*   **Minha Persona:** Criei o perfil do Lucas, um estudante de 20 anos que esquece prazos e precisa de uma ferramenta ágil.
*   **Proposta de Valor:** Entregar um app minimalista, focado em tirar a carga mental do usuário em menos de 5 segundos.
*   **Lista de Funcionalidades:** Adicionar tarefa, listar pendências, dar "check" em tarefas concluídas e excluir itens.
*   **Organização:** A criação deste próprio repositório no GitHub.

### FASE 2: Arquitetura do Sistema
Nesta segunda etapa, estruturarei como o sistema vai funcionar por trás das telas:
*   Farei a definição da stack tecnológica que os agentes de IA (Lovable/Gemini) irão gerar.
*   Criarei os diagramas de arquitetura e farei a modelagem inicial de dados.
*   Construirei o protótipo visual do sistema para guiar a interface.

### FASE 3: Construção do MVP (Produto Mínimo Viável)
Aqui o projeto ganhará vida com a codificação intensiva via Vibe Coding:
*   Utilizarei os agentes de IA para gerar o código do backend e do frontend.
*   Farei a configuração do banco de dados (ou armazenamento local, para manter a simplicidade).
*   Garantirei a integração completa entre as telas (front) e a lógica de dados (back).

### FASE 4: Entrega do Projeto
A última etapa será dedicada à documentação final e apresentação do software:
*   Disponibilizarei todo o código gerado estruturado neste repositório do GitHub.
*   Gravarei um vídeo de demonstração do projeto funcionando (com duração máxima de 5 minutos).
*   Criarei uma documentação final contendo a estrutura obrigatória: a apresentação do problema, a solução criada, a arquitetura utilizada, uma demonstração ao vivo, como utilizei a IA no processo (meus prompts e interações com Gemini/Lovable) e as principais lições aprendidas.

---
*Desenvolvido com o auxílio de IA Generativa e Vibe Coding.*
```
=======
# Gerenciador de Tarefas (Task Manager Kanban)

Este é um projeto full-stack de gerenciamento de tarefas projetado para oferecer um quadro Kanban interativo, listas de tarefas dinâmicas e autenticação de usuários. 

A aplicação foi estruturada separando as responsabilidades entre o back-end (Node.js com SQLite) e front-end (Single Page Application em Vanilla JS).

## 🚀 Tecnologias Utilizadas

- **Front-end:** HTML5, CSS3, JavaScript (Vanilla JS modularizado)
- **Back-end:** Node.js, Express.js, bcrypt (autenticação), CORS
- **Banco de Dados:** SQLite3

## 📋 Pré-requisitos

Para rodar este projeto, você precisará ter o [Node.js](https://nodejs.org/) instalado na sua máquina (recomendado versão LTS).

## 🔧 Instalação

1. Clone o repositório ou baixe o código para sua máquina.
2. Abra o terminal e navegue até a pasta do back-end para instalar as dependências:
   ```bash
   cd backend
   npm install
   ```

## ▶️ Como executar (Subir o projeto)

Para o funcionamento correto, é necessário iniciar tanto a API do back-end quanto servir os arquivos do front-end.

### 1. Iniciar o Servidor (Back-end)
Abra um terminal, navegue até o diretório do back-end e rode o comando de inicialização:
```bash
cd backend
npm start
```
*A mensagem `Servidor rodando na porta 3001` aparecerá confirmando que a API está ativa.*

### 2. Iniciar a Interface (Front-end)
Abra **um novo terminal** na raiz do projeto (onde estão as pastas `frontend` e `backend`) e utilize um servidor HTTP simples para a pasta do front-end. 

Uma opção rápida utilizando o Node.js é:
```bash
npx serve frontend
```
Outra alternativa é abrir o projeto no VS Code e utilizar a extensão **Live Server** diretamente no arquivo `frontend/index.html`.

Acesse a aplicação no seu navegador através da porta local fornecida (ex: `http://localhost:3000`).

## 🛑 Como parar a execução

Para desligar o projeto, você deve interromper os processos nos terminais que estão em execução.

Vá para o terminal onde o Back-end está rodando e pressione:
**`Ctrl + C`**
(Se o sistema perguntar "Deseja finalizar o arquivo em lotes?", digite `S` e aperte Enter).

Repita o mesmo procedimento de pressionar **`Ctrl + C`** no terminal onde o Front-end estiver rodando.

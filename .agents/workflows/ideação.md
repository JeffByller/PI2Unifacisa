---
description: Ideia do projeto
---

# Meu Projeto Integrador: Gerenciador de Tarefas Minimalista (To-Do List & Kanban)
Olá! Este é o repositório do meu projeto individual, desenvolvido com foco em Vibe Coding (programação guiada por intenções e linguagem natural) e desenvolvimento orientado a agentes de IA.

---

## 🚀 Status e Fases do Projeto

### ✅ FASE 1: Ideação e Estruturação (Concluído)
- **O Problema:** A dificuldade de organizar pendências rápidas do dia a dia devido a aplicativos cheios de recursos.
- **Persona:** Lucas, estudante de 20 anos que precisa de uma ferramenta ágil.
- **Proposta de Valor:** Aplicativo ultra-minimalista focado em reduzir a carga mental em menos de 5 segundos.
- **Cores por Prioridade:** Vermelho (#ef4444) para Urgente, Amarelo (#eab308) para Importante, Azul (#3b82f6) para Comum.

### ✅ FASE 2: Arquitetura do Sistema (Concluído)
- Definição da stack tecnológica: HTML5, CSS3, Vanilla JS no Frontend; Node.js, Express.js e SQLite3 no Backend.
- Criação dos diagramas de arquitetura (fluxo híbrido online/offline com persistência em `localStorage` como fallback).

### ✅ FASE 3: Construção do MVP (Concluído)
- Geração do código do frontend (telas de Login, Tasks e Kanban).
- Configuração do banco de dados SQLite local com o backend Express.
- Integração da lógica de login, sessões e sincronização de dados.

### ✅ FASE 4: Entrega da v1.0.0 (Concluído)
- Disponibilização do código estruturado no repositório GitHub.
- Configuração do fallback offline robusto para funcionamento local sem servidor.

### 🔄 FASE 5: Versionamento e Evolução Contínua (Em Andamento)
- **Objetivo:** Estabelecer o sistema atual como a versão oficial estável `v1.0.0`.
- **Release Management:** Começar a gerar releases estruturados via tags no GitHub.
- **Controle de Versão na UI:**
  - Adicionar um botão de versão no frontend.
  - Implementar um mecanismo simples de atualização/downgrade para gerenciar a transição entre versões estáveis do sistema.
# Manual de Versionamento e Gestão de Releases

Este manual serve como guia didático e prático para entender os conceitos de versionamento de software, a utilização de Git Tags para gerenciar releases, e como a infraestrutura de alternância de versões foi implementada neste projeto.

---

## 1. Conceitos Básicos

### Versionamento Semântico (SemVer)
O versionamento semântico utiliza a estrutura estruturada em três números principais no formato: **`MAJOR.MINOR.PATCH`** (ex: `1.0.0` ou `1.1.0-beta`).

- **MAJOR (Maior)**: Incrementado quando há mudanças incompatíveis com versões anteriores (quebras de API ou reestruturações completas).
- **MINOR (Menor)**: Incrementado quando novos recursos são adicionados de forma retrocompatível (ex: nova barra de pesquisa, novas páginas).
- **PATCH (Correção)**: Incrementado quando correções de bugs retrocompatíveis são aplicadas.
- **Sufixos (-beta, -alpha)**: Indicam versões pré-release experimentais ou em testes.

Neste projeto:
- **`v1.0.0`**: Versão inicial estável (Login + Kanban + Lista de Tarefas base).
- **`v1.1.0-beta`**: Versão beta experimental adicionando pesquisa em tempo real e tema alternativo Midnight.

---

## 2. Controle de Versões com Git (Releases)

As releases oficiais de código são marcadas no repositório usando **Git Tags**. Uma tag funciona como um marcador estático apontando para um commit específico no tempo.

### Comandos Git Essenciais para Releases

#### 1. Criar uma Tag Anotada (Localmente)
Para criar uma versão estável e associar uma mensagem detalhada à tag:
```bash
git tag -a v1.0.0 -m "Release v1.0.0 - Versão Estável Inicial"
```

#### 2. Listar as Tags Existentes
Para listar todas as versões marcadas no repositório:
```bash
git tag
```

#### 3. Enviar as Tags para o Repositório Remoto (GitHub / GitLab)
As tags locais não são enviadas automaticamente ao rodar `git push`. É preciso enviá-las explicitamente:
```bash
# Enviar uma tag específica:
git push origin v1.0.0

# Enviar todas as tags locais de uma vez:
git push origin --tags
```

#### 4. Corrigir ou Remover uma Tag
Se precisar deletar uma tag errada:
```bash
# Deletar localmente:
git tag -d v1.0.0

# Deletar do repositório remoto:
git push origin --delete v1.0.0
```

---

## 3. Estrutura do Versionamento no Sistema

Abaixo está o fluxo de controle de versão implementado na aplicação:

```
+-------------------------------------------------------------+
|                        INTERFACE (UI)                       |
|  Exibe Badge (v1.0.0 ou v1.1.0-beta) e ativa CSS/Features   |
+------------------------------+------------------------------+
                               |
                   Faz chamadas API / Fallback
                               |
                               v
+------------------------------+------------------------------+
|                    BACKEND (SERVER API)                      |
|  GET /api/version  -> Lê versão ativa do SQLite             |
|  POST /api/version -> Altera banco e simula migrações        |
+------------------------------+------------------------------+
                               |
                               v
+------------------------------+------------------------------+
|                     BANCO DE DADOS SQLite                    |
|  Tabela 'settings' armazena: {'version': 'v1.1.0-beta'}      |
+-------------------------------------------------------------+
```

### Arquivos e Responsabilidades

1. **[`backend/db.js`](file:///c:/Users/Jefferson%20Byller/Documents/PI2Unifacisa-main/backend/db.js)**
   - Cria a tabela `settings` se ela não existir.
   - Insere o registro padrão inicial `version = 'v1.0.0'`.

2. **[`backend/server.js`](file:///c:/Users/Jefferson%20Byller/Documents/PI2Unifacisa-main/backend/server.js)**
   - **`GET /api/version`**: Retorna a versão gravada no SQLite (Fallback para `v1.0.0`).
   - **`POST /api/version`**: Grava a nova versão solicitada no banco de dados e retorna logs detalhados que simulam uma migração do servidor em tempo real.

3. **[`frontend/version.js`](file:///c:/Users/Jefferson%20Byller/Documents/PI2Unifacisa-main/frontend/version.js)**
   - Consulta a API para saber qual versão rodar.
   - **Persistência Híbrida/Offline**: Caso a API esteja offline, lê/grava o estado da versão diretamente no `localStorage` do navegador para manter o sistema rodando.
   - Injeta dinamicamente o badge de versão no rodapé do menu lateral ou no canto da tela de login.
   - Injeta o modal de controle de versão.
   - Simula um terminal Unix digitando linha por linha os logs de migração do banco SQLite antes de reiniciar a página.
   - Aplica a classe `version-[nome-da-versao]` no `body` da página.

4. **[`frontend/version.css`](file:///c:/Users/Jefferson%20Byller/Documents/PI2Unifacisa-main/frontend/version.css)**
   - Controla a estilização visual moderna e translúcida (glassmorphic) do badge e do modal.
   - Estiliza o terminal de logs (preto com texto azul/verde de monospaced).
   - Controla quais elementos devem ser exibidos apenas em certas versões com a classe `.v1-1-only`.

---

## 4. Recursos Específicos por Versão (Feature Toggles)

- **Na v1.0.0 (Base)**:
  - Interface simples padrão (sem busca e sem tema Midnight).

- **Na v1.1.0-beta (Novos Recursos)**:
  - **Filtro de Busca de Tarefas**: Um campo de pesquisa no topo da Lista de Tarefas (`tasks.html`) que filtra a lista dinamicamente conforme você digita. A filtragem é executada no arquivo [`tasks.js`](file:///c:/Users/Jefferson%20Byller/Documents/PI2Unifacisa-main/frontend/tasks.js).
  - **Tema Midnight**: Um botão no rodapé do menu lateral permite alternar para o tema escuro profundo e violeta neon. A preferência é salva localmente.

- **Na v1.2.0 (Completa - Drag & Drop)**:
  - **Quadro Kanban Móvel (Drag & Drop)**: Permite arrastar os cartões de tarefas livremente entre as colunas do Kanban. A movimentação física dos cartões atualiza automaticamente seu status no banco SQLite (ou localStorage se offline).
  - **Adição de Colunas Customizadas**: Um botão `+ Adicionar Coluna` permite criar novos quadros/colunas diretamente do Kanban, armazenando a nova coluna em uma tabela SQLite dedicada (`kanban_columns`).
  - **Modo Claro / Escuro**: Substitui o Tema Midnight por um controle robusto de Tema Claro / Escuro que adapta toda a paleta de cores para alta legibilidade e design premium.

---

## 5. Como Testar a Alternância de Versões

1. **Abrir a Aplicação**: Navegue para a interface local (ex: através do servidor Express na porta `3000`).
2. **Visualizar o Badge**: Observe a indicação "Versão v1.0.0" com um ponto verde no rodapé esquerdo da tela.
3. **Atualizar para o Beta (v1.1.0-beta)**:
   - Clique no badge de versão.
   - No modal, selecione a opção **v1.1.0-beta (Experimental)**.
   - Clique em **Atualizar para v1.1.0-beta**.
   - Observe o terminal de logs do banco rodando as migrações SQLite e a página recarregando sozinha.
4. **Validar as Novidades da v1.1.0-beta**:
   - Veja o badge mudar para "Versão v1.1.0-beta" com ponto amarelo.
   - Acesse **Lista de Tarefas** e teste digitar algo no novo campo de busca.
   - Teste clicar no ícone de lua/sol no rodapé para ativar o **Tema Midnight** (cores violeta e fundo azul profundo).
5. **Atualizar para a v1.2.0 (Completa - Drag & Drop)**:
   - Clique no badge de versão.
   - No modal, selecione a opção **v1.2.0 (Completa - Drag & Drop)**.
   - Clique em **Atualizar para v1.2.0**.
   - Acompanhe os logs no terminal simulando a criação da tabela `kanban_columns` e a página reiniciando.
6. **Validar as Novidades da v1.2.0**:
   - Veja o badge de versão atualizado para `v1.2.0`.
   - Teste alternar para o **Tema Claro** no switch no rodapé do menu.
   - Acesse o **Quadro Kanban**, arraste tarefas entre colunas e crie novas colunas dinamicamente com o botão `+ Adicionar Coluna`.
7. **Realizar Downgrade**:
   - Abra o modal de versionamento clicando no badge.
   - Selecione a versão anterior desejada (ex: `v1.0.0 (Base Estável)`) e clique em **Reverter para v1.0.0**.
   - Assista aos logs de downgrade no terminal e o recarregamento.
   - Verifique que os recursos novos desapareceram e a interface voltou ao padrão estável inicial de forma transparente.

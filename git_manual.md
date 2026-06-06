# Manual de Git & GitHub (Guia de Estudos)

Este guia serve como referência rápida para o uso do Git e do GitHub no dia a dia do desenvolvimento de software.

---

## 🚀 Conceitos Fundamentais

*   **Git**: Sistema de controle de versão distribuído que roda localmente na sua máquina.
*   **GitHub**: Plataforma online que hospeda repositórios Git na nuvem para colaboração e backup.
*   **Repositório (Repo)**: A pasta do seu projeto gerenciada pelo Git.
*   **Commit**: Um "ponto de salvamento" (snapshot) histórico do estado atual do seu código.

---

## ⚙️ 1. Configuração Inicial

Antes de começar a comitar, é importante dizer ao Git quem você é.

```bash
# Define seu nome globalmente
git config --global user.name "Seu Nome"

# Define seu e-mail globalmente
git config --global user.email "seu_email@provedor.com"

# Verifica as configurações atuais
git config --list
```

---

## 📂 2. Fluxo de Trabalho Diário (Ciclo de Commit)

O fluxo padrão ao alterar arquivos é: **Modificar** ➡️ **Preparar (Stage)** ➡️ **Comitar (Commit)**.

### Passo 1: Verificar o Status
Sempre comece vendo o que mudou no repositório.
```bash
git status
```

### Passo 2: Ver as alterações detalhadas
Quer saber exatamente o que mudou linha por linha?
```bash
git diff
```

### Passo 3: Preparar os arquivos (Stage)
Adicione os arquivos modificados para a fila de salvamento.
```bash
# Adiciona um arquivo específico
git add nome_do_arquivo.ext

# Adiciona todos os arquivos modificados e novos da pasta atual
git add .
```

### Passo 4: Salvar a foto do código (Commit)
Crie um ponto na história com uma mensagem explicando a alteração.
```bash
git commit -m "tipo: mensagem descritiva do que foi feito"
```
> **Dica**: Use padrões de mensagens claras, como `feat:` para novas funcionalidades, `fix:` para correção de bugs, e `docs:` para documentação.

---

## ☁️ 3. Sincronização com o GitHub

Para sincronizar seu repositório local com o GitHub, usamos os comandos de envio, recebimento e listagem de remotos.

### Adicionar o Repositório Remoto
Diz ao Git local onde fica o repositório no GitHub.
```bash
git remote add origin https://github.com/usuario/repositorio.git
```

### Verificar Conexões Remotas
```bash
git remote -v
```

### Enviar alterações locais (Push)
Envia seus commits locais para a nuvem.
```bash
# Primeira vez definindo a branch padrão de destino (upstream)
git push -u origin main

# Nas próximas vezes basta usar:
git push
```

### Baixar alterações remotas (Pull)
Traz as atualizações do GitHub e as mescla diretamente na sua branch local atual.
```bash
git pull
```

### Buscar atualizações sem mesclar (Fetch)
Apenas verifica se há novidades no GitHub, sem alterar seus arquivos de trabalho locais imediatamente.
```bash
git fetch origin
```

---

## 🌿 4. Trabalhando com Branches (Ramificações)

Branches permitem criar caminhos isolados para desenvolver novas funcionalidades sem quebrar o código principal (`main`).

```bash
# Listar todas as branches locais (a atual terá um asterisco *)
git branch

# Criar uma nova branch
git branch nome-da-nova-branch

# Mudar para uma branch existente
git checkout nome-da-branch
# ou (versão moderna):
git switch nome-da-branch

# Criar e mudar para a nova branch de uma vez só
git checkout -b nome-da-nova-branch
# ou (versão moderna):
git switch -c nome-da-nova-branch

# Excluir uma branch local (após ter feito o merge)
git branch -d nome-da-branch
```

---

## 🤝 5. Mesclando Trabalho (Merge)

Quando terminar de desenvolver na sua branch e quiser trazer as alterações para a `main`:

1. Volte para a branch `main`:
   ```bash
   git switch main
   ```
2. Baixe as atualizações mais recentes do servidor (boa prática para evitar conflitos):
   ```bash
   git pull
   ```
3. Mescle a sua branch na `main`:
   ```bash
   git merge nome-da-sua-branch
   ```

---

## ⚠️ 6. Resolvendo Conflitos de Merge

Um conflito acontece quando duas pessoas (ou você em locais diferentes) alteram as **mesmas linhas** do mesmo arquivo e tentam juntar os códigos.

Quando houver conflito, o Git pausará o merge e marcará os arquivos com marcações especiais:

```text
<<<<<<< HEAD
Código que está na sua branch atual (local)
=======
Código que está vindo da outra branch (remota)
>>>>>>> nome-da-branch-ou-commit
```

### Como resolver:
1. Abra o arquivo em conflito no seu editor de código (como o VS Code).
2. Escolha qual parte manter, apague as marcações (`<<<<<<<`, `=======`, `>>>>>>>`).
3. Salve o arquivo.
4. Adicione o arquivo resolvido ao Stage:
   ```bash
   git add nome_do_arquivo.ext
   ```
5. Finalize o processo criando um commit de merge:
   ```bash
   git commit -m "merge: resolve conflitos de integração"
   ```

---

## 🛠️ 7. Comandos de Emergência (Guia de Sobrevivência)

### Desfazer o último commit (sem perder as alterações no código)
Esqueceu de adicionar um arquivo ou errou a mensagem do commit?
```bash
git reset --soft HEAD~1
```

### Descartar todas as alterações locais não comitadas (Cuidado!)
Isso reverte os arquivos locais ao estado do último commit feito.
```bash
git reset --hard HEAD
```

### Descartar alterações de um único arquivo
```bash
git checkout -- nome_do_arquivo.ext
```

### Ver o histórico de commits formatado
```bash
git log --oneline --graph --all
```

### Forçar atualização no GitHub (Force Push)
Use com extremo cuidado. Substitui o histórico remoto pelo seu histórico local.
```bash
git push -f origin main
```

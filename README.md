# Celta RH — Sistema de Gestão de Candidatos

## Estrutura do projeto

```
celta-rh/
├── backend/
│   ├── server.js       ← API Node.js + banco de dados
│   └── package.json
└── frontend/
    └── index.html      ← Interface web
```

---

## Deploy no Railway (recomendado — gratuito)

### Passo 1 — Criar conta
Acesse https://railway.app e crie uma conta gratuita (pode usar Google ou GitHub).

### Passo 2 — Subir os arquivos
1. Crie uma conta no GitHub (https://github.com) se ainda não tiver
2. Crie um repositório novo chamado `celta-rh`
3. Suba a pasta `backend/` e `frontend/` para o repositório

### Passo 3 — Deploy no Railway
1. No Railway, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha o repositório `celta-rh`
4. Em **"Root Directory"**, coloque: `backend`
5. Em **"Start Command"**, coloque: `node server.js`
6. Clique em **Deploy**

### Passo 4 — Gerar o link público
1. Após o deploy, vá em **Settings → Networking**
2. Clique em **"Generate Domain"**
3. Você receberá um link do tipo: `https://celta-rh-xxxx.railway.app`
4. Compartilhe esse link com sua equipe!

---

## Deploy no Render (alternativa gratuita)

1. Acesse https://render.com e crie uma conta
2. Clique em **"New Web Service"**
3. Conecte seu repositório GitHub
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Clique em **Create Web Service**

---

## Variáveis de ambiente (opcional)

| Variável | Descrição | Padrão |
|---|---|---|
| `PORT` | Porta do servidor | `3001` |
| `DB_PATH` | Caminho do banco SQLite | `./celta.db` |

---

## Rodando localmente (para testes)

```bash
cd backend
npm install
node server.js
```

Acesse: http://localhost:3001

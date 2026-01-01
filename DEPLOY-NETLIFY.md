# 🚀 Guia de Deploy no Netlify

## 📋 Pré-requisitos

- Conta no Netlify (você já tem: https://app.netlify.com/teams/inaciofernando/projects)
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Variáveis de ambiente do Supabase

## 🔧 Arquivos Criados

✅ `netlify.toml` - Configuração do Netlify
✅ `vercel.json` - Configuração alternativa para Vercel
✅ `.env.example` - Exemplo de variáveis de ambiente

## 📦 Opção 1: Deploy via Git (Recomendado)

### 1. Inicializar Git (se ainda não tiver)
```bash
git init
git add .
git commit -m "Initial commit - Core Wellbeing App"
```

### 2. Criar repositório no GitHub
- Acesse: https://github.com/new
- Nome: `lifos-core-wellbeing-app`
- Deixe público ou privado
- NÃO inicialize com README

### 3. Conectar e fazer push
```bash
git remote add origin https://github.com/SEU_USUARIO/lifos-core-wellbeing-app.git
git branch -M main
git push -u origin main
```

### 4. Deploy no Netlify
1. Acesse: https://app.netlify.com/teams/inaciofernando/projects
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Escolha **GitHub** e autorize
4. Selecione o repositório `lifos-core-wellbeing-app`
5. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Adicione as **variáveis de ambiente**:
   - `VITE_SUPABASE_URL` = `https://vzusjjpnbjhrvzadtdlg.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXNqanBuYmpocnZ6YWR0ZGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxOTk2NDQsImV4cCI6MjA4Mjc3NTY0NH0.UwVaFtgyOateBDEKgA7ZnlEL7J7HM1T__iYWNfn6g-A`
7. Clique em **"Deploy site"**

### 5. Aguarde o deploy
- O Netlify vai instalar dependências, fazer build e publicar
- Você receberá uma URL tipo: `https://seu-app.netlify.app`

## 📦 Opção 2: Deploy via CLI (Mais Rápido)

### 1. Instalar Netlify CLI
```bash
npm install -g netlify-cli
```

### 2. Login no Netlify
```bash
netlify login
```

### 3. Inicializar projeto
```bash
netlify init
```

Siga as instruções:
- **Create & configure a new site**
- Escolha seu team: `inaciofernando`
- Nome do site: `lifos-core-wellbeing` (ou outro)
- Build command: `npm run build`
- Publish directory: `dist`

### 4. Adicionar variáveis de ambiente
```bash
netlify env:set VITE_SUPABASE_URL "https://vzusjjpnbjhrvzadtdlg.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXNqanBuYmpocnZ6YWR0ZGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxOTk2NDQsImV4cCI6MjA4Mjc3NTY0NH0.UwVaFtgyOateBDEKgA7ZnlEL7J7HM1T__iYWNfn6g-A"
```

### 5. Deploy
```bash
netlify deploy --prod
```

## 📦 Opção 3: Deploy Manual (Drag & Drop)

### 1. Fazer build local
```bash
npm install
npm run build
```

### 2. Upload no Netlify
1. Acesse: https://app.netlify.com/drop
2. Arraste a pasta `dist` para a área de upload
3. Aguarde o upload completar

⚠️ **IMPORTANTE:** Com deploy manual, você precisa configurar as variáveis de ambiente depois:
1. Vá em **Site settings** → **Environment variables**
2. Adicione as variáveis do Supabase

## 🔄 Deploys Automáticos

Após conectar via Git (Opção 1), todo `git push` na branch `main` fará deploy automático!

## 🌐 Domínio Personalizado

1. Vá em **Site settings** → **Domain management**
2. Clique em **Add custom domain**
3. Siga as instruções para configurar DNS

## ✅ Checklist Final

- [ ] Repositório Git criado e código enviado
- [ ] Site criado no Netlify
- [ ] Variáveis de ambiente configuradas
- [ ] Build executado com sucesso
- [ ] Site acessível via URL do Netlify
- [ ] Login funcionando
- [ ] Dados do Supabase carregando corretamente

## 🐛 Troubleshooting

### Erro: "Failed to compile"
- Verifique se todas as dependências estão no `package.json`
- Execute `npm install` localmente para testar

### Erro: "Supabase connection failed"
- Verifique se as variáveis de ambiente estão corretas
- Confirme que começam com `VITE_` (necessário para Vite)

### Erro 404 em rotas
- O arquivo `netlify.toml` deve estar na raiz do projeto
- Verifique se o redirect está configurado

## 📞 Suporte

- Documentação Netlify: https://docs.netlify.com/
- Suporte Netlify: https://www.netlify.com/support/

---

**Aplicação:** Core Wellbeing App (Lifos)
**Framework:** React + Vite + TypeScript
**Backend:** Supabase
**Deploy:** Netlify

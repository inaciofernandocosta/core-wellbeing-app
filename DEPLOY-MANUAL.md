# 🚀 Deploy Manual no Netlify - Projeto lifosmvp

## 📋 Passo a Passo

### 1. Fazer Build Local
```bash
cd "/Users/fernandocosta/Library/Mobile Documents/com~apple~CloudDocs/Documents/2026/Windsurf/lifos/core-wellbeing-app"
npm run build
```

### 2. Acessar o Projeto no Netlify
Acesse: https://app.netlify.com/projects/lifosmvp

### 3. Fazer Deploy Manual

**Opção A: Via Deploys Tab**
1. Clique na aba **"Deploys"**
2. Arraste a pasta `dist` para a área de upload
3. Aguarde o upload completar

**Opção B: Via Netlify Drop**
1. Acesse: https://app.netlify.com/drop
2. Arraste a pasta `dist` para a área de upload
3. Após o upload, copie a URL gerada
4. Vá em https://app.netlify.com/projects/lifosmvp
5. Em **Site settings** → **General** → **Change site name**
6. Configure para usar o site lifosmvp

### 4. Configurar Variáveis de Ambiente

1. Vá em **Site settings** → **Environment variables**
2. Clique em **Add a variable**
3. Adicione as seguintes variáveis:

**Variável 1:**
- Key: `VITE_SUPABASE_URL`
- Value: `https://vzusjjpnbjhrvzadtdlg.supabase.co`

**Variável 2:**
- Key: `VITE_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXNqanBuYmpocnZ6YWR0ZGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxOTk2NDQsImV4cCI6MjA4Mjc3NTY0NH0.UwVaFtgyOateBDEKgA7ZnlEL7J7HM1T__iYWNfn6g-A`

4. Clique em **Save**

### 5. Fazer Novo Deploy (Após Configurar Variáveis)

Após configurar as variáveis de ambiente, você precisa fazer um novo deploy para que elas sejam aplicadas:

1. Vá em **Deploys**
2. Clique em **Trigger deploy** → **Deploy site**

Ou faça um novo upload da pasta `dist`.

## 🔄 Alternativa: Deploy via CLI com Site ID

Se você souber o **Site ID** do projeto lifosmvp, pode fazer deploy via CLI:

```bash
# Fazer build
npm run build

# Deploy com site ID específico
netlify deploy --prod --dir=dist --site=SEU_SITE_ID_AQUI
```

Para encontrar o Site ID:
1. Acesse: https://app.netlify.com/projects/lifosmvp
2. Vá em **Site settings** → **General**
3. Copie o **Site ID** (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

## 📁 Localização da Pasta dist

A pasta `dist` está em:
```
/Users/fernandocosta/Library/Mobile Documents/com~apple~CloudDocs/Documents/2026/Windsurf/lifos/core-wellbeing-app/dist
```

## ✅ Verificação Pós-Deploy

Após o deploy, teste:
1. Acesse: https://lifosmvp.netlify.app
2. Teste o login
3. Verifique se os dados do Supabase carregam
4. Teste todas as funcionalidades

## 🐛 Troubleshooting

### Erro: "Variáveis de ambiente não funcionam"
- As variáveis só são aplicadas em novos deploys
- Faça um novo deploy após configurá-las

### Erro: "Site não encontrado"
- Verifique se você está logado na conta correta do Netlify
- O projeto pode estar em outra team/organização

### Erro: "Build failed"
- Execute `npm run build` localmente primeiro
- Verifique se não há erros no build local

---

**Projeto:** Core Wellbeing App (Lifos)
**Site:** lifosmvp.netlify.app
**Framework:** React + Vite + TypeScript
**Backend:** Supabase

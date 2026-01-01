# 🔧 Configurar Redirecionamento de Senha no Supabase

## 📋 Problema
O "Esqueci senha" ainda está redirecionando para localhost mesmo após o deploy.

## 🛠️ Solução - Configurar no Supabase

### 1. Acessar o Dashboard do Supabase
- URL: https://supabase.com/dashboard
- Projeto: vzusjjpnbjhrvzadtdlg

### 2. Configurar Redirecionamento de Email
1. Vá para **Authentication** → **Settings**
2. Role até **Email Templates**
3. Encontre a seção **"Reset password"**
4. Verifique o campo **"Redirect URL"**
5. Altere para: `https://lifosmvp.netlify.app/login`

### 3. Configurar Site URLs
1. Mesma página: **Authentication** → **Settings**
2. Role até **Site URL**
3. Adicione: `https://lifosmvp.netlify.app`
4. Remova ou comente URLs de localhost se houver

### 4. Configurar Redirect URLs
1. Role até **Redirect URLs**
2. Adicione: `https://lifosmvp.netlify.app/auth/callback`
3. Remova URLs de localhost se houver

## 🔄 Após Configurar

1. **Limpar cache do navegador**:
   - Chrome: Ctrl+Shift+R (ou Cmd+Shift+R no Mac)
   - Ou abrir em aba anônima

2. **Testar novamente**:
   - Acesse: https://lifosmvp.netlify.app/login
   - Clique em "Esqueceu a senha?"
   - Digite e-mail
   - Verifique o link no e-mail recebido

## 📝 Código Atual

O código já está correto:
```typescript
const resetPassword = async (email: string) => {
  // Em produção, usa a URL do site; em desenvolvimento, usa localhost
  const baseUrl = window.location.hostname === 'localhost' 
    ? `${window.location.origin}/login`
    : "https://lifosmvp.netlify.app/login";
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: baseUrl,
  });
  if (error) return { error: error.message };
  return {};
};
```

## ⚠️ Importante

O Supabase tem configurações de redirecionamento que podem sobrescrever o código. Por isso, é necessário configurar também no dashboard do Supabase.

## 🧪 Teste Final

Após configurar o Supabase:
1. Faça um teste de "Esqueci senha"
2. O e-mail deve conter link para `https://lifosmvp.netlify.app/login`
3. Ao clicar, deve redirecionar corretamente

---

**Deploy atualizado:** https://lifosmvp.netlify.app
**Último deploy:** 69566b5f9fd2638182c989ee

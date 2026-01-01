# 📧 Configuração de Notificações por Email

## Sistema de Compartilhamento de Pilares

Quando você compartilha um pilar com alguém, o sistema pode enviar um email automático notificando a pessoa.

---

## 🎯 Como Funciona

### Opção 1: Email Automático (Recomendado)
✅ Email enviado automaticamente ao compartilhar
✅ Template profissional com design bonito
✅ Link direto para acessar o pilar
✅ Informações sobre permissão (visualizar/editar)

### Opção 2: Compartilhamento Manual (Funciona Agora)
✅ Copiar link e enviar manualmente
✅ Enviar por WhatsApp, email, etc.
✅ Não requer configuração adicional

---

## 🚀 Configurar Email Automático

### Passo 1: Criar Conta no Resend

1. Acesse: https://resend.com
2. Crie uma conta gratuita
3. Plano gratuito: **100 emails/dia**

### Passo 2: Obter API Key

1. No dashboard do Resend, vá em **API Keys**
2. Clique em **Create API Key**
3. Copie a chave (começa com `re_`)

### Passo 3: Configurar Domínio (Opcional)

**Opção A: Usar domínio próprio**
1. No Resend, vá em **Domains**
2. Adicione seu domínio (ex: `lifos.app`)
3. Configure os registros DNS
4. Emails virão de: `noreply@lifos.app`

**Opção B: Usar domínio de teste do Resend**
- Emails virão de: `onboarding@resend.dev`
- Funciona imediatamente
- Pode cair em spam

### Passo 4: Deploy da Edge Function

```bash
# No terminal, na pasta do projeto:
cd supabase/functions/send-share-notification

# Deploy da função
supabase functions deploy send-share-notification --no-verify-jwt

# Configurar variável de ambiente
supabase secrets set RESEND_API_KEY=re_sua_chave_aqui
```

### Passo 5: Testar

1. Vá em **Pilares**
2. Clique no ícone de compartilhar (Share2)
3. Digite um email
4. Escolha permissão
5. Clique em **Compartilhar**

✅ Email será enviado automaticamente!

---

## 📧 Template do Email

O email enviado contém:

- **Assunto**: `[Nome] compartilhou o pilar "[Pilar]" com você`
- **Conteúdo**:
  - Nome de quem compartilhou
  - Nome do pilar
  - Badge de permissão (Visualizar/Editar)
  - Botão para acessar
  - Explicação sobre como funciona
  - CTA para criar conta

---

## 🔧 Alternativa: Usar Outro Serviço de Email

Se preferir usar outro serviço (SendGrid, Mailgun, etc.), edite o arquivo:

`supabase/functions/send-share-notification/index.ts`

E substitua a chamada da API do Resend pela API do seu serviço.

---

## 💡 Uso Sem Configuração

**O sistema já funciona sem email automático!**

Quando você compartilha um pilar:
1. ✅ Compartilhamento é salvo no banco
2. ✅ Link é gerado
3. ✅ Você pode copiar o link (botão Copy)
4. ✅ Enviar manualmente por WhatsApp/Email/etc.

**Vantagens:**
- Funciona imediatamente
- Sem configuração necessária
- Você controla quando/como enviar

---

## 📊 Custos

### Resend (Recomendado)
- **Gratuito**: 100 emails/dia, 3.000/mês
- **Pago**: A partir de $20/mês para 50.000 emails

### SendGrid
- **Gratuito**: 100 emails/dia
- **Pago**: A partir de $15/mês

### Mailgun
- **Gratuito**: 5.000 emails/mês (primeiros 3 meses)
- **Pago**: A partir de $35/mês

---

## ❓ FAQ

**Q: O sistema funciona sem configurar email?**
A: Sim! Você pode copiar o link e enviar manualmente.

**Q: Preciso de domínio próprio?**
A: Não, pode usar o domínio de teste do Resend.

**Q: Quantos emails posso enviar?**
A: Plano gratuito do Resend: 100/dia, 3.000/mês.

**Q: Os emails caem em spam?**
A: Com domínio próprio configurado, raramente. Com domínio de teste, pode acontecer.

**Q: Posso personalizar o template?**
A: Sim! Edite o arquivo `supabase/functions/send-share-notification/index.ts`

---

## 🎨 Personalizar Template

Para personalizar o email, edite a variável `emailHtml` no arquivo:

`supabase/functions/send-share-notification/index.ts`

Você pode alterar:
- Cores
- Textos
- Layout
- Adicionar logo
- Adicionar mais informações

---

## ✅ Checklist de Configuração

- [ ] Criar conta no Resend
- [ ] Obter API Key
- [ ] (Opcional) Configurar domínio próprio
- [ ] Deploy da Edge Function
- [ ] Configurar variável RESEND_API_KEY
- [ ] Testar envio de email
- [ ] Verificar se email chegou (checar spam)

---

**Pronto! Sistema de notificações configurado! 🎉**

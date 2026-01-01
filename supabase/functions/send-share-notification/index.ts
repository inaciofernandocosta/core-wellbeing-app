// Edge Function para enviar email de notificação de compartilhamento
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface ShareNotification {
  owner_name: string
  owner_email: string
  shared_with_email: string
  pillar_name: string
  permission: 'view' | 'edit'
  share_url: string
}

serve(async (req) => {
  try {
    const { owner_name, owner_email, shared_with_email, pillar_name, permission, share_url }: ShareNotification = await req.json()

    // Template do email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
            .pillar-card { background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .permission-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 600; }
            .permission-view { background: #dbeafe; color: #1e40af; }
            .permission-edit { background: #dcfce7; color: #166534; }
            .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎯 Pilar Compartilhado</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Olá! 👋
              </p>
              <p style="font-size: 16px;">
                <strong>${owner_name}</strong> (${owner_email}) compartilhou um pilar com você:
              </p>
              
              <div class="pillar-card">
                <h2 style="margin: 0 0 10px 0; color: #10b981;">${pillar_name}</h2>
                <p style="margin: 10px 0;">
                  <span class="permission-badge ${permission === 'view' ? 'permission-view' : 'permission-edit'}">
                    ${permission === 'view' ? '👁️ Visualização' : '✏️ Edição'}
                  </span>
                </p>
                <p style="color: #6b7280; font-size: 14px; margin-top: 15px;">
                  ${permission === 'view' 
                    ? 'Você pode visualizar este pilar sem necessidade de criar uma conta.' 
                    : 'Você pode editar este pilar. É necessário fazer login ou criar uma conta gratuita.'}
                </p>
              </div>

              <div style="text-align: center;">
                <a href="${share_url}" class="button">
                  Acessar Pilar Compartilhado
                </a>
              </div>

              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 20px; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>💡 Dica:</strong> Crie sua conta gratuita para organizar sua vida com pilares personalizados, metas e muito mais!
                </p>
              </div>

              <div class="footer">
                <p>Este é um email automático do sistema Lifos.</p>
                <p style="font-size: 12px; color: #9ca3af;">
                  Link de acesso: <a href="${share_url}" style="color: #10b981;">${share_url}</a>
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Enviar email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Lifos <noreply@lifos.app>',
        to: [shared_with_email],
        subject: `${owner_name} compartilhou o pilar "${pillar_name}" com você`,
        html: emailHtml
      })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Erro ao enviar email')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email enviado com sucesso' }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

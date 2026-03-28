export function cartaInscricaoEmAnalise(params: { nome: string; tipo: string; data: string; resumoHtml?: string; siteUrl?: string }) {
  const { nome, tipo, data, resumoHtml = '', siteUrl = 'https://clubedasleitoras.com.br' } = params;
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Sua inscrição está em análise</title>
  <style>
    body{font-family:Georgia,serif;background:#f4ece2;margin:0;padding:20px}
    .card{max-width:640px;margin:28px auto;background:#fff;border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,0.07);overflow:hidden;border:1px solid #efe6df}
    .mast{background:linear-gradient(90deg,#f7eef8 0%,#f1f0ff 100%);padding:28px;text-align:center}
    h1{margin:0;font-family:'Alice',Georgia,serif;color:#b04d4a;font-style:italic}
    .body{padding:28px;color:#333;line-height:1.6}
    .footer{background:#fbf8f6;padding:18px;text-align:center;color:#8c7a66;font-size:12px}
    .cta{display:inline-block;margin-top:18px;padding:10px 22px;background:#b04d4a;color:#fff;border-radius:8px;text-decoration:none}
  </style>
</head>
<body>
  <div class="card">
    <div style="position:relative">
      <div style="position:absolute;left:50%;transform:translateX(-50%);top:-28px;background:#fff;border-radius:999px;padding:8px;box-shadow:0 6px 18px rgba(0,0,0,0.08);border:6px solid #f4ece2">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21s-7.5-4.5-9-7.5C1 10.5 4.5 6 8.5 6 10 6 12 7.5 12 7.5S14 6 15.5 6C19.5 6 23 10.5 21 13.5 19.5 16.5 12 21 12 21z" fill="#b04d4a" />
        </svg>
      </div>
      <div class="mast" style="padding-top:36px">
        <h1>Clube das Leitoras</h1>
        <div style="font-size:12px;color:#8c7a66;margin-top:6px">Sua inscrição foi recebida</div>
      </div>
    </div>
    <div class="body">
      <p>Olá <strong>${escapeHtml(nome)}</strong>,</p>
      <p>Recebemos sua solicitação para <strong>${escapeHtml(tipo)}</strong> em <strong>${escapeHtml(data)}</strong>. Nossa curadoria já está analisando seu pedido.</p>
      ${resumoHtml ? `<div style="margin:14px 0;padding:12px;background:#f8f6f3;border-radius:8px;border:1px solid #efe8e6">${resumoHtml}</div>` : ''}
      <p>Em breve entraremos em contato. Enquanto isso, você pode visitar nosso site:</p>
      <p><a class="cta" href="${siteUrl}" target="_blank">Visitar o Clube</a></p>
    </div>
    <div class="footer">Com carinho — Clube das Leitoras • Brasília</div>
  </div>
</body>
</html>`;
}

export function cartaAprovacaoComSenha(params: { nome: string; email: string; senha: string; siteUrl?: string }) {
  const { nome, email, senha, siteUrl = 'https://clubedasleitoras.com.br' } = params;
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Seja bem-vinda ao Clube</title>
  <style>
    body{font-family:Georgia,serif;background:#f4ece2;margin:0;padding:20px}
    .card{max-width:640px;margin:28px auto;background:#fff;border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,0.07);overflow:hidden;border:1px solid #efe6df}
    .mast{background:linear-gradient(90deg,#fdf2f3 0%,#fff7f7 100%);padding:28px;text-align:center}
    h1{margin:0;font-family:'Alice',Georgia,serif;color:#b04d4a}
    .body{padding:28px;color:#333;line-height:1.6}
    .creds{background:#f8f6f3;padding:12px;border-radius:8px;border:1px solid #efe8e6;margin:10px 0}
    .footer{background:#fbf8f6;padding:18px;text-align:center;color:#8c7a66;font-size:12px}
    .cta{display:inline-block;margin-top:18px;padding:10px 22px;background:#b04d4a;color:#fff;border-radius:8px;text-decoration:none}
  </style>
</head>
<body>
  <div class="card">
    <div style="position:relative">
      <div style="position:absolute;left:50%;transform:translateX(-50%);top:-28px;background:#fff;border-radius:999px;padding:8px;box-shadow:0 6px 18px rgba(0,0,0,0.08);border:6px solid #f4ece2">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21s-7.5-4.5-9-7.5C1 10.5 4.5 6 8.5 6 10 6 12 7.5 12 7.5S14 6 15.5 6C19.5 6 23 10.5 21 13.5 19.5 16.5 12 21 12 21z" fill="#b04d4a" />
        </svg>
      </div>
      <div class="mast" style="padding-top:36px">
        <h1>Bem-vinda ao Clube das Leitoras</h1>
      </div>
    </div>
    <div class="body">
      <p>Olá <strong>${escapeHtml(nome)}</strong>,</p>
      <p>Sua solicitação foi aprovada! Abaixo estão seus dados para o primeiro acesso:</p>
      <div class="creds">
        <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
        <p><strong>Senha temporária:</strong> <code style="background:#fff;padding:2px 6px;border-radius:4px">${escapeHtml(senha)}</code></p>
      </div>
      <p>Ao entrar, escolha <em>Alterar senha</em> para criar sua senha definitiva.</p>
      <p><a class="cta" href="${siteUrl}/login" target="_blank">Entrar no Clube</a></p>
    </div>
    <div class="footer">Se precisar de ajuda, responda este e-mail. Clube das Leitoras • Brasília</div>
  </div>
</body>
</html>`;
}

export function cartaAprovacaoSimples(params: { nome: string; tipo: string; siteUrl?: string }) {
  const { nome, tipo, siteUrl = 'https://clubedasleitoras.com.br' } = params;
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Solicitação aprovada</title>
  <style>
    body{font-family:Georgia,serif;background:#f4ece2;margin:0;padding:20px}
    .card{max-width:640px;margin:28px auto;background:#fff;border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,0.07);overflow:hidden;border:1px solid #efe6df}
    .mast{background:linear-gradient(90deg,#fdf2f3 0%,#fff7f7 100%);padding:28px;text-align:center}
    h1{margin:0;font-family:'Alice',Georgia,serif;color:#b04d4a}
    .body{padding:28px;color:#333;line-height:1.6}
    .footer{background:#fbf8f6;padding:18px;text-align:center;color:#8c7a66;font-size:12px}
    .cta{display:inline-block;margin-top:18px;padding:10px 22px;background:#b04d4a;color:#fff;border-radius:8px;text-decoration:none}
  </style>
</head>
<body>
  <div class="card">
    <div style="position:relative">
      <div style="position:absolute;left:50%;transform:translateX(-50%);top:-28px;background:#fff;border-radius:999px;padding:8px;box-shadow:0 6px 18px rgba(0,0,0,0.08);border:6px solid #f4ece2">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21s-7.5-4.5-9-7.5C1 10.5 4.5 6 8.5 6 10 6 12 7.5 12 7.5S14 6 15.5 6C19.5 6 23 10.5 21 13.5 19.5 16.5 12 21 12 21z" fill="#b04d4a" />
        </svg>
      </div>
      <div class="mast" style="padding-top:36px">
        <h1>Clube das Leitoras</h1>
      </div>
    </div>
    <div class="body">
      <p>Olá <strong>${escapeHtml(nome)}</strong>,</p>
      <p>Sua solicitação para <strong>${escapeHtml(tipo)}</strong> foi aprovada pela curadoria.</p>
      <p>Em breve sua publicação será visível no site do Clube das Leitoras.</p>
      <p><a class="cta" href="${siteUrl}" target="_blank">Visitar o Clube</a></p>
    </div>
    <div class="footer">Se precisar de ajuda, responda este e-mail. Clube das Leitoras • Brasília</div>
  </div>
</body>
</html>`;
}

export function cartaNotificacaoAdmin(params: { tipo: string; nome: string; data: string; detalhesHtml: string; siteUrl?: string }) {
  const { tipo, nome, data, detalhesHtml, siteUrl = 'https://clubedasleitoras.com.br' } = params;
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Nova solicitação</title>
  <style>
    body{font-family:Georgia,serif;background:#f4ece2;margin:0;padding:20px}
    .card{max-width:700px;margin:28px auto;background:#fff;border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,0.07);overflow:hidden;border:1px solid #efe6df}
    .mast{background:linear-gradient(90deg,#f7eef8 0%,#f1f0ff 100%);padding:36px 28px 24px;text-align:center}
    h1{margin:0;font-family:'Alice',Georgia,serif;color:#b04d4a;font-style:italic}
    .body{padding:20px 28px;color:#333;line-height:1.6}
    .footer{background:#fbf8f6;padding:18px;text-align:center;color:#8c7a66;font-size:12px}
    .cta{display:inline-block;margin-top:18px;padding:10px 22px;background:#b04d4a;color:#fff;border-radius:8px;text-decoration:none}
    .meta{font-size:13px;color:#8c7a66;margin-bottom:10px}
  </style>
</head>
<body>
  <div class="card">
    <div style="position:relative">
      <div style="position:absolute;left:50%;transform:translateX(-50%);top:-28px;background:#fff;border-radius:999px;padding:8px;box-shadow:0 6px 18px rgba(0,0,0,0.08);border:6px solid #f4ece2">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21s-7.5-4.5-9-7.5C1 10.5 4.5 6 8.5 6 10 6 12 7.5 12 7.5S14 6 15.5 6C19.5 6 23 10.5 21 13.5 19.5 16.5 12 21 12 21z" fill="#b04d4a" />
        </svg>
      </div>
      <div class="mast" style="padding-top:36px">
        <h1>Clube das Leitoras</h1>
        <div class="meta">Nova solicitação recebida</div>
      </div>
    </div>
    <div class="body">
      <p><strong>Tipo:</strong> ${escapeHtml(tipo)} &nbsp; • &nbsp; <strong>Recebido em:</strong> ${escapeHtml(data)}</p>
      <h3 style="margin-top:6px">${escapeHtml(nome)}</h3>
      <div style="margin-top:12px;padding:14px;background:#f8f6f3;border-radius:8px;border:1px solid #efe8e6">${detalhesHtml}</div>
      <p style="margin-top:12px">Acesse o painel para revisar: <a class="cta" href="${siteUrl}/admin">Ver no Painel</a></p>
    </div>
    <div class="footer">Com carinho — Clube das Leitoras • Brasília</div>
  </div>
</body>
</html>`;
}



function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

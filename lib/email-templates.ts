/**
 * Utilitário para evitar Injeção de Código nos e-mails
 */
function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Configurações de Identidade Visual
const CORES = {
  rosaGabi: "#B04D4A",
  marromPapel: "#8C7A66",
  papelFundo: "#F4ECE2",
  papelCard: "#FDFCFB",
  textoEscuro: "#2C3E50"
};

/**
 * CSS Base - Estilo Lacre de Cera e Carta Acadêmica
 */
const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Alice&display=swap');

  body { 
    font-family: 'Alice', Georgia, serif; 
    background-color: ${CORES.papelFundo}; 
    margin: 0; 
    padding: 30px 10px !important; 
    -webkit-font-smoothing: antialiased; 
  }
  .card { 
    max-width: 580px; 
    margin: 0 auto; 
    background-color: ${CORES.papelCard}; 
    border-radius: 4px; /* Bordas mais retas para parecer papel de carta */
    overflow: hidden; 
    border: 1px solid rgba(0,0,0,0.06); 
    box-shadow: 0 15px 35px rgba(0,0,0,0.05); 
  }
  .mast { 
    padding: 50px 30px 20px; 
    text-align: center; 
  }
  
  /* O Lacre de Cera (Brasão) */
  .lacre-container {
    display: inline-block;
    background-color: ${CORES.rosaGabi};
    width: 70px;
    height: 70px;
    border-radius: 50%;
    margin-bottom: 20px;
    box-shadow: 0 4px 10px rgba(176, 77, 74, 0.4), inset 0 0 15px rgba(0,0,0,0.1);
    border: 2px solid rgba(255,255,255,0.1);
    text-align: center;
    vertical-align: middle;
  }
  .lacre-img {
    width: 35px;
    height: 35px;
    margin-top: 17px;
    filter: brightness(0) invert(1); /* Deixa a logo branca para contrastar com o lacre */
    display: inline-block;
  }

  h1 { 
    margin: 0; 
    font-weight: normal; 
    font-style: italic; 
    color: ${CORES.textoEscuro} !important; 
    font-size: 28px; 
    letter-spacing: -0.5px;
  }
  .tagline { 
    font-size: 10px; 
    font-weight: bold; 
    text-transform: uppercase; 
    letter-spacing: 5px; 
    color: ${CORES.marromPapel}; 
    margin-top: 10px; 
    opacity: 0.7;
  }
  .divider { 
    width: 60px; 
    height: 1px; 
    background-color: ${CORES.rosaGabi}; 
    margin: 25px auto; 
    opacity: 0.4;
  }
  .body { 
    padding: 0 50px 50px; 
    color: ${CORES.textoEscuro}; 
    line-height: 1.8; 
    font-size: 16px; 
    text-align: center;
  }
  .creds-box { 
    background-color: #F9F4EE; 
    padding: 30px; 
    border-radius: 12px; 
    margin: 30px 0; 
    border: 1px dashed ${CORES.marromPapel};
  }
  .footer { 
    background-color: #FBF8F6; 
    padding: 30px; 
    text-align: center; 
    color: ${CORES.marromPapel} !important; 
    font-size: 9px; 
    font-weight: bold; 
    text-transform: uppercase; 
    letter-spacing: 4px; 
  }
  .cta-button { 
    display: inline-block; 
    margin-top: 25px; 
    padding: 18px 36px; 
    background-color: ${CORES.rosaGabi}; 
    color: #ffffff !important; 
    border-radius: 2px; /* Botão mais clássico/quadrado */
    text-decoration: none !important; 
    font-size: 11px; 
    font-weight: bold; 
    text-transform: uppercase; 
    letter-spacing: 2px; 
  }
  .quote-box {
    font-style: italic;
    border-left: 2px solid ${CORES.rosaGabi};
    padding: 15px 25px;
    margin: 25px 0;
    text-align: left;
    background-color: rgba(176, 77, 74, 0.03);
    color: ${CORES.marromPapel};
  }
`;

/**
 * Renderiza o Lacre (Brasão)
 */
function renderLacre(siteUrl: string) {
  return `
    <div class="lacre-container">
      <img src="${siteUrl}/logo-clube-leitoras.png" alt="Selo" class="lacre-img" />
    </div>`;
}

/**
 * 1. CARTA: INSCRIÇÃO EM ANÁLISE
 */
export function cartaInscricaoEmAnalise(params: { nome: string; tipo: string; data: string; resumoHtml?: string; siteUrl?: string }) {
  const { nome, tipo, data, resumoHtml = '', siteUrl = 'https://clubedasleitoras.com.br' } = params;
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="card">
    <div class="mast">
      ${renderLacre(siteUrl)}
      <h1>Clube das Leitoras</h1>
      <div class="tagline">Correspondência Oficial</div>
      <div class="divider"></div>
    </div>
    <div class="body">
      <p>Estimada, <strong>${escapeHtml(nome)}</strong>.</p>
      <p>Acusamos o recebimento de sua solicitação para <strong>${escapeHtml(tipo)}</strong> enviada em ${escapeHtml(data)}.</p>
      <p>Sua mensagem já repousa em nossa curadoria para uma leitura atenta e afetuosa.</p>
      ${resumoHtml ? `<div class="quote-box">${resumoHtml}</div>` : ''}
      <p>Em breve, uma nova carta chegará com a nossa resposta.</p>
      <a class="cta-button" href="${siteUrl}">Visitar a Biblioteca</a>
    </div>
    <div class="footer">Brasília • Curadoria de Afeto</div>
  </div>
</body>
</html>`;
}

/**
 * 2. CARTA: APROVAÇÃO COM SENHA
 */
export function cartaAprovacaoComSenha(params: { nome: string; email: string; senha: string; siteUrl?: string }) {
  const { nome, email, senha, siteUrl = 'https://clubedasleitoras.com.br' } = params;
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="card">
    <div class="mast">
      ${renderLacre(siteUrl)}
      <h1>Seja bem-vinda</h1>
      <div class="tagline">O portal está aberto</div>
      <div class="divider"></div>
    </div>
    <div class="body">
      <p>Olá, <strong>${escapeHtml(nome)}</strong>. É com alegria que confirmamos sua entrada em nosso círculo.</p>
      <p>Suas credenciais de acesso foram geradas e devem ser mantidas em segurança:</p>
      <div class="creds-box">
        <div style="font-size: 10px; color: ${CORES.marromPapel}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px;">Identificação</div>
        <div style="font-weight: bold; margin-bottom: 20px; font-size: 18px;">${escapeHtml(email)}</div>
        <div style="font-size: 10px; color: ${CORES.marromPapel}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px;">Chave de Acesso</div>
        <div style="color: ${CORES.rosaGabi}; font-weight: bold; font-size: 26px; font-family: monospace;">${escapeHtml(senha)}</div>
      </div>
      <p style="font-size: 13px;"><em>Recomendamos a alteração desta senha em seu primeiro acesso.</em></p>
      <a class="cta-button" href="${siteUrl}/login">Entrar no Clube</a>
    </div>
    <div class="footer">Brasília • Curadoria de Afeto</div>
  </div>
</body>
</html>`;
}

/**
 * 3. CARTA: APROVAÇÃO SIMPLES
 */
export function cartaAprovacaoSimples(params: { nome: string; tipo: string; siteUrl?: string }) {
  const { nome, tipo, siteUrl = 'https://clubedasleitoras.com.br' } = params;
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="card">
    <div class="mast">
      ${renderLacre(siteUrl)}
      <h1>Solicitação Aprovada</h1>
      <div class="tagline">Novas páginas esperam</div>
      <div class="divider"></div>
    </div>
    <div class="body">
      <p>Olá, <strong>${escapeHtml(nome)}</strong>.</p>
      <p>Temos o prazer de informar que sua solicitação de <strong>${escapeHtml(tipo)}</strong> foi deferida.</p>
      <p>Tudo está pronto para sua próxima jornada.</p>
      <a class="cta-button" href="${siteUrl}">Ir para o Clube</a>
    </div>
    <div class="footer">Brasília • Curadoria de Afeto</div>
  </div>
</body>
</html>`;
}

/**
 * 4. CARTA: NOTIFICAÇÃO ADMIN
 */
export function cartaNotificacaoAdmin(params: { tipo: string; nome: string; data: string; detalhesHtml: string; siteUrl?: string }) {
  const { tipo, nome, data, detalhesHtml, siteUrl = 'https://clubedasleitoras.com.br' } = params;
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="card">
    <div class="mast">
      ${renderLacre(siteUrl)}
      <h1>Nova Curadoria</h1>
      <div class="tagline">Urgente</div>
      <div class="divider"></div>
    </div>
    <div class="body">
      <p style="font-size: 12px; color: ${CORES.marromPapel};">Data de Registro: ${escapeHtml(data)}</p>
      <h2 style="margin: 10px 0; font-weight: normal;">${escapeHtml(nome)}</h2>
      <p>Enviou uma nova solicitação de <strong>${escapeHtml(tipo)}</strong>.</p>
      <div class="creds-box" style="text-align: left; font-size: 14px;">
        ${detalhesHtml}
      </div>
      <a class="cta-button" href="${siteUrl}/admin">Abrir Painel</a>
    </div>
    <div class="footer">Sistema de Gestão • Clube das Leitoras</div>
  </div>
</body>
</html>`;
}
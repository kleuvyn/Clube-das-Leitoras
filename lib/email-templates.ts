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

// Configurações de Identidade Visual (Baseadas no seu Login)
const CORES = {
  rosaGabi: "#B04D4A",
  marromPapel: "#8C7A66",
  papelFundo: "#F4ECE2",
  papelCard: "#FDFCFB",
  textoEscuro: "#2C3E50"
};

/**
 * CSS Base para todos os e-mails do Clube
 * Focado em legibilidade e estética acadêmica
 */
const baseStyles = `
  body { 
    font-family: 'Alice', Georgia, serif; 
    background-color: ${CORES.papelFundo}; 
    margin: 0; 
    padding: 40px 10px; 
    -webkit-font-smoothing: antialiased; 
  }
  .card { 
    max-width: 580px; 
    margin: 0 auto; 
    background-color: ${CORES.papelCard}; 
    border-radius: 45px; 
    overflow: hidden; 
    border: 1px solid rgba(0,0,0,0.04); 
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08); 
  }
  .mast { 
    padding: 50px 30px 20px; 
    text-align: center; 
  }
  .heart-icon {
    background: ${CORES.rosaGabi};
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }
  h1 { 
    margin: 0; 
    font-weight: 300; 
    font-style: italic; 
    color: ${CORES.textoEscuro}; 
    font-size: 32px; 
    letter-spacing: -1px; 
  }
  .tagline { 
    font-size: 10px; 
    font-weight: bold; 
    text-transform: uppercase; 
    letter-spacing: 0.5em; 
    color: ${CORES.marromPapel}; 
    opacity: 0.7; 
    margin-top: 10px; 
  }
  .divider { 
    width: 40px; 
    height: 1px; 
    background: ${CORES.rosaGabi}; 
    margin: 25px auto; 
    opacity: 0.3; 
  }
  .body { 
    padding: 0 45px 45px; 
    color: ${CORES.textoEscuro}; 
    line-height: 1.8; 
    font-size: 16px; 
    text-align: center;
  }
  .creds-box { 
    background: ${CORES.papelFundo}; 
    padding: 25px; 
    border-radius: 25px; 
    margin: 25px 0; 
    text-align: left;
    border: 1px solid rgba(0,0,0,0.02);
  }
  .footer { 
    background: #FBF8F6; 
    padding: 30px; 
    text-align: center; 
    color: ${CORES.marromPapel}; 
    font-size: 9px; 
    font-weight: bold; 
    text-transform: uppercase; 
    letter-spacing: 0.4em; 
    border-top: 1px solid rgba(0,0,0,0.02); 
  }
  .cta-button { 
    display: inline-block; 
    margin-top: 25px; 
    padding: 18px 35px; 
    background-color: ${CORES.rosaGabi}; 
    color: #ffffff !important; 
    border-radius: 40px; 
    text-decoration: none; 
    font-size: 11px; 
    font-weight: bold; 
    text-transform: uppercase; 
    letter-spacing: 0.2em; 
  }
  .quote-box {
    font-style: italic;
    border-left: 2px solid ${CORES.rosaGabi};
    padding: 10px 20px;
    margin: 20px 0;
    text-align: left;
    background: rgba(176, 77, 74, 0.03);
    color: ${CORES.marromPapel};
  }
`;

/**
 * 1. CARTA: INSCRIÇÃO EM ANÁLISE
 */
export function cartaInscricaoEmAnalise(params: { nome: string; tipo: string; data: string; resumoHtml?: string; siteUrl?: string }) {
  const { nome, tipo, data, resumoHtml = '', siteUrl = 'https://clubedasleitoras.com.br' } = params;
  return `<!doctype html>
<html lang="pt-BR">
<head><style>${baseStyles}</style></head>
<body>
  <div class="card">
    <div class="mast">
      <div class="heart-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 21s-7.5-4.5-9-7.5C1 10.5 4.5 6 8.5 6 10 6 12 7.5 12 7.5S14 6 15.5 6C19.5 6 23 10.5 21 13.5 19.5 16.5 12 21 12 21z"/></svg>
      </div>
      <h1>Clube das Leitoras</h1>
      <div class="tagline">Sua jornada começa aqui</div>
      <div class="divider"></div>
    </div>
    <div class="body">
      <p>Olá, <strong>${escapeHtml(nome)}</strong>.</p>
      <p>Recebemos sua solicitação para <strong>${escapeHtml(tipo)}</strong> enviada em ${escapeHtml(data)}.</p>
      <p>Nossa curadoria recebeu seu pedido com carinho e já iniciou o processo de leitura.</p>
      ${resumoHtml ? `<div class="quote-box">${resumoHtml}</div>` : ''}
      <p>Assim que finalizarmos a análise, você receberá uma nova carta por aqui.</p>
      <a class="cta-button" href="${siteUrl}">Conhecer o Acervo</a>
    </div>
    <div class="footer">Brasília • Curadoria de Afeto</div>
  </div>
</body>
</html>`;
}

/**
 * 2. CARTA: APROVAÇÃO COM SENHA (BOAS-VINDAS)
 */
export function cartaAprovacaoComSenha(params: { nome: string; email: string; senha: string; siteUrl?: string }) {
  const { nome, email, senha, siteUrl = 'https://clubedasleitoras.com.br' } = params;
  return `<!doctype html>
<html lang="pt-BR">
<head><style>${baseStyles}</style></head>
<body>
  <div class="card">
    <div class="mast">
      <div class="heart-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 21s-7.5-4.5-9-7.5C1 10.5 4.5 6 8.5 6 10 6 12 7.5 12 7.5S14 6 15.5 6C19.5 6 23 10.5 21 13.5 19.5 16.5 12 21 12 21z"/></svg>
      </div>
      <h1>Seja bem-vinda</h1>
      <div class="tagline">A Próxima Página espera</div>
      <div class="divider"></div>
    </div>
    <div class="body">
      <p>Olá, <strong>${escapeHtml(nome)}</strong>. É um prazer abrir nossas portas para você.</p>
      <p>Sua entrada foi aprovada! Guarde seus dados de acesso em um lugar seguro:</p>
      <div class="creds-box">
        <div style="font-size: 10px; color: ${CORES.marromPapel}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">E-mail de leitora</div>
        <div style="font-weight: bold; margin-bottom: 20px; font-size: 18px;">${escapeHtml(email)}</div>
        <div style="font-size: 10px; color: ${CORES.marromPapel}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Chave de Acesso</div>
        <code style="color: ${CORES.rosaGabi}; font-weight: bold; font-size: 18px;">${escapeHtml(senha)}</code>
      </div>
      <p style="font-size: 14px; opacity: 0.7;"><em>Dica: Ao entrar, sinta-se à vontade para criar uma senha definitiva no seu perfil.</em></p>
      <a class="cta-button" href="${siteUrl}/login">Entrar no Clube</a>
    </div>
    <div class="footer">Brasília • Curadoria de Afeto</div>
  </div>
</body>
</html>`;
}

/**
 * 3. CARTA: APROVAÇÃO SIMPLES (sem senha)
 */
export function cartaAprovacaoSimples(params: { nome: string; tipo: string; siteUrl?: string }) {
  const { nome, tipo, siteUrl = 'https://clubedasleitoras.com.br' } = params;
  return `<!doctype html>
<html lang="pt-BR">
<head><style>${baseStyles}</style></head>
<body>
  <div class="card">
    <div class="mast">
      <div class="heart-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 21s-7.5-4.5-9-7.5C1 10.5 4.5 6 8.5 6 10 6 12 7.5 12 7.5S14 6 15.5 6C19.5 6 23 10.5 21 13.5 19.5 16.5 12 21 12 21z"/></svg>
      </div>
      <h1>Solicitação Aprovada</h1>
      <div class="tagline">Você está no time</div>
      <div class="divider"></div>
    </div>
    <div class="body">
      <p>Olá, <strong>${escapeHtml(nome)}</strong>.</p>
      <p>Parabéns! Sua solicitação de <strong>${escapeHtml(tipo)}</strong> foi aprovada.</p>
      <p>Acesse o painel para finalizar seu cadastro ou ver seus próximos passos.</p>
      <a class="cta-button" href="${siteUrl}">Ir para o site</a>
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
<head><style>${baseStyles}</style></head>
<body>
  <div class="card">
    <div class="mast">
      <div class="heart-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 21s-7.5-4.5-9-7.5C1 10.5 4.5 6 8.5 6 10 6 12 7.5 12 7.5S14 6 15.5 6C19.5 6 23 10.5 21 13.5 19.5 16.5 12 21 12 21z"/></svg>
      </div>
      <h1>Nova Solicitação</h1>
      <div class="tagline">Curadoria Pendente</div>
      <div class="divider"></div>
    </div>
    <div class="body">
      <p style="font-size: 13px; color: ${CORES.marromPapel};">Recebido em: ${escapeHtml(data)}</p>
      <h2 style="margin: 10px 0;">${escapeHtml(nome)}</h2>
      <p>Enviou uma solicitação de: <strong>${escapeHtml(tipo)}</strong></p>
      <div class="creds-box">
        ${detalhesHtml}
      </div>
      <a class="cta-button" href="${siteUrl}/admin">Abrir Painel</a>
    </div>
    <div class="footer">Sistema de Gestão • Clube das Leitoras</div>
  </div>
</body>
</html>`;
}
import dotenv from 'dotenv';
dotenv.config();
import { sendEmail, getFromAddressFallback } from '../lib/email-client';

async function run() {
  const TEST_EMAIL = process.env.TEST_EMAIL || 'test.kleuvyn@gmail.com';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.clubedasleitoras.com.br';
  const from = getFromAddressFallback();

  const tipos: Array<'leitora' | 'empreendedora' | 'escritora' | 'parceria'> = ['leitora', 'empreendedora', 'escritora', 'parceria'];

  for (const tipo of tipos) {
    console.log('---');
    console.log('Enviando testes para tipo:', tipo);

    const nome = `Teste ${tipo}`;
    const email = TEST_EMAIL;
    const telefone = '+5511999999999';
    const requestDate = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    const detalhesHtml = `
      <p><strong>Tipo:</strong> ${tipo}</p>
      <p><strong>Nome:</strong> ${nome}</p>
      <p><strong>E-mail:</strong> ${email}</p>
      <p><strong>Telefone:</strong> ${telefone}</p>
      <p><strong>Data do pedido:</strong> ${requestDate}</p>
    `;

    try {
      const templates = await import('../lib/email-templates');

      const adminHtml = templates.cartaNotificacaoAdmin
        ? templates.cartaNotificacaoAdmin({ tipo, nome, data: requestDate, detalhesHtml, siteUrl })
        : `<div>${detalhesHtml}</div>`;

      const userHtml = templates.cartaInscricaoEmAnalise
        ? templates.cartaInscricaoEmAnalise({ nome, tipo, data: requestDate, resumoHtml: `<p>Teste de confirmação para ${nome}</p>`, siteUrl })
        : `<div>Teste de confirmação para ${nome}</div>`;

      console.log('Enviando e-mail de notificação (admin) para', TEST_EMAIL);
      await sendEmail({ from, to: TEST_EMAIL, subject: `Teste Brevo - Notificação (${tipo})`, html: adminHtml });
      console.log('OK — notificação (admin) enviada.');

      console.log('Enviando e-mail de confirmação (usuário) para', TEST_EMAIL);
      await sendEmail({ from, to: TEST_EMAIL, subject: `Teste Brevo - Confirmação (${tipo})`, html: userHtml });
      console.log('OK — confirmação (usuário) enviada.');

      // pequeno delay
      await new Promise((r) => setTimeout(r, 800));
    } catch (err: any) {
      console.error('Erro ao enviar para tipo', tipo, err instanceof Error ? err.message : err);
    }
  }

  console.log('Testes finalizados. Verifique os logs e a caixa de entrada do', process.env.TEST_EMAIL || 'test.kleuvyn@gmail.com');
}

run().catch((e) => {
  console.error('Erro fatal no script de teste:', e);
  process.exit(1);
});

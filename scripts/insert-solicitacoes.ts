import dotenv from 'dotenv';
dotenv.config();
console.log('[insert-solicitacoes] DATABASE_URL=', JSON.stringify(process.env.DATABASE_URL));
console.log('[insert-solicitacoes] DATABASE_AUTH_TOKEN present=', !!process.env.DATABASE_AUTH_TOKEN);
import { solicitacoes } from '../lib/db/schema';
import { sendEmail, getFromAddressFallback } from '../lib/email-client';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'clubedasleitorasbsb@gmail.com';

async function run() {
  const { db } = await import('../lib/db');
  console.log('Inserindo solicitações de teste no banco...');

  const exemplos = [
    {
      tipo: 'leitora',
      nome: 'Teste Leitora',
      email: 'teste.leitora@example.com',
      telefone: '11900000000',
      mensagem: 'Quero participar da roda.'
    },
    {
      tipo: 'empreendedora',
      nome: 'Teste Empreendedora',
      email: 'teste.empreendedora@example.com',
      telefone: '11900000001',
      mensagem: 'Vendo produtos literários.'
    },
    {
      tipo: 'escritora',
      nome: 'Teste Escritora',
      email: 'teste.escritora@example.com',
      telefone: '11900000002',
      mensagem: 'Envio sinopse do meu livro.'
    },
    {
      tipo: 'parceria',
      nome: 'Teste Parceria',
      email: 'teste.parceria@example.com',
      telefone: '11900000003',
      mensagem: 'Proposta de parceria editorial.'
    },
  ];

  try {
    const from = getFromAddressFallback();

    for (const s of exemplos) {
      const [inserted] = await db.insert(solicitacoes).values({
        tipo: s.tipo,
        nome: s.nome,
        email: s.email,
        telefone: s.telefone,
        mensagem: s.mensagem,
        status: 'pendente',
      }).returning();
      console.log('Inserido:', inserted.id || inserted);

      try {
        const htmlAdmin = `<p>Nova solicitação:</p><ul><li>Tipo: ${s.tipo}</li><li>Nome: ${s.nome}</li><li>E-mail: ${s.email}</li><li>Telefone: ${s.telefone}</li><li>Mensagem: ${s.mensagem}</li></ul>`;
        await sendEmail({ from, to: ADMIN_EMAIL, subject: `Nova solicitação (${s.tipo})`, html: htmlAdmin });
        console.log('E-mail de notificação admin enviado para', ADMIN_EMAIL);
      } catch (err) {
        console.error('Falha ao enviar e-mail admin:', err);
      }

      try {
        if (s.email) {
          const htmlUser = `<p>Olá ${s.nome},</p><p>Recebemos sua solicitação como ${s.tipo}. Em breve retornamos.</p>`;
          await sendEmail({ from, to: s.email, subject: 'Seu pedido foi recebido', html: htmlUser });
          console.log('E-mail de confirmação usuário enviado para', s.email);
        }
      } catch (err) {
        console.error('Falha ao enviar e-mail usuário:', err);
      }
    }

    console.log('Inserções concluídas.');
  } catch (err) {
    console.error('Erro ao inserir solicitações:', err);
    process.exit(1);
  }
}

run().catch(e => {
  console.error('Erro fatal:', e);
  process.exit(1);
});

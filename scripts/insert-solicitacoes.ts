import dotenv from 'dotenv';
dotenv.config();
console.log('[insert-solicitacoes] DATABASE_URL=', JSON.stringify(process.env.DATABASE_URL));
console.log('[insert-solicitacoes] DATABASE_AUTH_TOKEN present=', !!process.env.DATABASE_AUTH_TOKEN);
import { solicitacoes } from '../lib/db/schema';

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

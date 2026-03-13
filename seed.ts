import 'dotenv/config';
import { db } from './lib/db';
import { colaboradoras, livros, encontros } from './lib/db/schema';
import bcrypt from 'bcryptjs';

const seed = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // 1. Criar admin padrão
    const adminPassword = await bcrypt.hash('admin@2026', 10);
    
    await db.insert(colaboradoras).values([
      {
        email: 'admin@clube-das-leitoras.com.br',
        password: adminPassword,
        name: 'Administradora Clube',
        role: 'admin',
        mustChangePassword: false,
        active: true,
      },
      {
        email: 'clubedasleitorasbsb@gmail.com',
        password: adminPassword,
        name: 'Responsável Clube BSB',
        role: 'admin',
        mustChangePassword: true,
        active: true,
      },
    ]).onConflictDoNothing();

    console.log('✅ Admin criado');

    // 2. (omitido) Autoras não faz parte do seed atual

    // 3. Criar livros (curadoria de meses)
    const livrosData = [
      {
        titulo: 'As coisas que você só vê quando desacelera',
        autor: 'Haemin Sunim',
        sinopse: 'Meditações sobre a vida moderna e a busca de paz interior',
        mes: 'JAN/FEV',
        ano: 2026,
      },
      {
        titulo: 'Nós',
        autor: 'Tamara Klink',
        sinopse: 'Historia de expedições e descobertas extraordinárias',
        mes: 'MAR',
        ano: 2026,
      },
      {
        titulo: 'Violeta',
        autor: 'Isabel Allende',
        sinopse: 'Uma épica familiar que atravessa o século XX',
        mes: 'JUN/JUL',
        ano: 2026,
      },
    ];

    for (const livro of livrosData) {
      const slug = livro.titulo.toLowerCase().replace(/[^\w-]/g, '-').replace(/-+/g, '-');
      await db.insert(livros).values({
        titulo: livro.titulo,
        autor: livro.autor,
        sinopse: livro.sinopse,
        mes: livro.mes,
        ano: livro.ano,
        slug,
      }).onConflictDoNothing();
    }

    console.log('✅ Livros de curadoria criados');

    // 4. Criar encontros de exemplo
    await db.insert(encontros).values([
      {
        titulo: 'Encontro Inaugural - Lançamento do Clube',
        descricao: 'Primeiro encontro das leitoras onde apresentamos a proposta do clube e conhecemos um pouco mais sobre cada uma',
        local: 'Biblioteca Nacional - Brasília',
        data: new Date('2026-01-15T18:30:00'),
        horaInicio: '18:30',
        horaFim: '20:30',
        slug: 'encontro-inaugural-lancamento',
      },
      {
        titulo: 'Discussão do Livro do Mês',
        descricao: 'Encontro dedicado a conversar sobre o livro curado para o mês',
        local: 'Biblioteca Nacional - Brasília',
        data: new Date('2026-02-20T19:00:00'),
        horaInicio: '19:00',
        horaFim: '20:45',
        slug: 'discussao-livro-do-mes',
      },
    ]).onConflictDoNothing();

    console.log('✅ Encontros criados');

    // 5. (omitido) Artigos não fazem parte do seed atual

    console.log('🎉 Seed concluído com sucesso!');
    console.log('');
    console.log('📝 Dados padrão:');
    console.log('   Email Admin: admin@clube-das-leitoras.com.br');
    console.log('   Email Responsável: clubedasleitorasbsb@gmail.com');
    console.log('   Senha temporária (ambos): admin@2026');
    console.log('   Observação: o usuário responsável terá mustChangePassword=true e deverá alterar a senha no primeiro login.');
  } catch (error) {
    console.error('❌ Erro durante seed:', error);
    process.exit(1);
  }
};

seed();

import { db } from './db';
import { colaboradoras } from './db/schema';
import { eq, and } from 'drizzle-orm';

const FROM = 'Clube das Leitoras <no-reply@clubedasleitoras.com.br>';

export type SecaoNotificacao = 'dicas' | 'livro-do-mes' | 'cronograma' | 'rodaonline' | 'leitura' | 'podcast' | 'eventos';

const CONFIG: Record<SecaoNotificacao, {
  cor: string;
  emoji: string;
  titulo: string;
  intro: string;
  subject: string;
  path: string;
}> = {
  'dicas': {
    cor: '#5B7C99',
    emoji: '💡',
    titulo: 'Uma dica especial da Gabi chegou!',
    intro: 'Trouxe uma dica que eu estava ansiosa para compartilhar com você. É daquelas que ficam no coração e nos fazem querer mais — de livros, de vida, de afeto.',
    subject: '💡 Dica especial da Gabi para você!',
    path: '/dicas',
  },
  'livro-do-mes': {
    cor: '#967BB6',
    emoji: '📚',
    titulo: 'O Livro do Mês chegou!',
    intro: 'Estou tão animada para contar — escolhemos a nossa próxima leitura! Mal posso esperar para mergulharmos juntas nessa história e compartilhar cada sentimento dela.',
    subject: '📚 O Livro do Mês chegou, leitora!',
    path: '/livro-do-mes',
  },
  'cronograma': {
    cor: '#CC7222',
    emoji: '📅',
    titulo: 'Novidade no nosso Cronograma!',
    intro: 'Nossa agenda ganhou uma novidade especial! Marquei um momento lindo que quero muito compartilhar com você. Anota aí e reserva esse tempo só nosso.',
    subject: '📅 Novidade na agenda do Clube!',
    path: '/cronograma',
  },
  'rodaonline': {
    cor: '#4F5E46',
    emoji: '🌿',
    titulo: 'Nova Roda Online criada!',
    intro: 'Uma nova Roda Online foi criada e você está convidada! Venha conversar, refletir e se encantar conosco. Esses encontros são minha parte favorita do clube.',
    subject: '🌿 Nova Roda Online — vem com a gente!',
    path: '/rodaonline',
  },
  'leitura': {
    cor: '#B04D4A',
    emoji: '📖',
    titulo: 'Novidade no Caderno de Leitura!',
    intro: 'Tem novidade no nosso Caderno de Leitura! Um novo espaço de reflexões e anotações esperando por você. Venha habitar essas páginas conosco.',
    subject: '📖 Novidade no Caderno de Leitura!',
    path: '/leitura',
  },
  'podcast': {
    cor: '#7B5EA7',
    emoji: '🎙️',
    titulo: 'Novo episódio do podcast chegou!',
    intro: 'Gravei um episódio novo e mal consigo esperar para que você ouça! Coloca o fone, abre o coração e vem comigo nessa conversa.',
    subject: '🎙️ Novo episódio do podcast — ouça agora!',
    path: '/podcast',
  },
  'eventos': {
    cor: '#C17B3F',
    emoji: '🌸',
    titulo: 'Novo encontro na agenda!',
    intro: 'Tenho uma novidade que vai aquecer o seu coração: um novo encontro foi criado! Guarda esse momento — vai ser lindo estar juntas.',
    subject: '🌸 Novo encontro no Clube das Leitoras!',
    path: '/eventos',
  },
};

function gerarHtml(params: {
  nomeDestinataria: string;
  cor: string;
  tituloSecao: string;
  intro: string;
  tituloConteudo: string;
  descricaoConteudo: string;
  urlDestino: string;
  siteUrl: string;
}): string {
  const { nomeDestinataria, cor, tituloSecao, intro, tituloConteudo, descricaoConteudo, urlDestino, siteUrl } = params;

  // Versão clara da cor para fundos (hex + 18 = ~9% opacidade)
  const corClara = cor + '18';
  const corSombra = cor + '40';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <link href="https://fonts.googleapis.com/css2?family=Alice&display=swap" rel="stylesheet"/>
  <title>${tituloSecao}</title>
</head>
<body style="margin:0;padding:0;background-color:#F4ECE2;font-family:'Alice',Georgia,'Times New Roman',serif;">

  <div style="max-width:580px;margin:40px auto;padding:20px 16px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <img
        src="${siteUrl}/logo-clube-leitoras.png"
        alt="Clube das Leitoras"
        width="140"
        style="display:inline-block;max-width:140px;height:auto;opacity:0.9;"
      />
    </div>

    <!-- Card principal (estilo carta) -->
    <div style="background:#FDFBF9;border-radius:48px;border:1px solid rgba(0,0,0,0.05);overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08);">

      <!-- Coração topo -->
      <div style="text-align:center;padding:40px 0 0;">
        <div style="display:inline-block;width:60px;height:60px;border-radius:50%;background:${cor};box-shadow:0 8px 24px ${corSombra};line-height:60px;text-align:center;">
          <span style="font-size:26px;line-height:60px;display:inline-block;">♥</span>
        </div>
      </div>

      <!-- Corpo da carta -->
      <div style="padding:32px 48px 56px;">

        <!-- Título da seção -->
        <h1 style="font-family:'Alice',Georgia,serif;font-size:26px;font-weight:400;font-style:italic;color:#2C3E50;text-align:center;margin:24px 0 8px;">
          ${tituloSecao}
        </h1>
        <div style="width:40px;height:1px;background:${cor};margin:0 auto 36px;opacity:0.35;"></div>

        <!-- Saudação -->
        <p style="font-family:'Alice',Georgia,serif;font-size:17px;font-style:italic;color:#8C7A66;margin:0 0 18px;line-height:1.7;">
          Querida ${nomeDestinataria},
        </p>

        <!-- Texto introdutório -->
        <p style="font-family:'Alice',Georgia,serif;font-size:15px;color:#555;line-height:1.9;margin:0 0 28px;">
          ${intro}
        </p>

        <!-- Card do conteúdo -->
        <div style="background:${corClara};border-left:3px solid ${cor};border-radius:0 20px 20px 0;padding:20px 24px;margin:0 0 36px;">
          <p style="font-family:'Alice',Georgia,serif;font-size:18px;font-style:italic;color:#2C3E50;margin:0 0 10px;font-weight:400;line-height:1.4;">
            ${tituloConteudo}
          </p>
          ${descricaoConteudo ? `<p style="font-size:13px;color:#666;margin:0;line-height:1.75;font-family:'Alice',Georgia,serif;">${descricaoConteudo}</p>` : ''}
        </div>

        <!-- Botão CTA -->
        <div style="text-align:center;margin:0 0 48px;">
          <a
            href="${urlDestino}"
            style="background:${cor};color:#ffffff;padding:16px 52px;border-radius:40px;text-decoration:none;font-family:'Alice',Georgia,serif;font-size:14px;font-style:italic;display:inline-block;box-shadow:0 6px 20px ${corSombra};letter-spacing:0.02em;"
          >
            Ver no Clube →
          </a>
        </div>

        <!-- Assinatura -->
        <div style="border-top:1px solid #f0ebe5;padding-top:32px;text-align:center;">
          <p style="font-family:'Alice',Georgia,serif;font-size:16px;font-style:italic;color:#8C7A66;margin:0 0 2px;">Com todo o meu carinho,</p>
          <p style="font-family:'Alice',Georgia,serif;font-size:26px;font-style:italic;font-weight:400;color:${cor};margin:6px 0 4px;">Gabi Artemis</p>
          <div style="width:30px;height:1px;background:${cor};margin:10px auto;opacity:0.3;"></div>
          <p style="font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:#8C7A66;margin:0;opacity:0.55;font-family:Georgia,serif;">
            Clube das Leitoras · Brasília
          </p>
        </div>

      </div>
    </div>

    <!-- Rodapé discreto -->
    <p style="text-align:center;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#8C7A66;margin:28px 0 0;opacity:0.35;font-family:Georgia,serif;">
      Você recebe este e-mail por ser membro do Clube das Leitoras
    </p>

  </div>

</body>
</html>`;
}

/**
 * Envia email de notificação para todas as leitoras ativas
 * quando um novo conteúdo é publicado em uma seção.
 * Fire-and-forget: não bloqueia a resposta da API.
 */
export async function notificarLeitoras(params: {
  secao: SecaoNotificacao;
  tituloConteudo: string;
  descricaoConteudo?: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const { secao, tituloConteudo, descricaoConteudo = '' } = params;
  const cfg = CONFIG[secao];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clubedasleitoras.com.br';
  const urlDestino = `${siteUrl}${cfg.path}`;

  try {
    const leitoras = await db
      .select({ email: colaboradoras.email, name: colaboradoras.name })
      .from(colaboradoras)
      .where(and(eq(colaboradoras.active, true)));

    if (!leitoras.length) return;

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const emails = leitoras.map((l) => ({
      from: FROM,
      to: l.email,
      subject: cfg.subject,
      html: gerarHtml({
        nomeDestinataria: (l.name ?? 'Leitora').split(' ')[0],
        cor: cfg.cor,
        tituloSecao: cfg.titulo,
        intro: cfg.intro,
        tituloConteudo,
        descricaoConteudo,
        urlDestino,
        siteUrl,
      }),
    }));

    // Envia em lotes de 100 (limite Resend)
    for (let i = 0; i < emails.length; i += 100) {
      await resend.batch.send(emails.slice(i, i + 100));
    }

    console.log(`[notificacao] ${emails.length} emails enviados — seção: ${secao}`);
  } catch (err) {
    console.error('[notificacao] Erro ao enviar notificações:', err);
  }
}

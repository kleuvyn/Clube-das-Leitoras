import 'dotenv/config';
import { notificarLeitoras } from '../lib/notificacao-email.js';

async function main() {
  const ok = await notificarLeitoras({
    secao: 'dicas',
    tituloConteudo: 'Teste de notificação automática',
    descricaoConteudo: 'Se você receber este e-mail, o pipeline está OK.',
  });
  console.log('notificarLeitoras retornou', ok);
}

main().catch((err) => {
  console.error('erro inesperado', err);
  process.exit(1);
});

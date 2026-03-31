export type EmailMessage = { from: string; to: string; subject: string; html: string; text?: string };

function parseFrom(from: string) {
  if (!from) return { name: undefined, email: undefined } as any;
  const m = from.match(/^([^<>]+)<\s*([^<>@\s]+@[^<>@\s]+\.[^<>@\s]+)\s*>$/);
  if (m) return { name: m[1].trim(), email: m[2].toLowerCase() };
  const email = String(from).trim();
  return { name: undefined, email } as any;
}

function htmlToText(html: string) {
  if (!html) return '';
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{2,}/g, '\n\n')
    .trim();
}

export async function sendEmail(msg: EmailMessage) {
  const apiKey = process.env.BREVO_API_KEY ?? process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY não configurada');
  const url = 'https://api.brevo.com/v3/smtp/email';
  const sender = parseFrom(msg.from || process.env.BREVO_FROM || process.env.RESEND_FROM || 'Clube das Leitoras <onboarding@resend.dev>');

  const body = {
    sender: { name: sender.name, email: sender.email },
    to: [{ email: msg.to }],
    subject: msg.subject,
    htmlContent: msg.html,
    textContent: msg.text ?? htmlToText(msg.html),
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let parsed: any = text;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    // keep raw text if not JSON
  }

  if (!res.ok) {
    const err: any = new Error('Brevo send error: ' + res.status + ' ' + res.statusText);
    err.details = parsed;
    console.error('[email-client] Brevo error response:', parsed);
    throw err;
  }

  console.info('[email-client] Brevo success response:', parsed);
  return parsed;
}

export async function sendBatch(messages: EmailMessage[]) {
  // Simple sequential sender to avoid rate-limits; can be optimized later
  for (const m of messages) {
    try {
      await sendEmail(m);
    } catch (e) {
      console.error('[email-client] erro ao enviar email para', m.to, e);
    }
  }
}

export function getFromAddressFallback() {
  return process.env.BREVO_FROM ?? process.env.RESEND_FROM ?? 'Clube das Leitoras <onboarding@resend.dev>';
}

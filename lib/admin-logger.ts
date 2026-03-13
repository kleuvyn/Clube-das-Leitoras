import fs from 'fs';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');
const logFile = path.join(logDir, 'admin-access.log');

export function logAdminBlock(details: { email?: string; role?: string; path?: string; reason?: string }) {
  const line = `${new Date().toISOString()} | BLOCKED | email=${details.email ?? '-'} role=${details.role ?? '-'} path=${details.path ?? '-'} reason=${details.reason ?? '-'}`;
  console.warn('[admin-block]', line);

  // Persiste em arquivo apenas em ambiente local (Vercel tem fs somente leitura)
  if (process.env.NODE_ENV !== 'production') {
    try {
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      fs.appendFileSync(logFile, line + '\n');
    } catch (e) {
      console.error('Falha ao gravar log de admin:', e);
    }
  }
}

import fs from 'fs';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');
const logFile = path.join(logDir, 'admin-access.log');

export function logAdminBlock(details: { email?: string; role?: string; path?: string; reason?: string }) {
  try {
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const line = `${new Date().toISOString()} | BLOCKED | email=${details.email ?? '-'} role=${details.role ?? '-'} path=${details.path ?? '-'} reason=${details.reason ?? '-'}\n`;
    fs.appendFileSync(logFile, line);
  } catch (e) {
    
    console.error('Falha ao gravar log de admin:', e);
  }
}

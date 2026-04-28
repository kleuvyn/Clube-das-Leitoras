import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resenhas } from '@/lib/db/schema';

export const revalidate = 3600;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const staticPages = [
    '/',
    '/livro-do-mes',
    '/dicas',
    '/eventos',
    '/resenhas',
    '/parcerias',
    '/podcast',
    '/votacao',
    '/login',
    '/cadastro',
    '/roda-vozes'
  ];

  const today = new Date().toISOString();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const p of staticPages) {
    xml += `  <url>\n    <loc>${siteUrl}${p}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  // Add resenhas dynamically (limited to avoid timeout)
  try {
    const rows = await withTimeout(
      db.select({ id: resenhas.id, createdAt: resenhas.createdAt }).from(resenhas).orderBy(resenhas.createdAt).limit(500),
      8000,
    );
    for (const r of rows) {
      const loc = `${siteUrl}/resenhas/${r.id}`;
      const lastmod = r.createdAt ? new Date(r.createdAt).toISOString() : today;
      xml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>yearly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }
  } catch (err) {
    console.error('Erro ao gerar sitemap (resenhas):', err);
  }

  xml += '</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
    }
  });
}

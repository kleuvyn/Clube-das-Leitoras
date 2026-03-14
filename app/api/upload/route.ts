import { NextResponse } from 'next/server';
import { requireMember } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/x-wav', 'audio/x-m4a', 'audio/aac'];
const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_AUDIO_TYPES];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_AUDIO_SIZE = 150 * 1024 * 1024;

export async function POST(request: Request) {
  // Vercel Blob client-side upload: o cliente envia JSON com eventos de handshake/conclusão
  const contentType = request.headers.get('content-type') || '';
  if (process.env.BLOB_READ_WRITE_TOKEN && contentType.includes('application/json')) {
    try {
      await requireMember();
    } catch {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    try {
      const { handleUpload } = await import('@vercel/blob/client');
      const body = await request.json();
      const response = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (_pathname) => ({
          allowedContentTypes: ALL_ALLOWED_TYPES,
          maximumSizeInBytes: MAX_AUDIO_SIZE,
        }),
        onUploadCompleted: async ({ blob }) => {
          console.log('Upload concluído:', blob.url);
        },
      });
      return NextResponse.json(response);
    } catch (err: any) {
      console.error('Erro handleUpload Blob:', err);
      return NextResponse.json({ error: 'Erro no upload (Blob)' }, { status: 500 });
    }
  }

  // Upload por FormData: local dev (sem Blob) ou fallback server-side
  try {
    await requireMember();
  } catch {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const isAudio = ALLOWED_AUDIO_TYPES.includes(file.type);
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);

    if (!isImage && !isAudio) {
      return NextResponse.json({ error: 'Tipo não permitido. Use JPG/PNG/WebP para imagens ou MP3/M4A/WAV para áudio.' }, { status: 400 });
    }

    const maxSize = isAudio ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json({ error: isAudio ? 'Áudio muito grande. Máximo 150 MB.' : 'Imagem muito grande. Máximo 5 MB.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Vercel Blob server-side (para arquivos menores via FormData, quando o token está disponível)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob');
      const blob = await put(safeName, file, {
        access: 'public',
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url }, { status: 201 });
    }

    // Fallback: sistema de arquivos local (apenas em desenvolvimento)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, safeName), buffer);

    return NextResponse.json({ url: `/uploads/${safeName}` }, { status: 201 });
  } catch (err: any) {
    console.error('Erro POST /api/upload:', err);
    const msg = process.env.BLOB_READ_WRITE_TOKEN
      ? 'Erro ao salvar arquivo no Blob Storage.'
      : 'Erro ao salvar arquivo. Configure o Vercel Blob Storage (BLOB_READ_WRITE_TOKEN) para uploads em produção.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

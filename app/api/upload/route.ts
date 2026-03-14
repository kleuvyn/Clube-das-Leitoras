import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/x-wav', 'audio/x-m4a', 'audio/aac'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_AUDIO_SIZE = 150 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    await requireAdminOrColaboradora();
  } catch (err: any) {
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

    // Usar Vercel Blob se configurado, senão salvar localmente
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob');
      const blob = await put(safeName, file, {
        access: 'public',
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url }, { status: 201 });
    }

    // Fallback: salvar no sistema de arquivos local (public/uploads/)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, safeName), buffer);

    return NextResponse.json({ url: `/uploads/${safeName}` }, { status: 201 });
  } catch (err: any) {
    console.error('Erro POST /api/upload:', err);
    return NextResponse.json({ error: 'Erro ao salvar arquivo' }, { status: 500 });
  }
}

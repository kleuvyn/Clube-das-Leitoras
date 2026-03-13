import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { requireAdminOrColaboradora } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/x-wav', 'audio/x-m4a', 'audio/aac'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_AUDIO_TYPES];
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadDir, safeName);

    await writeFile(filePath, buffer);

    const url = `/uploads/${safeName}`;
    return NextResponse.json({ url }, { status: 201 });
  } catch (err: any) {
    console.error('Erro POST /api/upload:', err);
    return NextResponse.json({ error: 'Erro ao salvar arquivo' }, { status: 500 });
  }
}

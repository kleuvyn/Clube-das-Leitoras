'use client';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

/**
 * Faz upload de arquivo para o servidor ou Vercel Blob.
 */
export async function uploadFile(file: File): Promise<string> {
  if (process.env.NEXT_PUBLIC_USE_BLOB_CLIENT === 'true') {
    const { upload } = await import('@vercel/blob/client');
    const blob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
    });
    return blob.url;
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);

  if (!isImage) {
    throw new Error('Tipo de arquivo não suportado. Use JPG, PNG, WebP ou GIF.');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Imagem muito grande. Use uma imagem com menos de 2 MB.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Erro ao enviar arquivo.');
  }

  return data.url;
}

/**
 * Faz upload de áudio via Vercel Blob (client-side).
 * Requer NEXT_PUBLIC_USE_BLOB_CLIENT=true e BLOB_READ_WRITE_TOKEN configurados.
 * Caso contrário, orienta o usuário a usar a URL do Spotify/YouTube/Drive.
 */
export async function uploadAudio(file: File): Promise<string> {
  if (process.env.NEXT_PUBLIC_USE_BLOB_CLIENT === 'true') {
    const { upload } = await import('@vercel/blob/client');
    const blob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
    });
    return blob.url;
  }

  throw new Error(
    'Upload direto de áudio não disponível. Cole a URL do Spotify, YouTube ou Google Drive no campo de link abaixo.'
  );
}


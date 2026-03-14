'use client';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Faz upload de uma imagem:
 * - Produção com Vercel Blob (NEXT_PUBLIC_USE_BLOB_CLIENT=true): usa client-side upload
 * - Qualquer outro ambiente: converte para base64 no navegador (sem depender de API ou filesystem)
 *
 * Para áudio: use uploadAudio() separado.
 */
export async function uploadFile(file: File): Promise<string> {
  // Vercel Blob client-side upload (produção com blob configurado)
  if (process.env.NEXT_PUBLIC_USE_BLOB_CLIENT === 'true') {
    const { upload } = await import('@vercel/blob/client');
    const blob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
    });
    return blob.url;
  }

  // Para imagens: converte para base64 no navegador — funciona em qualquer ambiente
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error('Imagem muito grande. Use uma imagem com menos de 2 MB.');
    }
    return fileToBase64(file);
  }

  throw new Error('Tipo de arquivo não suportado. Use JPG, PNG ou WebP.');
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


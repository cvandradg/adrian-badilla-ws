import { WEEKLY_CHECKIN_CONFIG } from '../constants/weekly-checkin.constants';
import type { PreparedProgressImage } from '../types/weekly-progress.types';
import { validateProgressImageFile } from '../utils/weekly-checkin.utils';

async function readImageBitmap(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file);
}

async function renderToBlob(input: {
  source: ImageBitmap;
  maxDimension: number;
  quality: number;
}): Promise<{
  blob: Blob;
  width: number;
  height: number;
}> {
  const { source, maxDimension, quality } = input;
  const scale = Math.min(
    1,
    maxDimension / Math.max(source.width, source.height)
  );
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('No fue posible preparar la imagen.');
  }

  context.drawImage(source, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error('No fue posible comprimir la imagen.'));
          return;
        }

        resolve(result);
      },
      'image/webp',
      quality
    );
  });

  return {
    blob,
    width,
    height,
  };
}

export async function prepareProgressImage(
  file: File
): Promise<PreparedProgressImage> {
  const validation = validateProgressImageFile(file);

  if (!validation.valid) {
    throw new Error(validation.error ?? 'Imagen invalida.');
  }

  const source = await readImageBitmap(file);

  try {
    const main = await renderToBlob({
      source,
      maxDimension: 1600,
      quality: 0.8,
    });
    const thumbnail = await renderToBlob({
      source,
      maxDimension: 320,
      quality: 0.75,
    });

    return {
      mainBlob: main.blob,
      thumbnailBlob: thumbnail.blob,
      contentType: 'image/webp',
      originalSize: file.size,
      compressedSize: main.blob.size,
      width: main.width,
      height: main.height,
    };
  } finally {
    source.close();
  }
}

export function validateProgressImageForUpload(file: File): {
  valid: boolean;
  error: string | null;
} {
  return validateProgressImageFile(file);
}

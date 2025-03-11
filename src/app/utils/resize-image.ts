import pica from 'pica';

export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
      const { width, height } = getNewSize(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      );

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      try {
        await pica().resize(img, canvas);
        canvas.toBlob(
          blob => {
            if (blob) resolve(blob);
            else reject(new Error('Ошибка сжатия изображения'));
          },
          'image/webp',
          0.8
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Ошибка загрузки изображения'));
  });
}

function getNewSize(
  imgWidth: number,
  imgHeight: number,
  maxWidth: number,
  maxHeight: number
) {
  const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
  return {
    width: Math.round(imgWidth * scale),
    height: Math.round(imgHeight * scale)
  };
}

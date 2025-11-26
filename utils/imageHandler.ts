import { ImageMeta } from '../types';

export const processImage = (file: File, quality = 0.8, maxWidth = 1600): Promise<ImageMeta> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas context missing');

        ctx.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL(file.type, quality);

        resolve({
          name: file.name,
          mime: file.type,
          base64,
          width,
          height,
          alt: '', // To be filled by user
        });
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
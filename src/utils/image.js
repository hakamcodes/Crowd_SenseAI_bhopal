const MAX_IMAGE_WIDTH = 1200;
const MAX_IMAGE_HEIGHT = 900;
const JPEG_QUALITY = 0.68;

export function validateImage(file) {
  if (!file) throw new Error("Choose an issue photo.");
  if (!file.type.startsWith("image/")) throw new Error("Only image files are supported.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Image must be under 8 MB before compression.");
}

export async function compressImageToBase64(file) {
  validateImage(file);
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_WIDTH / bitmap.width, MAX_IMAGE_HEIGHT / bitmap.height);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.drawImage(bitmap, 0, 0, width, height);

  const imageData = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  return {
    imageData,
    imageMimeType: "image/jpeg",
    imageSize: Math.ceil((imageData.length * 3) / 4),
    width,
    height,
  };
}

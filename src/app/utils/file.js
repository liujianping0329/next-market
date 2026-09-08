import imageCompression from "browser-image-compression";

export const compressImage = (file) =>
  imageCompression(file, {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1200,
  });
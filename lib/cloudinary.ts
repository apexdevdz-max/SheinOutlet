"use client";

interface CloudinaryLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudinaryLoader({ src, width, quality }: CloudinaryLoaderProps): string {
  // If src is already a full Cloudinary URL, transform it
  if (src.includes("res.cloudinary.com")) {
    const parts = src.split("/upload/");
    if (parts.length === 2) {
      return `${parts[0]}/upload/f_auto,q_${quality || "auto"},w_${width}/${parts[1]}`;
    }
  }

  // If src is a relative path or placeholder, return as-is
  if (src.startsWith("/") || src.startsWith("data:")) {
    return src;
  }

  // Build Cloudinary URL from cloud name and public ID
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_${quality || "auto"},w_${width}/${src}`;
}

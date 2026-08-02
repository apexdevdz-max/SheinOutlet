import { NextResponse } from "next/server";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
const API_KEY = process.env.CLOUDINARY_API_KEY || "";
const API_SECRET = process.env.CLOUDINARY_API_SECRET || "";
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || ""; // fallback for unsigned

// POST /api/admin/upload — Upload files to Cloudinary
// Accepts FormData with multiple 'files' entries
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files");

    if (files.length === 0) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      // Determine resource type (image or video)
      const isVideo = file.type.startsWith("video/");
      const resourceType = isVideo ? "video" : "image";
      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

      const cloudinaryForm = new FormData();
      cloudinaryForm.append("file", file);
      cloudinaryForm.append("folder", "shein-outlet/products");

      if (API_KEY && API_SECRET) {
        // Signed upload
        const timestamp = Math.floor(Date.now() / 1000).toString();
        cloudinaryForm.append("timestamp", timestamp);
        cloudinaryForm.append("api_key", API_KEY);

        // Generate signature
        const signatureString = `folder=shein-outlet/products&timestamp=${timestamp}${API_SECRET}`;
        const encoder = new TextEncoder();
        const data = encoder.encode(signatureString);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        cloudinaryForm.append("signature", signature);
      } else if (UPLOAD_PRESET) {
        // Unsigned upload with preset
        cloudinaryForm.append("upload_preset", UPLOAD_PRESET);
      } else {
        // No credentials — try unsigned without preset (will likely fail on restricted clouds)
        cloudinaryForm.append("upload_preset", "ml_default");
      }

      const res = await fetch(uploadUrl, {
        method: "POST",
        body: cloudinaryForm,
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error("[upload] Cloudinary error:", errBody);
        continue; // Skip failed uploads, don't abort all
      }

      const result = await res.json();
      uploadedUrls.push(result.secure_url);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: "Aucun fichier n'a pu être uploadé. Vérifiez vos clés Cloudinary." },
        { status: 500 }
      );
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (err) {
    console.error("[upload] Error:", err);
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}

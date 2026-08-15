"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

interface ImageCropEditorProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
  /** Aspect ratio of the crop area. Default = 2.5 (banner). Use 3/4 for product images. */
  aspectRatio?: number;
}

/**
 * Instagram-style image crop editor.
 * - Zoom slider
 * - Drag to reposition
 * - Reset button
 * - Configurable aspect ratio
 */
export function ImageCropEditor({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = 2.5,
}: ImageCropEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropChange = useCallback((location: { x: number; y: number }) => setCrop(location), []);
  const onZoomChange = useCallback((z: number) => setZoom(z), []);

  const onCropAreaComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  function handleReset() {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, aspectRatio);
      onCropComplete(blob);
    } catch (err) {
      console.error("Crop error:", err);
    }
    setProcessing(false);
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-black/80 border-b border-white/10">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-white/70 hover:text-white text-sm font-medium transition-colors"
        >
          Annuler
        </button>
        <h3 className="text-white font-semibold text-sm">Recadrer l&apos;image</h3>
        <button
          onClick={handleConfirm}
          disabled={processing}
          className="px-4 py-2 rounded-xl bg-pink-500 text-white text-sm font-semibold hover:bg-pink-600 disabled:opacity-50 transition-colors"
        >
          {processing ? "Traitement..." : "Valider"}
        </button>
      </div>

      {/* Crop Area */}
      <div className="flex-1 relative">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropAreaComplete}
          cropShape="rect"
          showGrid={true}
          style={{
            containerStyle: { background: "#000" },
            cropAreaStyle: {
              border: "2px solid rgba(255,255,255,0.6)",
              borderRadius: "12px",
            },
          }}
        />
      </div>

      {/* Controls: Zoom + Reset */}
      <div className="bg-black/80 border-t border-white/10 px-6 py-4">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <svg className="w-4 h-4 text-white/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <svg className="w-5 h-5 text-white/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </div>

        {/* Reset + hint */}
        <div className="flex items-center justify-center mt-3 gap-4">
          <button
            onClick={handleReset}
            className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Réinitialiser
          </button>
        </div>

        <p className="text-center text-white/30 text-xs mt-2">
          Déplacez l&apos;image et ajustez le zoom pour choisir la zone visible
        </p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
 *  Canvas-based crop utility
 * ──────────────────────────────────────────── */

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area, aspectRatio: number): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d context");

  // Output at a reasonable resolution depending on orientation
  // Portrait (ratio < 1): limit height to 1200px
  // Landscape (ratio >= 1): limit width to 1920px
  let scale: number;
  if (aspectRatio < 1) {
    const maxHeight = 1200;
    scale = Math.min(maxHeight / pixelCrop.height, 1);
  } else {
    const maxWidth = 1920;
    scale = Math.min(maxWidth / pixelCrop.width, 1);
  }

  canvas.width = Math.round(pixelCrop.width * scale);
  canvas.height = Math.round(pixelCrop.height * scale);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      },
      "image/webp",
      0.92
    );
  });
}

import React from "react";
import { X } from "lucide-react";

export default function VideoModal({ videoUrl, onClose }) {
  if (!videoUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      {/* Nút đóng */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-red-400 transition"
      >
        <X size={32} />
      </button>

      {/* Video iframe */}
      <div className="w-full max-w-4xl aspect-video">
        <iframe
          src={videoUrl}
          title="Video"
          className="w-full h-full rounded-xl shadow-lg"
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>
    </div>
  );
}

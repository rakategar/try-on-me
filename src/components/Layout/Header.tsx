"use client";

import { Camera, Info } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Camera className="h-6 w-6 text-white" />
            <h1 className="text-xl font-bold text-white">Try-On-Me</h1>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="rounded-full bg-white/20 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </header>

      {showInfo && (
        <div className="absolute top-16 right-4 z-40 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <button
            onClick={() => setShowInfo(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
          <h3 className="font-bold text-sm mb-2">Tentang Aplikasi</h3>
          <p className="text-xs text-gray-600 mb-2">
            Virtual T-Shirt Try-On menggunakan kamera smartphone untuk mencoba
            kaos secara virtual.
          </p>
          <p className="text-xs text-gray-500">
            Powered by Next.js, Three.js & MediaPipe
          </p>
        </div>
      )}
    </>
  );
}

"use client";

import { X } from "lucide-react";

interface InstructionsProps {
  onClose: () => void;
}

export default function Instructions({ onClose }: InstructionsProps) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cara Menggunakan</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <ol className="space-y-3 text-sm text-gray-700">
          <li className="flex gap-3">
            <span className="flex-shrink-0 font-bold text-blue-600">1.</span>
            <span>
              Klik <strong>"Izinkan Kamera"</strong> dan allow di browser
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 font-bold text-blue-600">2.</span>
            <span>Posisikan diri Anda di depan kamera agar terlihat jelas</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 font-bold text-blue-600">3.</span>
            <span>Pilih warna/desain kaos di bagian bawah</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 font-bold text-blue-600">4.</span>
            <span>Lihat preview kaos 3D yang overlay di kamera</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 font-bold text-blue-600">5.</span>
            <span>Klik tombol kamera putih untuk screenshot</span>
          </li>
        </ol>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-black py-3 font-medium text-white hover:bg-gray-800 transition-colors"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}

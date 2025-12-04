"use client";

import { Camera } from "lucide-react";
import { useState } from "react";

interface PermissionPromptProps {
  onAllow: () => void;
}

export default function PermissionPrompt({ onAllow }: PermissionPromptProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    // Small delay to show loading state
    setTimeout(() => {
      onAllow();
      setIsLoading(false);
    }, 100);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gray-900 p-8 text-center">
      <Camera className="h-16 w-16 text-white mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">
        Izinkan Akses Kamera
      </h2>
      <p className="text-gray-400 mb-6">
        Aplikasi ini membutuhkan akses kamera untuk fitur virtual try-on
      </p>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="rounded-full bg-white px-8 py-3 font-medium text-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        {isLoading ? "Memproses..." : "Izinkan Kamera"}
      </button>
      <p className="text-xs text-gray-500 mt-4">
        Browser akan meminta izin akses kamera
      </p>
    </div>
  );
}

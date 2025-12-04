"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
      <Loader2 className="h-12 w-12 animate-spin text-white mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Try-On-Me</h2>
      <p className="text-sm text-gray-400 mb-4">Memuat aplikasi...</p>
      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">{progress}%</p>
    </div>
  );
}

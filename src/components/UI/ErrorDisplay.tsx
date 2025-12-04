"use client";

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

export default function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-gray-900 p-8 text-center">
      <div className="mb-6 rounded-full bg-red-500/20 p-6">
        <svg
          className="h-12 w-12 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-white mb-3">Terjadi Kesalahan</h2>

      <p className="text-gray-300 mb-6 max-w-md">{error}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-full bg-white px-8 py-3 font-medium text-black hover:bg-gray-100 transition-colors"
        >
          Coba Lagi
        </button>
      )}

      <div className="mt-6 text-xs text-gray-500 space-y-2">
        <p>Tips untuk mengatasi masalah:</p>
        <ul className="list-disc list-inside text-left max-w-xs mx-auto">
          <li>Pastikan browser mendukung kamera</li>
          <li>Periksa pengaturan izin kamera</li>
          <li>Tutup aplikasi lain yang menggunakan kamera</li>
          <li>Refresh halaman dan coba lagi</li>
        </ul>
      </div>
    </div>
  );
}

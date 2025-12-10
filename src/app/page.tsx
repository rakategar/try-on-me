'use client';

import dynamic from 'next/dynamic';
import { Shirt } from 'lucide-react';

// Dynamic import untuk menghindari SSR issues dengan Three.js
const TShirtTryOn = dynamic(
  () => import('@/components/TryOn/TShirtTryOn'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-screen w-full flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-600/20 flex items-center justify-center animate-pulse">
            <Shirt size={40} className="text-purple-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Loading Try-On Experience...</h2>
          <p className="text-gray-400 text-sm">Preparing 3D model and AI...</p>
        </div>
      </div>
    )
  }
);

export default function Home() {
  return (
    <main className="h-screen w-full overflow-hidden bg-black text-white">
      <div className="relative h-full w-full">
        <TShirtTryOn showFPS={true} />
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
          <h1 className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <Shirt size={24} />
            Virtual Try-On
          </h1>
          <p className="text-xs text-gray-300 text-center mt-1">
            AI-Powered • Real-time Body Tracking
          </p>
        </div>
        
        {/* Link to test page */}
        <div className="absolute bottom-4 right-4 z-20">
          <a 
            href="/test-skeleton" 
            className="text-xs text-blue-400 hover:text-blue-300 underline bg-black/50 px-3 py-2 rounded-lg"
          >
            Test skeleton detection →
          </a>
        </div>
      </div>
    </main>
  );
}

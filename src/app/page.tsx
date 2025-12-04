"use client";

import { useState } from "react";
import CameraView from "@/components/Camera/CameraView";
import Header from "@/components/Layout/Header";
import LoadingScreen from "@/components/Layout/LoadingScreen";
import DesignSelector from "@/components/UI/DesignSelector";
import CaptureButton from "@/components/UI/CaptureButton";
import Instructions from "@/components/UI/Instructions";
import DebugInfo from "@/components/UI/DebugInfo";
import MobileLogger from "@/components/UI/MobileLogger";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showDebug, setShowDebug] = useState(false); // Disable debug mode, enable later with toggle
  const [showLogger, setShowLogger] = useState(false); // Disable logger - causing errors
  const [showCamera, setShowCamera] = useState(true); // Toggle camera visibility
  const [showOverlayInfo, setShowOverlayInfo] = useState(true); // Toggle overlay debug info

  return (
    <main className="h-screen-safe w-full overflow-hidden bg-black">
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      <div className="relative h-full w-full">
        <Header />

        <CameraView showCamera={showCamera} showOverlayInfo={showOverlayInfo} />

        <div className="absolute bottom-0 left-0 right-0 z-20 pb-safe">
          <div className="flex flex-col items-center gap-4 p-4">
            <DesignSelector />
            <CaptureButton />

            {/* Camera Toggle Button - BIG AND VISIBLE */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCamera(!showCamera)}
                className={`px-6 py-3 rounded-lg font-bold text-lg ${
                  showCamera 
                    ? 'bg-red-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}
              >
                {showCamera ? '📹 Hide Camera' : '👁️ Show Camera'}
              </button>
              
              <button
                onClick={() => setShowOverlayInfo(!showOverlayInfo)}
                className={`px-6 py-3 rounded-lg font-bold text-lg ${
                  showOverlayInfo 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-500 text-white'
                }`}
              >
                {showOverlayInfo ? 'Hide Info' : 'Show Info'}
              </button>
            </div>

            {/* Debug toggle button */}
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs text-gray-500 underline"
            >
              {showDebug ? "Hide" : "Show"} Debug Info
            </button>
          </div>
        </div>

        {showInstructions && (
          <Instructions onClose={() => setShowInstructions(false)} />
        )}

        {/* Show debug info when enabled */}
        {showDebug && <DebugInfo />}

        {/* Mobile Logger - shows console logs on screen */}
        {showLogger && <MobileLogger />}
      </div>
    </main>
  );
}

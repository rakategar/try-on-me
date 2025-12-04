"use client";

import { useEffect } from 'react';
import SimplePoseOverlay from '../Detection/SimplePoseOverlay';

interface SceneProps {
  videoElement: HTMLVideoElement | null;
  showOverlayInfo?: boolean;
}

export default function Scene({ videoElement, showOverlayInfo = true }: SceneProps) {
  useEffect(() => {
    console.log('🎬 [Scene] Component mounted');
    console.log('📹 [Scene] Video element received:', videoElement);
    console.log('📹 [Scene] Video element type:', typeof videoElement);
    
    if (videoElement) {
      console.log('✅ [Scene] Video element exists!');
      console.log('📹 [Scene] Video readyState:', videoElement.readyState);
      console.log('📹 [Scene] Video dimensions:', {
        width: videoElement.videoWidth,
        height: videoElement.videoHeight,
        clientWidth: videoElement.clientWidth,
        clientHeight: videoElement.clientHeight
      });
    } else {
      console.warn('⚠️ [Scene] Video element is NULL!');
    }
  }, [videoElement]);

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    >
      <div className="absolute top-32 left-4 bg-yellow-500/90 text-black px-3 py-1 rounded text-xs z-50 font-bold">
        📍 Simple Overlay Active
        <br />
        Video: {videoElement ? '✅' : '❌'}
      </div>

      {/* Simple Pose Overlay - NO MediaPipe, just visual reference */}
      {videoElement ? (
        <>
          <SimplePoseOverlay videoElement={videoElement} showOverlayInfo={showOverlayInfo} />
          {showOverlayInfo && (
            <div className="absolute top-52 left-4 bg-green-500/90 text-white px-2 py-1 rounded text-xs z-50">
              SimplePoseOverlay rendered
            </div>
          )}
        </>
      ) : (
        showOverlayInfo && (
          <div className="absolute top-52 left-4 bg-red-500/90 text-white px-2 py-1 rounded text-xs z-50">
            Waiting for video...
          </div>
        )
      )}

      {/* 3D Canvas - temporarily hide to focus on pose detection */}
      {/* <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        className="h-full w-full"
        onCreated={() => console.log("✅ Canvas created successfully")}
      >
        <Lighting />
        <TShirtModel />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas> */}
    </div>
  );
}

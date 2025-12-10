'use client';

import { useState, useCallback } from 'react';
import RealtimePoseCamera from '@/components/PoseCamera/RealtimePoseCamera';
import { Eye, EyeOff, Bone, CircleDot, Activity } from 'lucide-react';

interface Keypoint {
  x: number;
  y: number;
  score: number;
  name?: string;
}

export default function Home() {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  const [showFPS, setShowFPS] = useState(true);
  const [latestKeypoints, setLatestKeypoints] = useState<Keypoint[]>([]);
  const [showControls, setShowControls] = useState(true);

  const handlePoseDetected = useCallback((keypoints: Keypoint[]) => {
    setLatestKeypoints(keypoints);
  }, []);

  // Count detected keypoints
  const detectedCount = latestKeypoints.filter(kp => kp.score > 0.3).length;

  return (
    <main className="h-screen w-full overflow-hidden bg-black text-white">
      {/* Full screen camera with pose detection */}
      <div className="relative h-full w-full">
        <RealtimePoseCamera
          onPoseDetected={handlePoseDetected}
          showSkeleton={showSkeleton}
          showPoints={showPoints}
          showFPS={showFPS}
        />
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <h1 className="text-xl font-bold text-center">
            🤖 Real-time Pose Detection
          </h1>
          <p className="text-xs text-gray-300 text-center mt-1">
            TensorFlow.js + MoveNet Lightning
          </p>
        </div>
        
        {/* Toggle controls button */}
        <button
          onClick={() => setShowControls(!showControls)}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/20 hover:bg-white/30"
        >
          {showControls ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        
        {/* Control Panel */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent">
            {/* Detection info */}
            <div className="text-center mb-4">
              <div className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur">
                <span className="text-lg font-bold">
                  {detectedCount > 0 ? (
                    <span className="text-green-400">✓ Body Detected ({detectedCount}/17)</span>
                  ) : (
                    <span className="text-yellow-400">👋 Stand in front of camera</span>
                  )}
                </span>
              </div>
            </div>
            
            {/* Control buttons */}
            <div className="flex justify-center gap-3 flex-wrap">
              {/* Toggle Skeleton */}
              <button
                onClick={() => setShowSkeleton(!showSkeleton)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  showSkeleton 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <Bone size={20} />
                <span>Skeleton</span>
              </button>
              
              {/* Toggle Points */}
              <button
                onClick={() => setShowPoints(!showPoints)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  showPoints 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <CircleDot size={20} />
                <span>Points</span>
              </button>
              
              {/* Toggle FPS */}
              <button
                onClick={() => setShowFPS(!showFPS)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  showFPS 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <Activity size={20} />
                <span>FPS</span>
              </button>
            </div>
            
            {/* Keypoints detail */}
            {detectedCount > 0 && (
              <div className="mt-4 text-center">
                <details className="inline-block text-left">
                  <summary className="cursor-pointer text-sm text-gray-400 hover:text-white">
                    View keypoints detail →
                  </summary>
                  <div className="mt-2 grid grid-cols-3 gap-1 text-xs max-h-32 overflow-y-auto bg-black/50 rounded-lg p-2">
                    {latestKeypoints.map((kp, i) => (
                      <div
                        key={i}
                        className={`px-2 py-1 rounded ${
                          kp.score > 0.5 ? 'bg-green-900/50' :
                          kp.score > 0.3 ? 'bg-yellow-900/50' : 'bg-red-900/50'
                        }`}
                      >
                        <span className="truncate text-xs">{kp.name?.replace('_', ' ')}</span>
                        <span className="ml-1 opacity-60">{Math.round(kp.score * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
            
            {/* Link to test page */}
            <div className="mt-4 text-center">
              <a 
                href="/test-skeleton" 
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Test with image upload →
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

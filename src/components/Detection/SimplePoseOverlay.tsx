'use client';

import { useEffect, useRef, useState } from 'react';

interface SimplePoseOverlayProps {
  videoElement: HTMLVideoElement;
  showOverlayInfo?: boolean;
}

export default function SimplePoseOverlay({ videoElement, showOverlayInfo = true }: SimplePoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');

  useEffect(() => {
    console.log('[SimplePoseOverlay] Component mounted');
    
    if (!canvasRef.current) {
      console.error('[SimplePoseOverlay] Canvas ref is NULL!');
      setDebugInfo('ERROR: Canvas ref is null!');
      return;
    }

    if (!videoElement) {
      console.error('[SimplePoseOverlay] Video element is NULL!');
      setDebugInfo('ERROR: Video element is null!');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('[SimplePoseOverlay] Failed to get 2D context!');
      setDebugInfo('ERROR: Failed to get 2D context!');
      return;
    }

    console.log('[SimplePoseOverlay] Setup complete, ready to draw');
    setDebugInfo('Setup complete');

    // Set canvas size to match video
    const updateCanvasSize = () => {
      const vw = videoElement.videoWidth || 640;
      const vh = videoElement.videoHeight || 480;
      
      canvas.width = vw;
      canvas.height = vh;
      
      console.log('[SimplePoseOverlay] Canvas size:', vw, 'x', vh);
      setDebugInfo(`Canvas: ${vw}x${vh}`);
    };

    // Wait for video metadata
    if (videoElement.videoWidth === 0) {
      console.log('[SimplePoseOverlay] Waiting for video metadata...');
      videoElement.addEventListener('loadedmetadata', updateCanvasSize);
    } else {
      updateCanvasSize();
    }

    // Draw skeleton
    const drawSkeleton = () => {
      if (canvas.width === 0) {
        console.log('[SimplePoseOverlay] Canvas width is 0, skipping draw');
        return;
      }

      console.log('[SimplePoseOverlay] Drawing skeleton...');
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // Simulated pose landmarks based on human body proportions
      // Coordinates as percentage of canvas size
      const landmarks = [
        { name: 'nose', x: 0.5, y: 0.15 },
        { name: 'left_eye', x: 0.48, y: 0.13 },
        { name: 'right_eye', x: 0.52, y: 0.13 },
        { name: 'left_ear', x: 0.46, y: 0.14 },
        { name: 'right_ear', x: 0.54, y: 0.14 },
        { name: 'left_shoulder', x: 0.43, y: 0.3 },
        { name: 'right_shoulder', x: 0.57, y: 0.3 },
        { name: 'left_elbow', x: 0.4, y: 0.45 },
        { name: 'right_elbow', x: 0.6, y: 0.45 },
        { name: 'left_wrist', x: 0.38, y: 0.58 },
        { name: 'right_wrist', x: 0.62, y: 0.58 },
        { name: 'left_hip', x: 0.45, y: 0.6 },
        { name: 'right_hip', x: 0.55, y: 0.6 },
        { name: 'left_knee', x: 0.45, y: 0.8 },
        { name: 'right_knee', x: 0.55, y: 0.8 },
        { name: 'left_ankle', x: 0.45, y: 0.95 },
        { name: 'right_ankle', x: 0.55, y: 0.95 },
      ];

      // Convert to pixel coordinates
      const points = landmarks.map(lm => ({
        name: lm.name,
        x: lm.x * w,
        y: lm.y * h
      }));

      // Draw skeleton connections
      const connections = [
        // Face
        [1, 3], [2, 4], [0, 1], [0, 2],
        // Upper body
        [5, 6], [5, 7], [7, 9], [6, 8], [8, 10],
        // Torso
        [5, 11], [6, 12], [11, 12],
        // Lower body
        [11, 13], [13, 15], [12, 14], [14, 16],
      ];

      // Draw lines
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 4;
      connections.forEach(([i, j]) => {
        const p1 = points[i];
        const p2 = points[j];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });

      // Draw points
      points.forEach((point, idx) => {
        // Different colors for different body parts
        if (idx < 5) {
          ctx.fillStyle = '#ff00ff'; // Face - magenta
        } else if (idx < 11) {
          ctx.fillStyle = '#00ffff'; // Arms - cyan
        } else if (idx < 13) {
          ctx.fillStyle = '#ffff00'; // Hips - yellow
        } else {
          ctx.fillStyle = '#ff6600'; // Legs - orange
        }
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw point labels
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText(point.name, point.x + 12, point.y + 4);
      });

      console.log('[SimplePoseOverlay] Skeleton drawing complete!');
      setDebugInfo('Skeleton drawn with ' + points.length + ' points');
    };

    // Draw after delays
    setTimeout(drawSkeleton, 500);
    setTimeout(drawSkeleton, 1000);
    const interval = setInterval(drawSkeleton, 2000);

    return () => {
      videoElement.removeEventListener('loadedmetadata', updateCanvasSize);
      clearInterval(interval);
    };
  }, [videoElement]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ 
          zIndex: 50,
          width: '100%',
          height: '100%'
        }}
      />
      
      {showOverlayInfo && (
        <div className="absolute top-20 left-4 bg-black/80 text-white p-3 rounded text-xs font-mono z-[100] max-w-sm">
          <div className="font-bold mb-2">🎯 Skeleton Overlay:</div>
          <div>{debugInfo}</div>
          <div className="mt-2 space-y-1">
            <div>💜 Face</div>
            <div>💙 Arms</div>
            <div>💛 Hips</div>
            <div>🧡 Legs</div>
          </div>
        </div>
      )}
    </>
  );
}

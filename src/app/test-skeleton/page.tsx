'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function TestSkeletonPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState('Loading...');
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx) return;

    const drawSkeletonOnImage = () => {
      if (!imageLoaded) {
        console.log('Image not loaded yet');
        return;
      }

      // Set canvas size to match image
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      const w = canvas.width;
      const h = canvas.height;

      console.log('Canvas size:', w, 'x', h);

      // Clear canvas
      ctx.clearRect(0, 0, w, h);

      // Pose landmarks berdasarkan proporsi tubuh manusia dalam foto
      // Koordinat disesuaikan dengan posisi tubuh di gambar
      const landmarks = [
        { name: 'nose', x: 0.5, y: 0.12 },
        { name: 'left_eye', x: 0.48, y: 0.10 },
        { name: 'right_eye', x: 0.52, y: 0.10 },
        { name: 'left_ear', x: 0.46, y: 0.11 },
        { name: 'right_ear', x: 0.54, y: 0.11 },
        { name: 'left_shoulder', x: 0.42, y: 0.22 },
        { name: 'right_shoulder', x: 0.58, y: 0.22 },
        { name: 'left_elbow', x: 0.38, y: 0.35 },
        { name: 'right_elbow', x: 0.62, y: 0.35 },
        { name: 'left_wrist', x: 0.36, y: 0.48 },
        { name: 'right_wrist', x: 0.64, y: 0.48 },
        { name: 'left_hip', x: 0.45, y: 0.52 },
        { name: 'right_hip', x: 0.55, y: 0.52 },
        { name: 'left_knee', x: 0.45, y: 0.72 },
        { name: 'right_knee', x: 0.55, y: 0.72 },
        { name: 'left_ankle', x: 0.45, y: 0.92 },
        { name: 'right_ankle', x: 0.55, y: 0.92 },
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

      // Draw lines (skeleton)
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 6;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
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

      // Draw points (joints)
      points.forEach((point, idx) => {
        // Different colors for different body parts
        if (idx < 5) {
          ctx.fillStyle = '#ff00ff'; // Face - magenta
          ctx.strokeStyle = '#ffffff';
        } else if (idx < 11) {
          ctx.fillStyle = '#00ffff'; // Arms - cyan
          ctx.strokeStyle = '#ffffff';
        } else if (idx < 13) {
          ctx.fillStyle = '#ffff00'; // Hips - yellow
          ctx.strokeStyle = '#ffffff';
        } else {
          ctx.fillStyle = '#ff6600'; // Legs - orange
          ctx.strokeStyle = '#ffffff';
        }
        
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Draw point labels
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.font = 'bold 16px Arial';
        ctx.strokeText(point.name, point.x + 15, point.y + 5);
        ctx.fillText(point.name, point.x + 15, point.y + 5);
      });

      setStatus('✅ Skeleton rendered! ' + points.length + ' points');
      console.log('Skeleton drawing complete!');
    };

    // Draw when image loads
    if (imageLoaded) {
      setTimeout(drawSkeletonOnImage, 100);
    }
  }, [imageLoaded]);

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setImageLoaded(true);
    setStatus('Image loaded, drawing skeleton...');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">
          🎯 Test Skeleton Detection
        </h1>
        
        <div className="bg-black/50 text-white p-4 rounded mb-4">
          <div className="text-lg font-bold">Status: {status}</div>
          <div className="mt-2 text-sm">
            <div>💜 Magenta = Face (hidung, mata, telinga)</div>
            <div>💙 Cyan = Arms (bahu, siku, pergelangan tangan)</div>
            <div>💛 Yellow = Hips (pinggul)</div>
            <div>🧡 Orange = Legs (lutut, pergelangan kaki)</div>
            <div className="mt-2">🟢 Green lines = Skeleton connections</div>
          </div>
        </div>

        <div className="relative bg-white rounded-lg overflow-hidden">
          {/* Original Image */}
          <img
            ref={imageRef}
            src="/test-image.jpg"
            alt="Test pose"
            className="w-full h-auto"
            onLoad={handleImageLoad}
            onError={() => {
              setStatus('❌ Error loading image. Make sure /public/test-image.jpg exists');
            }}
          />
          
          {/* Skeleton Overlay Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ opacity: 0.9 }}
          />
        </div>

        <div className="mt-4 bg-blue-900 text-white p-4 rounded">
          <h2 className="font-bold mb-2">📋 Cara melihat hasil:</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Upload gambar Anda sebagai <code className="bg-black/30 px-2 py-1 rounded">/public/test-image.jpg</code></li>
            <li>Buka halaman ini: <code className="bg-black/30 px-2 py-1 rounded">http://localhost:3000/test-skeleton</code></li>
            <li>atau via ngrok: <code className="bg-black/30 px-2 py-1 rounded">https://your-ngrok-url/test-skeleton</code></li>
            <li>Skeleton akan otomatis muncul di atas gambar</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';

type Landmark = { name: string; x: number; y: number };
type PosePreset = { name: string; description: string; landmarks: Array<{ name: string; x: number; y: number }> };

const POSE_PRESETS: PosePreset[] = [
  {
    name: 'Standing Normal',
    description: 'Pose berdiri normal, tangan di samping',
    landmarks: [
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
    ]
  },
  {
    name: 'Arms Up',
    description: 'Kedua tangan ke atas',
    landmarks: [
      { name: 'nose', x: 0.5, y: 0.15 },
      { name: 'left_eye', x: 0.48, y: 0.13 },
      { name: 'right_eye', x: 0.52, y: 0.13 },
      { name: 'left_ear', x: 0.46, y: 0.14 },
      { name: 'right_ear', x: 0.54, y: 0.14 },
      { name: 'left_shoulder', x: 0.40, y: 0.24 },
      { name: 'right_shoulder', x: 0.60, y: 0.24 },
      { name: 'left_elbow', x: 0.35, y: 0.15 },
      { name: 'right_elbow', x: 0.65, y: 0.15 },
      { name: 'left_wrist', x: 0.32, y: 0.08 },
      { name: 'right_wrist', x: 0.68, y: 0.08 },
      { name: 'left_hip', x: 0.45, y: 0.50 },
      { name: 'right_hip', x: 0.55, y: 0.50 },
      { name: 'left_knee', x: 0.45, y: 0.70 },
      { name: 'right_knee', x: 0.55, y: 0.70 },
      { name: 'left_ankle', x: 0.45, y: 0.90 },
      { name: 'right_ankle', x: 0.55, y: 0.90 },
    ]
  },
  {
    name: 'Arms Extended',
    description: 'Tangan direntangkan ke samping',
    landmarks: [
      { name: 'nose', x: 0.5, y: 0.14 },
      { name: 'left_eye', x: 0.48, y: 0.12 },
      { name: 'right_eye', x: 0.52, y: 0.12 },
      { name: 'left_ear', x: 0.46, y: 0.13 },
      { name: 'right_ear', x: 0.54, y: 0.13 },
      { name: 'left_shoulder', x: 0.35, y: 0.25 },
      { name: 'right_shoulder', x: 0.65, y: 0.25 },
      { name: 'left_elbow', x: 0.18, y: 0.30 },
      { name: 'right_elbow', x: 0.82, y: 0.30 },
      { name: 'left_wrist', x: 0.08, y: 0.32 },
      { name: 'right_wrist', x: 0.92, y: 0.32 },
      { name: 'left_hip', x: 0.45, y: 0.52 },
      { name: 'right_hip', x: 0.55, y: 0.52 },
      { name: 'left_knee', x: 0.45, y: 0.72 },
      { name: 'right_knee', x: 0.55, y: 0.72 },
      { name: 'left_ankle', x: 0.45, y: 0.92 },
      { name: 'right_ankle', x: 0.55, y: 0.92 },
    ]
  },
  {
    name: 'Casual Pose',
    description: 'Pose santai, satu tangan di pinggul',
    landmarks: [
      { name: 'nose', x: 0.5, y: 0.13 },
      { name: 'left_eye', x: 0.48, y: 0.11 },
      { name: 'right_eye', x: 0.52, y: 0.11 },
      { name: 'left_ear', x: 0.46, y: 0.12 },
      { name: 'right_ear', x: 0.54, y: 0.12 },
      { name: 'left_shoulder', x: 0.40, y: 0.23 },
      { name: 'right_shoulder', x: 0.60, y: 0.23 },
      { name: 'left_elbow', x: 0.35, y: 0.38 },
      { name: 'right_elbow', x: 0.65, y: 0.38 },
      { name: 'left_wrist', x: 0.42, y: 0.50 },
      { name: 'right_wrist', x: 0.68, y: 0.50 },
      { name: 'left_hip', x: 0.44, y: 0.54 },
      { name: 'right_hip', x: 0.56, y: 0.54 },
      { name: 'left_knee', x: 0.43, y: 0.74 },
      { name: 'right_knee', x: 0.57, y: 0.74 },
      { name: 'left_ankle', x: 0.42, y: 0.93 },
      { name: 'right_ankle', x: 0.58, y: 0.93 },
    ]
  },
];

export default function TestSkeletonPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState('⏳ Pilih gambar untuk mulai...');
  const [canvasReady, setCanvasReady] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPoint, setDraggedPoint] = useState<number | null>(null);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Pilih file gambar!');
      return;
    }

    setStatus('📂 Loading image...');
    setCanvasReady(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setStatus('🎨 Drawing skeleton...');
    };
    reader.readAsDataURL(file);
  };

  const handlePresetChange = (presetIndex: number) => {
    setSelectedPreset(presetIndex);
    const preset = POSE_PRESETS[presetIndex];
    const newLandmarks = preset.landmarks.map(lm => ({
      ...lm,
      x: lm.x * imageSize.width,
      y: lm.y * imageSize.height
    }));
    setLandmarks(newLandmarks);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = imageSize.width / rect.width;
    const scaleY = imageSize.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Find if clicking near a point
    const clickRadius = 20 * Math.max(scaleX, scaleY);
    const pointIndex = landmarks.findIndex(lm => {
      const dist = Math.sqrt((lm.x - x) ** 2 + (lm.y - y) ** 2);
      return dist < clickRadius;
    });

    if (pointIndex !== -1) {
      setIsDragging(true);
      setDraggedPoint(pointIndex);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || draggedPoint === null || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = imageSize.width / rect.width;
    const scaleY = imageSize.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const newLandmarks = [...landmarks];
    newLandmarks[draggedPoint] = { ...newLandmarks[draggedPoint], x, y };
    setLandmarks(newLandmarks);
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDraggedPoint(null);
  };

  useEffect(() => {
    if (!imageSrc || !canvasRef.current || !resultCanvasRef.current) return;

    const canvas = canvasRef.current;
    const resultCanvas = resultCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const resultCtx = resultCanvas.getContext('2d');

    if (!ctx || !resultCtx) return;

    const img = new Image();
    img.onload = () => {
      const w = img.width;
      const h = img.height;
      
      setImageSize({ width: w, height: h });
      canvas.width = w;
      canvas.height = h;
      resultCanvas.width = w;
      resultCanvas.height = h;

      // Initialize landmarks with default preset
      const preset = POSE_PRESETS[selectedPreset];
      const initialLandmarks = preset.landmarks.map(lm => ({
        ...lm,
        x: lm.x * w,
        y: lm.y * h
      }));
      setLandmarks(initialLandmarks);

      setStatus('✅ Ready! Drag titik untuk adjust pose');
      setCanvasReady(true);
    };

    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (!canvasRef.current || !resultCanvasRef.current || landmarks.length === 0) return;

    const canvas = canvasRef.current;
    const resultCanvas = resultCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const resultCtx = resultCanvas.getContext('2d');

    if (!ctx || !resultCtx) return;

    const w = imageSize.width;
    const h = imageSize.height;

    // Clear canvases
    ctx.clearRect(0, 0, w, h);
    resultCtx.clearRect(0, 0, w, h);

    // Draw image on result canvas
    const img = new Image();
    img.onload = () => {
      resultCtx.drawImage(img, 0, 0, w, h);

      // Draw skeleton on both canvases
      const connections = [
        [1, 3], [2, 4], [0, 1], [0, 2],
        [5, 6], [5, 7], [7, 9], [6, 8], [8, 10],
        [5, 11], [6, 12], [11, 12],
        [11, 13], [13, 15], [12, 14], [14, 16],
      ];

      [ctx, resultCtx].forEach(context => {
        // Draw lines
        context.strokeStyle = '#00ff00';
        context.lineWidth = Math.max(4, Math.floor(w / 200));
        context.shadowColor = '#000000';
        context.shadowBlur = 3;
        
        connections.forEach(([i, j]) => {
          const p1 = landmarks[i];
          const p2 = landmarks[j];
          if (p1 && p2) {
            context.beginPath();
            context.moveTo(p1.x, p1.y);
            context.lineTo(p2.x, p2.y);
            context.stroke();
          }
        });

        // Draw points
        landmarks.forEach((point, idx) => {
          if (idx < 5) context.fillStyle = '#ff00ff';
          else if (idx < 11) context.fillStyle = '#00ffff';
          else if (idx < 13) context.fillStyle = '#ffff00';
          else context.fillStyle = '#ff6600';
          
          context.strokeStyle = '#ffffff';
          const radius = Math.max(8, Math.floor(w / 100));
          context.lineWidth = 2;
          context.beginPath();
          context.arc(point.x, point.y, radius, 0, 2 * Math.PI);
          context.fill();
          context.stroke();
          
          // Labels
          context.fillStyle = '#ffffff';
          context.strokeStyle = '#000000';
          context.lineWidth = 3;
          context.font = `bold ${Math.max(12, Math.floor(w / 60))}px Arial`;
          context.strokeText(point.name, point.x + 15, point.y + 5);
          context.fillText(point.name, point.x + 15, point.y + 5);
        });
      });
    };
    
    if (imageSrc) img.src = imageSrc;
  }, [landmarks, imageSrc, imageSize]);

  const handleDownload = () => {
    if (!resultCanvasRef.current || !canvasReady) return;
    resultCanvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `skeleton-result-${Date.now()}.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }, 'image/png');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">🎯 Test Skeleton Detection (Interactive)</h1>
        
        {/* File Upload */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-lg mb-4">
          <label className="block">
            <div className="text-white font-bold text-xl mb-3">📸 Upload Gambar:</div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-white file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-lg file:font-semibold file:bg-white file:text-purple-700 hover:file:bg-purple-50 file:cursor-pointer cursor-pointer"
            />
          </label>
        </div>

        {/* Pose Presets */}
        {imageSrc && (
          <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4 rounded-lg mb-4">
            <div className="text-white font-bold text-lg mb-3">🎭 Pilih Pose Preset:</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {POSE_PRESETS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetChange(index)}
                  className={`p-3 rounded-lg font-semibold transition-all ${
                    selectedPreset === index
                      ? 'bg-white text-green-700 shadow-lg scale-105'
                      : 'bg-green-800 text-white hover:bg-green-700'
                  }`}
                >
                  <div className="font-bold">{preset.name}</div>
                  <div className="text-xs mt-1 opacity-90">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Status Panel */}
        <div className="bg-black/50 text-white p-4 rounded mb-4">
          <div className="text-lg font-bold mb-2">Status: {status}</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-4">
            <div>💜 Magenta = Face</div>
            <div>💙 Cyan = Arms</div>
            <div>💛 Yellow = Hips</div>
            <div>🧡 Orange = Legs</div>
          </div>
          
          <button
            onClick={handleDownload}
            disabled={!canvasReady}
            className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
              canvasReady ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            📥 Download Hasil (Gambar + Skeleton)
          </button>
        </div>

        {/* Image Display */}
        {imageSrc && (
          <div className="relative bg-white rounded-lg overflow-hidden">
            <img src={imageSrc} alt="Uploaded" className="w-full h-auto" />
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              className="absolute top-0 left-0 w-full h-full cursor-move"
              style={{ opacity: 0.95 }}
            />
          </div>
        )}

        <canvas ref={resultCanvasRef} className="hidden" />

        {/* Instructions */}
        <div className="mt-4 bg-blue-900 text-white p-4 rounded">
          <h2 className="font-bold text-xl mb-3">📋 Cara Pakai:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Upload gambar foto orang</li>
            <li><strong className="text-yellow-300">Pilih Pose Preset</strong> yang paling sesuai dengan pose di foto</li>
            <li><strong className="text-green-300">Drag & drop titik-titik</strong> untuk adjust posisi skeleton</li>
            <li>Klik <strong>Download Hasil</strong> untuk save</li>
          </ol>
          
          <div className="mt-4 pt-4 border-t border-blue-700">
            <h3 className="font-bold mb-2">💡 Fitur Baru:</h3>
            <ul className="text-sm space-y-1">
              <li>✅ <strong>4 Pose Presets</strong> - Standing Normal, Arms Up, Arms Extended, Casual</li>
              <li>✅ <strong>Drag & Drop</strong> - Klik dan drag titik untuk adjust</li>
              <li>✅ <strong>Interactive Canvas</strong> - Real-time adjustment</li>
              <li>⚡ Tetap super cepat dengan Canvas API!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

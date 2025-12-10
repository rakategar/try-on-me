'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, RefreshCw, Camera, Download } from 'lucide-react';

interface Keypoint {
  x: number;
  y: number;
  score: number;
  name?: string;
}

const KEYPOINT_NAMES = [
  'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
  'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
  'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
];

const SKELETON_CONNECTIONS: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 4],
  [5, 6],
  [5, 7], [7, 9],
  [6, 8], [8, 10],
  [5, 11], [6, 12],
  [11, 12],
  [11, 13], [13, 15],
  [12, 14], [14, 16],
];

export default function TestSkeletonPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Loading AI model...');
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const modelRef = useRef<any>(null);
  const tfRef = useRef<any>(null);
  
  useEffect(() => {
    const loadModel = async () => {
      try {
        setStatus('Loading TensorFlow.js...');
        
        const tf = await import('@tensorflow/tfjs');
        tfRef.current = tf;
        
        await tf.ready();
        setDebugInfo('Backend: ' + tf.getBackend());
        
        setStatus('Loading MoveNet model...');
        
        const modelUrl = 'https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4';
        const model = await tf.loadGraphModel(modelUrl, { fromTFHub: true });
        
        modelRef.current = model;
        setModelReady(true);
        setStatus('AI Model ready! Upload gambar.');
        
      } catch (error) {
        console.error('Error loading model:', error);
        setStatus('Error: ' + String(error));
      }
    };
    
    loadModel();
    
    return () => {
      if (modelRef.current) {
        modelRef.current.dispose?.();
      }
    };
  }, []);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    setStatus('Loading image...');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };
  
  useEffect(() => {
    if (!imageUrl || !modelReady) return;
    
    const detectPose = async () => {
      const img = imageRef.current;
      const model = modelRef.current;
      const tf = tfRef.current;
      
      if (!img || !model || !tf) return;
      
      if (!img.complete) {
        img.onload = () => detectPose();
        return;
      }
      
      try {
        setStatus('Detecting pose...');
        const startTime = performance.now();
        
        const inputSize = 192;
        let imageTensor = tf.browser.fromPixels(img);
        imageTensor = tf.image.resizeBilinear(imageTensor, [inputSize, inputSize]);
        imageTensor = tf.cast(tf.expandDims(imageTensor), 'int32');
        
        const output = await model.predict(imageTensor);
        const keypointsData = await output.data();
        
        const detected: Keypoint[] = [];
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        
        for (let i = 0; i < 17; i++) {
          const y = keypointsData[i * 3];
          const x = keypointsData[i * 3 + 1];
          const score = keypointsData[i * 3 + 2];
          
          detected.push({
            x: x * imgWidth,
            y: y * imgHeight,
            score: score,
            name: KEYPOINT_NAMES[i]
          });
        }
        
        const endTime = performance.now();
        const time = (endTime - startTime).toFixed(0);
        const highConf = detected.filter(kp => kp.score > 0.3).length;
        
        setKeypoints(detected);
        setStatus('Detected ' + highConf + '/17 keypoints (' + time + 'ms)');
        
        imageTensor.dispose();
        output.dispose();
        setIsLoading(false);
        
      } catch (error) {
        console.error('Detection error:', error);
        setStatus('Error: ' + String(error));
        setIsLoading(false);
      }
    };
    
    detectPose();
  }, [imageUrl, modelReady]);
  
  // Draw image + skeleton on canvas
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    if (!ctx || !img.complete || !img.naturalWidth) return;
    
    // Set canvas size
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    // Draw image first
    ctx.drawImage(img, 0, 0);
    
    // If no keypoints yet, just show image
    if (!keypoints.length) return;
    
    // Draw skeleton lines (bright green, thick)
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = Math.max(4, canvas.width / 100);
    ctx.lineCap = 'round';
    
    SKELETON_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = keypoints[startIdx];
      const end = keypoints[endIdx];
      
      if (start && end && start.score > 0.2 && end.score > 0.2) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
    });
    
    // Draw keypoints
    const pointSize = Math.max(6, canvas.width / 60);
    
    keypoints.forEach((kp, index) => {
      if (kp.score > 0.2) {
        // Color by body part
        if (index <= 4) {
          ctx.fillStyle = '#FF0000'; // Head - red
        } else if (index <= 10) {
          ctx.fillStyle = '#00FF00'; // Arms - green
        } else {
          ctx.fillStyle = '#0066FF'; // Legs - blue
        }
        
        // Draw filled circle
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, pointSize, 0, Math.PI * 2);
        ctx.fill();
        
        // White border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
    
  }, [keypoints, imageUrl]);
  
  const handleReset = () => {
    setImageUrl(null);
    setKeypoints([]);
    setStatus(modelReady ? 'Upload gambar untuk detect pose.' : 'Loading...');
  };
  
  // Download hasil dengan skeleton
  const handleDownload = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    
    // Buat canvas baru untuk gabungkan gambar + skeleton
    const downloadCanvas = document.createElement('canvas');
    downloadCanvas.width = img.naturalWidth;
    downloadCanvas.height = img.naturalHeight;
    const ctx = downloadCanvas.getContext('2d');
    if (!ctx) return;
    
    // Gambar image dulu
    ctx.drawImage(img, 0, 0);
    
    // Gambar skeleton lines (hijau tebal)
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = Math.max(4, downloadCanvas.width / 100);
    
    SKELETON_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = keypoints[startIdx];
      const end = keypoints[endIdx];
      
      if (start && end && start.score > 0.2 && end.score > 0.2) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
    });
    
    // Gambar keypoints
    const pointSize = Math.max(8, downloadCanvas.width / 50);
    
    keypoints.forEach((kp, index) => {
      if (kp.score > 0.2) {
        // Warna berdasarkan bagian tubuh
        if (index <= 4) {
          ctx.fillStyle = '#FF0000'; // Kepala - merah
        } else if (index <= 10) {
          ctx.fillStyle = '#00FF00'; // Tangan - hijau
        } else {
          ctx.fillStyle = '#0066FF'; // Kaki - biru
        }
        
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, pointSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Border putih
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Label nama keypoint
        ctx.fillStyle = 'white';
        ctx.font = `bold ${Math.max(12, downloadCanvas.width / 40)}px Arial`;
        ctx.fillText(kp.name || '', kp.x + pointSize + 5, kp.y + 5);
      }
    });
    
    // Download
    const link = document.createElement('a');
    link.download = 'pose-detection-result.png';
    link.href = downloadCanvas.toDataURL('image/png');
    link.click();
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">
          AI Pose Detection
        </h1>
        <p className="text-gray-400 text-center text-sm mb-4">
          TensorFlow.js + MoveNet
        </p>
        
        <div className={`p-3 rounded-lg mb-4 text-center ${
          isLoading ? 'bg-yellow-900/50' : 
          modelReady ? 'bg-green-900/50' : 'bg-blue-900/50'
        }`}>
          <p className="font-medium">{status}</p>
          {debugInfo && <p className="text-xs text-gray-400 mt-1">{debugInfo}</p>}
        </div>
        
        <div className="flex gap-2 mb-4">
          <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition ${
            modelReady ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 cursor-not-allowed'
          }`}>
            <Upload size={20} />
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={!modelReady || isLoading}
            />
          </label>
          
          {imageUrl && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2"
            >
              <RefreshCw size={20} />
            </button>
          )}
          
          {keypoints.length > 0 && (
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
            >
              <Download size={20} />
              <span>Download</span>
            </button>
          )}
        </div>
        
        {imageUrl && (
          <div className="bg-black rounded-lg overflow-hidden">
            {/* Canvas untuk gambar + skeleton (bukan overlay) */}
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
            />
            {/* Hidden image untuk reference */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Uploaded"
              className="hidden"
              crossOrigin="anonymous"
              onLoad={() => {
                // Trigger re-render skeleton setelah gambar load
                if (keypoints.length > 0) {
                  setKeypoints([...keypoints]);
                }
              }}
            />
          </div>
        )}
        
        {keypoints.length > 0 && (
          <div className="mt-4 bg-gray-800 rounded-lg p-4">
            <h3 className="font-bold mb-2">Keypoints:</h3>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {keypoints.map((kp, i) => (
                <div 
                  key={i} 
                  className={`p-2 rounded flex justify-between ${
                    kp.score > 0.5 ? 'bg-green-900/50' : 
                    kp.score > 0.2 ? 'bg-yellow-900/50' : 'bg-red-900/50'
                  }`}
                >
                  <span>{kp.name}</span>
                  <span className="font-mono">{(kp.score * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!imageUrl && modelReady && (
          <div className="mt-4 bg-gray-800 rounded-lg p-6 text-center">
            <Camera size={48} className="mx-auto mb-3 text-gray-500" />
            <p className="text-gray-300">Upload foto dengan pose apapun</p>
            <p className="text-xs text-gray-500 mt-2">AI akan otomatis detect 17 titik tubuh</p>
          </div>
        )}
        
        {isLoading && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Processing...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

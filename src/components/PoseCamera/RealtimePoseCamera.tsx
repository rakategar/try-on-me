'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, Shield, AlertTriangle } from 'lucide-react';

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

type PermissionState = 'prompt' | 'granted' | 'denied' | 'checking';

interface Props {
  onPoseDetected?: (keypoints: Keypoint[]) => void;
  showSkeleton?: boolean;
  showPoints?: boolean;
  showFPS?: boolean;
}

export default function RealtimePoseCamera({ 
  onPoseDetected, 
  showSkeleton = true,
  showPoints = true,
  showFPS = true 
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<any>(null);
  const tfRef = useRef<any>(null);
  const animationRef = useRef<number>(0);
  
  const [status, setStatus] = useState('Initializing...');
  const [isModelReady, setIsModelReady] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [fps, setFps] = useState(0);
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('checking');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  // Check camera permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Check if permission API is available
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setPermissionState(result.state as PermissionState);
          
          // Listen for permission changes
          result.onchange = () => {
            setPermissionState(result.state as PermissionState);
          };
        } else {
          // Safari doesn't support permissions.query for camera
          // We'll show the prompt button and try when clicked
          setPermissionState('prompt');
        }
      } catch (err) {
        // Some browsers don't support this API
        setPermissionState('prompt');
      }
    };
    
    checkPermission();
  }, []);

  // Initialize TensorFlow and MoveNet model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setStatus('Loading TensorFlow.js...');
        
        const tf = await import('@tensorflow/tfjs');
        tfRef.current = tf;
        
        // Set backend to webgl for better performance
        await tf.setBackend('webgl');
        await tf.ready();
        
        setStatus('Loading MoveNet model...');
        
        const modelUrl = 'https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4';
        const model = await tf.loadGraphModel(modelUrl, { fromTFHub: true });
        
        modelRef.current = model;
        setIsModelReady(true);
        setStatus('Model ready!');
        
      } catch (err) {
        console.error('Model loading error:', err);
        setError('Failed to load AI model: ' + String(err));
        setStatus('Error loading model');
      }
    };
    
    loadModel();
    
    return () => {
      if (modelRef.current) {
        modelRef.current.dispose?.();
      }
    };
  }, []);

  // Request camera permission and start camera
  const requestCameraPermission = async () => {
    setIsRequestingPermission(true);
    setError(null);
    
    try {
      setStatus('Requesting camera access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      
      setPermissionState('granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraReady(true);
          setStatus('Running pose detection...');
        };
      }
      
    } catch (err: any) {
      console.error('Camera error:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        setError('Camera permission was denied. Please enable it in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is being used by another application.');
      } else {
        setError('Failed to access camera: ' + err.message);
      }
      
      setStatus('Camera error');
    } finally {
      setIsRequestingPermission(false);
    }
  };

  // Auto-start camera when model is ready and permission is already granted
  useEffect(() => {
    if (isModelReady && permissionState === 'granted' && !isCameraReady) {
      requestCameraPermission();
    }
  }, [isModelReady, permissionState, isCameraReady]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Run pose detection loop
  useEffect(() => {
    if (!isCameraReady || !isModelReady) return;
    
    const detectPose = async () => {
      const video = videoRef.current;
      const model = modelRef.current;
      const tf = tfRef.current;
      
      if (!video || !model || !tf || video.readyState < 2) {
        animationRef.current = requestAnimationFrame(detectPose);
        return;
      }
      
      try {
        const inputSize = 192;
        
        // Create tensor from video
        let imageTensor = tf.browser.fromPixels(video);
        imageTensor = tf.image.resizeBilinear(imageTensor, [inputSize, inputSize]);
        imageTensor = tf.cast(tf.expandDims(imageTensor), 'int32');
        
        // Run inference
        const output = await model.predict(imageTensor);
        const data = await output.data();
        
        // Parse keypoints
        const detected: Keypoint[] = [];
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        
        for (let i = 0; i < 17; i++) {
          const y = data[i * 3];
          const x = data[i * 3 + 1];
          const score = data[i * 3 + 2];
          
          detected.push({
            x: x * videoWidth,
            y: y * videoHeight,
            score,
            name: KEYPOINT_NAMES[i]
          });
        }
        
        setKeypoints(detected);
        onPoseDetected?.(detected);
        
        // Cleanup
        imageTensor.dispose();
        output.dispose();
        
        // Calculate FPS
        frameCountRef.current++;
        const now = performance.now();
        if (now - lastTimeRef.current >= 1000) {
          setFps(frameCountRef.current);
          frameCountRef.current = 0;
          lastTimeRef.current = now;
        }
        
      } catch (err) {
        console.error('Detection error:', err);
      }
      
      animationRef.current = requestAnimationFrame(detectPose);
    };
    
    detectPose();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isCameraReady, isModelReady, onPoseDetected]);

  // Draw skeleton on canvas
  useEffect(() => {
    if (!keypoints.length || !canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    
    if (!ctx) return;
    
    // Match canvas size to video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw skeleton lines
    if (showSkeleton) {
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      
      SKELETON_CONNECTIONS.forEach(([startIdx, endIdx]) => {
        const start = keypoints[startIdx];
        const end = keypoints[endIdx];
        
        if (start && end && start.score > 0.3 && end.score > 0.3) {
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        }
      });
    }
    
    // Draw keypoints
    if (showPoints) {
      keypoints.forEach((kp, index) => {
        if (kp.score > 0.3) {
          // Color by body part
          if (index <= 4) {
            ctx.fillStyle = '#FF0000'; // Head - red
          } else if (index <= 10) {
            ctx.fillStyle = '#00FF00'; // Arms - green
          } else {
            ctx.fillStyle = '#0066FF'; // Legs - blue
          }
          
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 8, 0, Math.PI * 2);
          ctx.fill();
          
          // White border
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    }
    
  }, [keypoints, showSkeleton, showPoints]);

  // Show permission request screen
  const showPermissionScreen = !isCameraReady && isModelReady && (permissionState === 'prompt' || permissionState === 'checking');
  const showDeniedScreen = permissionState === 'denied';

  return (
    <div className="relative w-full h-full bg-black">
      {/* Permission Request Screen */}
      {showPermissionScreen && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
          <div className="text-center p-8 max-w-md">
            {/* Icon */}
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-blue-600/20 flex items-center justify-center">
                <Camera size={48} className="text-blue-400" />
              </div>
            </div>
            
            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-3">
              Camera Access Required
            </h2>
            
            {/* Description */}
            <p className="text-gray-400 mb-6">
              This app needs camera access to detect your body pose in real-time. 
              Your camera feed is processed locally and never uploaded.
            </p>
            
            {/* Privacy note */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
              <Shield size={16} />
              <span>Privacy-first: All processing happens on your device</span>
            </div>
            
            {/* Request button */}
            <button
              onClick={requestCameraPermission}
              disabled={isRequestingPermission || !isModelReady}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                isRequestingPermission || !isModelReady
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {isRequestingPermission ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw size={20} className="animate-spin" />
                  Requesting...
                </span>
              ) : !isModelReady ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw size={20} className="animate-spin" />
                  Loading AI Model...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Camera size={20} />
                  Allow Camera Access
                </span>
              )}
            </button>
            
            {/* Browser instruction */}
            <p className="text-xs text-gray-600 mt-4">
              When prompted, click "Allow" to enable camera access
            </p>
          </div>
        </div>
      )}

      {/* Permission Denied Screen */}
      {showDeniedScreen && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
          <div className="text-center p-8 max-w-md">
            {/* Icon */}
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-red-600/20 flex items-center justify-center">
                <AlertTriangle size={48} className="text-red-400" />
              </div>
            </div>
            
            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-3">
              Camera Access Denied
            </h2>
            
            {/* Description */}
            <p className="text-gray-400 mb-6">
              Camera permission was denied. To use pose detection, please enable camera access in your browser settings.
            </p>
            
            {/* Instructions */}
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-gray-300 font-medium mb-2">How to enable:</p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• <strong>Chrome:</strong> Click 🔒 icon in address bar → Site settings → Camera → Allow</li>
                <li>• <strong>Safari:</strong> Settings → Safari → Camera → Allow</li>
                <li>• <strong>Firefox:</strong> Click 🔒 icon → More Info → Permissions → Camera</li>
              </ul>
            </div>
            
            {/* Retry button */}
            <button
              onClick={() => {
                setPermissionState('prompt');
                setError(null);
              }}
              className="w-full py-4 px-6 rounded-xl font-bold text-lg bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <RefreshCw size={20} />
                Try Again
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Video element (mirrored for selfie view) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
        playsInline
        muted
        autoPlay
      />
      
      {/* Canvas overlay for skeleton (also mirrored) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ transform: 'scaleX(-1)' }}
      />
      
      {/* Status overlay - only show when camera is active */}
      {isCameraReady && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className={`inline-block px-3 py-2 rounded-lg text-sm font-medium ${
            error ? 'bg-red-600' :
            isCameraReady && isModelReady ? 'bg-green-600/80' : 'bg-yellow-600/80'
          }`}>
            {error || status}
          </div>
          
          {/* FPS counter */}
          {showFPS && isCameraReady && isModelReady && (
            <div className="inline-block ml-2 px-3 py-2 rounded-lg text-sm font-medium bg-blue-600/80">
              {fps} FPS
            </div>
          )}
        </div>
      )}
      
      {/* Keypoints count */}
      {keypoints.length > 0 && isCameraReady && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="px-3 py-2 rounded-lg text-sm bg-black/60">
            Detected: {keypoints.filter(kp => kp.score > 0.3).length}/17 keypoints
          </div>
        </div>
      )}
    </div>
  );
}

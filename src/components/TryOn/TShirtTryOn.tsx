'use client';

import { useEffect, useRef, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Camera, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import * as THREE from 'three';

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

// Create a T-shirt shaped geometry
function createTShirtShape() {
  const shape = new THREE.Shape();
  
  // T-shirt outline (normalized to -0.5 to 0.5)
  // Start from left bottom
  shape.moveTo(-0.25, -0.5);  // Left bottom
  shape.lineTo(-0.25, -0.1);  // Left side up
  shape.lineTo(-0.5, -0.1);   // Left sleeve out
  shape.lineTo(-0.5, 0.15);   // Left sleeve up
  shape.lineTo(-0.3, 0.2);    // Left sleeve in (shoulder)
  shape.lineTo(-0.2, 0.35);   // Left collar
  shape.lineTo(-0.1, 0.4);    // Collar left
  shape.lineTo(0, 0.35);      // Collar center
  shape.lineTo(0.1, 0.4);     // Collar right
  shape.lineTo(0.2, 0.35);    // Right collar
  shape.lineTo(0.3, 0.2);     // Right sleeve in (shoulder)
  shape.lineTo(0.5, 0.15);    // Right sleeve up
  shape.lineTo(0.5, -0.1);    // Right sleeve out
  shape.lineTo(0.25, -0.1);   // Right side down
  shape.lineTo(0.25, -0.5);   // Right bottom
  shape.lineTo(-0.25, -0.5);  // Back to start
  
  return shape;
}

// Simple T-Shirt Component
interface TShirtModelProps {
  keypoints: Keypoint[];
  videoWidth: number;
  videoHeight: number;
  color?: string;
}

function TShirtMesh({ keypoints, videoWidth, videoHeight, color = '#3B82F6' }: TShirtModelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  
  // Create T-shirt shape geometry
  const geometry = useMemo(() => {
    const shape = createTShirtShape();
    const geo = new THREE.ShapeGeometry(shape);
    return geo;
  }, []);

  useFrame(() => {
    if (!meshRef.current || keypoints.length === 0) return;

    const leftShoulder = keypoints[5];
    const rightShoulder = keypoints[6];
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];
    
    // Check keypoint validity
    const hasValidKeypoints = 
      leftShoulder?.score > 0.3 && 
      rightShoulder?.score > 0.3 &&
      leftHip?.score > 0.3 && 
      rightHip?.score > 0.3;
    
    if (!hasValidKeypoints) {
      meshRef.current.visible = false;
      return;
    }
    
    meshRef.current.visible = true;
    
    // Calculate body measurements
    const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
    const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipCenterX = (leftHip.x + rightHip.x) / 2;
    const hipCenterY = (leftHip.y + rightHip.y) / 2;
    
    // Center of torso (slightly higher than geometric center for better fit)
    const centerX = (shoulderCenterX + hipCenterX) / 2;
    const centerY = (shoulderCenterY * 0.6 + hipCenterY * 0.4); // Weighted towards shoulders
    
    // Convert to normalized coordinates (-1 to 1)
    // Video is mirrored, so flip X
    const normalizedX = -((centerX / videoWidth) * 2 - 1);
    const normalizedY = -((centerY / videoHeight) * 2 - 1);
    
    // Calculate dimensions
    const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
    const torsoHeight = Math.abs(shoulderCenterY - hipCenterY);
    
    // Convert to 3D scale (relative to viewport)
    const scaleX = (shoulderWidth / videoWidth) * viewport.width * 2.2; // Wider for sleeves
    const scaleY = (torsoHeight / videoHeight) * viewport.height * 1.8; // Extend past hips
    
    // Calculate rotation from shoulder angle
    const shoulderAngle = Math.atan2(
      rightShoulder.y - leftShoulder.y,
      rightShoulder.x - leftShoulder.x
    );
    
    // Smooth transitions
    const lerpFactor = 0.2;
    
    // Update position
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      normalizedX * viewport.width * 0.5,
      lerpFactor
    );
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      normalizedY * viewport.height * 0.5,
      lerpFactor
    );
    
    // Update scale
    meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, scaleX, lerpFactor);
    meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, scaleY, lerpFactor);
    
    // Update rotation (only Z axis for shoulder tilt)
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      -shoulderAngle,
      lerpFactor
    );
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} geometry={geometry}>
      <meshBasicMaterial 
        color={color}
        transparent={true}
        opacity={0.85}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Loading fallback - simple spinning box
function LoadingFallback() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshBasicMaterial color="#8B5CF6" wireframe />
    </mesh>
  );
}

type PermissionState = 'prompt' | 'granted' | 'denied' | 'checking';

interface Props {
  showFPS?: boolean;
}

export default function TShirtTryOn({ showFPS = true }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
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
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });
  const [is3DModelLoaded, setIs3DModelLoaded] = useState(false);
  
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  // Check camera permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setPermissionState(result.state as PermissionState);
          result.onchange = () => {
            setPermissionState(result.state as PermissionState);
          };
        } else {
          setPermissionState('prompt');
        }
      } catch (err) {
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
        await tf.setBackend('webgl');
        await tf.ready();
        
        setStatus('Loading MoveNet model...');
        const modelUrl = 'https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4';
        const model = await tf.loadGraphModel(modelUrl, { fromTFHub: true });
        
        modelRef.current = model;
        setIsModelReady(true);
        setStatus('Model ready! Starting camera...');
        
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

  // Request camera permission
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
          setVideoDimensions({
            width: videoRef.current?.videoWidth || 640,
            height: videoRef.current?.videoHeight || 480,
          });
          setIsCameraReady(true);
          setStatus('Running pose detection...');
        };
      }
      
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        setError('Camera permission was denied.');
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

  // Auto-start camera
  useEffect(() => {
    if (isModelReady && permissionState === 'granted' && !isCameraReady) {
      requestCameraPermission();
    }
  }, [isModelReady, permissionState, isCameraReady]);

  // Cleanup
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
        let imageTensor = tf.browser.fromPixels(video);
        imageTensor = tf.image.resizeBilinear(imageTensor, [inputSize, inputSize]);
        imageTensor = tf.cast(tf.expandDims(imageTensor), 'int32');
        
        const output = await model.predict(imageTensor);
        const data = await output.data();
        
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
  }, [isCameraReady, isModelReady]);

  const showPermissionScreen = !isCameraReady && isModelReady && (permissionState === 'prompt' || permissionState === 'checking');
  const showDeniedScreen = permissionState === 'denied';

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Permission Request Screen */}
      {showPermissionScreen && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
          <div className="text-center p-8 max-w-md">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-blue-600/20 flex items-center justify-center">
                <Camera size={48} className="text-blue-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Camera Access Required
            </h2>
            <p className="text-gray-400 mb-6">
              This app needs camera access to detect your body and overlay a virtual T-shirt in real-time.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
              <Shield size={16} />
              <span>Privacy-first: All processing happens on your device</span>
            </div>
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
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-red-600/20 flex items-center justify-center">
                <AlertTriangle size={48} className="text-red-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Camera Access Denied
            </h2>
            <p className="text-gray-400 mb-6">
              Camera permission was denied. Please enable camera access in your browser settings.
            </p>
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-gray-300 font-medium mb-2">How to enable:</p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• <strong>Chrome:</strong> Click 🔒 icon → Site settings → Camera → Allow</li>
                <li>• <strong>Safari:</strong> Settings → Safari → Camera → Allow</li>
                <li>• <strong>Firefox:</strong> Click 🔒 icon → More Info → Permissions</li>
              </ul>
            </div>
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
      
      {/* Three.js Canvas Overlay for 3D T-Shirt */}
      {isCameraReady && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        >
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            gl={{ alpha: true, antialias: true }}
            style={{ background: 'transparent' }}
            onCreated={() => setIs3DModelLoaded(true)}
          >
            <ambientLight intensity={1} />
            
            <Suspense fallback={<LoadingFallback />}>
              <TShirtMesh 
                keypoints={keypoints}
                videoWidth={videoDimensions.width}
                videoHeight={videoDimensions.height}
                color="#3B82F6"
              />
            </Suspense>
          </Canvas>
        </div>
      )}
      
      {/* Status overlay */}
      {isCameraReady && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className={`inline-block px-3 py-2 rounded-lg text-sm font-medium ${
            error ? 'bg-red-600' :
            isCameraReady && isModelReady ? 'bg-green-600/80' : 'bg-yellow-600/80'
          }`}>
            {error || status}
          </div>
          
          {showFPS && isCameraReady && isModelReady && (
            <div className="inline-block ml-2 px-3 py-2 rounded-lg text-sm font-medium bg-blue-600/80">
              {fps} FPS
            </div>
          )}
          
          {is3DModelLoaded && (
            <div className="inline-block ml-2 px-3 py-2 rounded-lg text-sm font-medium bg-purple-600/80">
              👕 3D Model Active
            </div>
          )}
        </div>
      )}
      
      {/* Body tracking info */}
      {keypoints.length > 0 && isCameraReady && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="px-3 py-2 rounded-lg text-sm bg-black/60">
            Body Tracking: {keypoints.filter(kp => kp.score > 0.3).length}/17 points
          </div>
        </div>
      )}
    </div>
  );
}

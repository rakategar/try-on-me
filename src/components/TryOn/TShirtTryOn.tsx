'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
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

// 3D T-Shirt Model Component
interface TShirtModelProps {
  keypoints: Keypoint[];
  videoWidth: number;
  videoHeight: number;
}

function TShirtModel({ keypoints, videoWidth, videoHeight }: TShirtModelProps) {
  const obj = useLoader(OBJLoader, '/desainSatu/desainSatu.obj');
  const meshRef = useRef<THREE.Group>(null);
  const { viewport, camera } = useThree();
  
  // Load texture
  const texture = useLoader(THREE.TextureLoader, '/desainSatu/texture_diffuse.png');
  
  // Apply texture to all meshes in the OBJ
  useEffect(() => {
    if (obj) {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.95,
          });
        }
      });
    }
  }, [obj, texture]);

  useFrame(() => {
    if (!meshRef.current || keypoints.length === 0) return;

    // Get key body points (indices: 5=left_shoulder, 6=right_shoulder, 11=left_hip, 12=right_hip)
    const leftShoulder = keypoints[5];
    const rightShoulder = keypoints[6];
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];
    
    // Only update if we have good keypoints
    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return;
    if (leftShoulder.score < 0.3 || rightShoulder.score < 0.3) return;
    if (leftHip.score < 0.3 || rightHip.score < 0.3) return;
    
    // Calculate center of torso
    const centerX = (leftShoulder.x + rightShoulder.x + leftHip.x + rightHip.x) / 4;
    const centerY = (leftShoulder.y + rightShoulder.y + leftHip.y + rightHip.y) / 4;
    
    // Convert screen coordinates to 3D space (normalized -1 to 1)
    // Note: Video is mirrored, so we need to flip X
    const normalizedX = -((centerX / videoWidth) * 2 - 1);
    const normalizedY = -((centerY / videoHeight) * 2 - 1);
    
    // Calculate scale based on shoulder width
    const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
    const torsoHeight = Math.abs(
      (leftShoulder.y + rightShoulder.y) / 2 - 
      (leftHip.y + rightHip.y) / 2
    );
    
    // Scale factor (adjust these values based on your model size)
    const baseScale = 0.0015; // Adjust this based on your model size
    const scaleFromWidth = (shoulderWidth / videoWidth) * 8;
    const scale = Math.max(0.3, Math.min(2, scaleFromWidth)) * baseScale;
    
    // Calculate rotation based on shoulder angle
    const shoulderAngle = Math.atan2(
      rightShoulder.y - leftShoulder.y,
      rightShoulder.x - leftShoulder.x
    );
    
    // Calculate body tilt (front/back lean) based on hip vs shoulder
    const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipCenterY = (leftHip.y + rightHip.y) / 2;
    const bodyTilt = Math.atan2(hipCenterY - shoulderCenterY, torsoHeight) * 0.3;
    
    // Smooth transitions
    const lerpFactor = 0.3;
    
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
    const targetScale = scale * 100; // Adjust multiplier based on model
    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, lerpFactor)
    );
    
    // Update rotation (Z for shoulder tilt, X for body lean)
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      -shoulderAngle,
      lerpFactor
    );
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      Math.PI + bodyTilt, // Model might need rotation to face camera
      lerpFactor
    );
  });

  return (
    <group ref={meshRef} position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
      <primitive object={obj.clone()} />
    </group>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="gray" wireframe />
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
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <directionalLight position={[-5, 5, 5]} intensity={0.5} />
            
            <Suspense fallback={<LoadingFallback />}>
              <TShirtModel 
                keypoints={keypoints}
                videoWidth={videoDimensions.width}
                videoHeight={videoDimensions.height}
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

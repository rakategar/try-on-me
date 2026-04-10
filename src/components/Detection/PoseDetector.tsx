"use client";

import { useEffect, useState, useRef } from "react";

interface PoseDetectorProps {
  videoElement: HTMLVideoElement;
  onPoseDetected?: (landmarks: any) => void;
}

export default function PoseDetector({ videoElement, onPoseDetected }: PoseDetectorProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [landmarks, setLandmarks] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw landmarks on canvas
  useEffect(() => {
    if (!landmarks || !canvasRef.current || !videoElement) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = videoElement.videoWidth || 640;
    canvas.height = videoElement.videoHeight || 480;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw landmarks
    landmarks.forEach((landmark: any, index: number) => {
      const x = landmark.x * canvas.width;
      const y = landmark.y * canvas.height;

      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = index < 11 ? "#00ff00" : "#ff00ff"; // Green for upper body, magenta for lower
      ctx.fill();

      // Draw landmark number
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px Arial";
      ctx.fillText(index.toString(), x + 8, y);
    });

    // Draw connections (skeleton)
    const connections = [
      [11, 12], // shoulders
      [11, 13], [13, 15], // left arm
      [12, 14], [14, 16], // right arm
      [11, 23], [12, 24], // torso
      [23, 24], // hips
    ];

    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 2;

    connections.forEach(([start, end]) => {
      const startLandmark = landmarks[start];
      const endLandmark = landmarks[end];
      
      if (startLandmark && endLandmark) {
        ctx.beginPath();
        ctx.moveTo(startLandmark.x * canvas.width, startLandmark.y * canvas.height);
        ctx.lineTo(endLandmark.x * canvas.width, endLandmark.y * canvas.height);
        ctx.stroke();
      }
    });

    console.log("🎯 Drawing landmarks:", landmarks.length);
  }, [landmarks, videoElement]);

  useEffect(() => {
    if (!videoElement || typeof window === "undefined") return;

    console.log("🔧 Initializing PoseDetector...");

    // Dynamic import untuk MediaPipe (client-side only)
    const initPoseDetection = async () => {
      try {
        console.log("📦 Loading MediaPipe Pose...");
        
        // Import MediaPipe dynamically
        const { Pose } = await import("@mediapipe/pose");
        const { Camera } = await import("@mediapipe/camera_utils");

        console.log("✅ MediaPipe loaded successfully");

        const pose = new Pose({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          },
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        console.log("⚙️ Pose options configured");

        pose.onResults((results: any) => {
          if (results.poseLandmarks) {
            setLandmarks(results.poseLandmarks);
            if (onPoseDetected) {
              onPoseDetected(results.poseLandmarks);
            }
            console.log("✅ Pose detected! Landmarks:", results.poseLandmarks.length);
          } else {
            console.log("⏳ No pose detected yet...");
          }
        });

        const camera = new Camera(videoElement, {
          onFrame: async () => {
            await pose.send({ image: videoElement });
          },
          width: 1280,
          height: 720,
        });

        console.log("📹 Starting camera for pose detection...");
        camera.start();
        setIsInitialized(true);
        console.log("✅ Pose detection initialized!");

        return () => {
          camera.stop();
          pose.close();
          console.log("🛑 Pose detection stopped");
        };
      } catch (error) {
        console.error("❌ Error initializing pose detection:", error);
      }
    };

    initPoseDetection();
  }, [videoElement, onPoseDetected]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
}

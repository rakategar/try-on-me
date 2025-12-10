"use client";

import { useEffect, useRef, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";

export default function TestSkeletonPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("⏳ Pilih gambar untuk mulai...");
  const [canvasReady, setCanvasReady] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Initialize TensorFlow and Pose Detector
  useEffect(() => {
    const initDetector = async () => {
      try {
        setStatus("🤖 Initializing AI model...");
        console.log("Loading TensorFlow.js...");

        await tf.ready();
        console.log("TensorFlow ready!");

        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        };

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          detectorConfig
        );

        setDetector(detector);
        setStatus("✅ AI model ready! Upload gambar untuk deteksi pose");
        console.log("Pose detector initialized successfully");
      } catch (error) {
        console.error("Error initializing detector:", error);
        setStatus("❌ Error loading AI model: " + (error as Error).message);
      }
    };

    initDetector();

    return () => {
      if (detector) {
        detector.dispose();
      }
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Pilih file gambar!");
      return;
    }

    setStatus("📂 Loading image...");
    setCanvasReady(false);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (
      !imageSrc ||
      !canvasRef.current ||
      !resultCanvasRef.current ||
      !detector
    )
      return;

    const detectPose = async () => {
      try {
        setStatus("🎨 Detecting pose...");

        const canvas = canvasRef.current!;
        const resultCanvas = resultCanvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        const resultCtx = resultCanvas.getContext("2d")!;

        const img = new Image();
        img.onload = async () => {
          const w = img.width;
          const h = img.height;

          canvas.width = w;
          canvas.height = h;
          resultCanvas.width = w;
          resultCanvas.height = h;

          ctx.clearRect(0, 0, w, h);
          resultCtx.clearRect(0, 0, w, h);
          resultCtx.drawImage(img, 0, 0, w, h);

          console.log("Running pose detection...");
          setStatus("🔍 Analyzing body pose...");

          // Detect pose
          const poses = await detector.estimatePoses(img);

          if (poses.length === 0) {
            setStatus("❌ No pose detected! Try another image");
            setIsLoading(false);
            return;
          }

          const pose = poses[0];
          console.log("Pose detected:", pose);
          console.log("Keypoints:", pose.keypoints.length);

          // Draw skeleton on both canvases
          drawSkeleton(ctx, pose.keypoints, w, h);
          drawSkeleton(resultCtx, pose.keypoints, w, h);

          setStatus(`✅ Pose detected! ${pose.keypoints.length} keypoints`);
          setCanvasReady(true);
          setIsLoading(false);
        };

        img.onerror = () => {
          setStatus("❌ Error loading image");
          setIsLoading(false);
        };

        img.src = imageSrc;
      } catch (error) {
        console.error("Pose detection error:", error);
        setStatus("❌ Error: " + (error as Error).message);
        setIsLoading(false);
      }
    };

    detectPose();
  }, [imageSrc, detector]);

  const drawSkeleton = (
    ctx: CanvasRenderingContext2D,
    keypoints: poseDetection.Keypoint[],
    width: number,
    height: number
  ) => {
    // MoveNet connections
    const connections = [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4], // Head
      [5, 6],
      [5, 7],
      [7, 9],
      [6, 8],
      [8, 10], // Arms
      [5, 11],
      [6, 12],
      [11, 12], // Torso
      [11, 13],
      [13, 15],
      [12, 14],
      [14, 16], // Legs
    ];

    const minConfidence = 0.3;

    // Draw connections (lines)
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = Math.max(3, Math.floor(width / 200));
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 3;

    connections.forEach(([i, j]) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];

      if (
        kp1 &&
        kp2 &&
        kp1.score! > minConfidence &&
        kp2.score! > minConfidence
      ) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.stroke();
      }
    });

    // Draw keypoints (circles)
    keypoints.forEach((keypoint, idx) => {
      if (keypoint.score! < minConfidence) return;

      // Color based on body part
      if (idx < 5) {
        ctx.fillStyle = "#ff00ff"; // Head - magenta
      } else if (idx < 11) {
        ctx.fillStyle = "#00ffff"; // Arms - cyan
      } else if (idx < 13) {
        ctx.fillStyle = "#ffff00"; // Torso - yellow
      } else {
        ctx.fillStyle = "#ff6600"; // Legs - orange
      }

      ctx.strokeStyle = "#ffffff";
      const radius = Math.max(6, Math.floor(width / 100));
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Draw label
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.font = `bold ${Math.max(10, Math.floor(width / 70))}px Arial`;
      const label = `${keypoint.name} ${Math.round(keypoint.score! * 100)}%`;
      ctx.strokeText(label, keypoint.x + 10, keypoint.y + 5);
      ctx.fillText(label, keypoint.x + 10, keypoint.y + 5);
    });
  };

  const handleDownload = () => {
    if (!resultCanvasRef.current || !canvasReady) return;
    resultCanvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `skeleton-detected-${Date.now()}.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }, "image/png");
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">
          🤖 Real-Time Pose Detection
        </h1>
        <p className="text-gray-300 mb-4">
          Powered by TensorFlow.js MoveNet Model
        </p>

        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-lg mb-4">
          <label className="block">
            <div className="text-white font-bold text-xl mb-3">
              📸 Upload Gambar untuk Deteksi Pose:
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={!detector || isLoading}
              className="block w-full text-white file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-lg file:font-semibold file:bg-white file:text-purple-700 hover:file:bg-purple-50 file:cursor-pointer cursor-pointer disabled:opacity-50"
            />
          </label>
          <div className="mt-3 text-white text-sm">
            ✅ Format: JPG, PNG, WebP | 📏 Recommended: 1-5MB
          </div>
        </div>

        <div className="bg-black/50 text-white p-4 rounded mb-4">
          <div className="text-lg font-bold mb-2">
            {isLoading && <span className="animate-pulse">⏳ </span>}
            Status: {status}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-4">
            <div>💜 Magenta = Head</div>
            <div>💙 Cyan = Arms</div>
            <div>💛 Yellow = Torso</div>
            <div>🧡 Orange = Legs</div>
          </div>

          <div className="mb-4 p-3 bg-blue-900/50 rounded">
            <div className="font-bold mb-1">🧠 AI Model Info:</div>
            <div className="text-sm">
              Model: MoveNet Lightning (Fast & Accurate)
            </div>
            <div className="text-sm">Keypoints: 17 body landmarks</div>
            <div className="text-sm">Backend: TensorFlow.js WebGL</div>
          </div>

          <button
            onClick={handleDownload}
            disabled={!canvasReady}
            className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
              canvasReady
                ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            📥 Download Hasil (Gambar + Skeleton)
          </button>
        </div>

        {imageSrc && (
          <div className="relative bg-white rounded-lg overflow-hidden">
            <img src={imageSrc} alt="Uploaded" className="w-full h-auto" />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ opacity: 0.95 }}
            />
          </div>
        )}

        <canvas ref={resultCanvasRef} className="hidden" />

        <div className="mt-4 bg-blue-900 text-white p-4 rounded">
          <h2 className="font-bold text-xl mb-3">📋 Cara Pakai:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Tunggu AI model selesai load (5-10 detik pertama kali)</li>
            <li>
              Klik <strong>Choose File</strong> dan pilih foto orang
            </li>
            <li>
              <strong className="text-yellow-300">
                AI akan otomatis mendeteksi pose tubuh
              </strong>
            </li>
            <li>Skeleton akan muncul sesuai pose yang terdeteksi</li>
            <li>
              Klik <strong className="text-green-300">Download Hasil</strong>{" "}
              untuk save
            </li>
          </ol>

          <div className="mt-4 pt-4 border-t border-blue-700">
            <h3 className="font-bold mb-2">💡 Tips untuk Hasil Terbaik:</h3>
            <ul className="text-sm space-y-1">
              <li>✅ Gunakan foto dengan pencahayaan yang baik</li>
              <li>✅ Pose tubuh terlihat jelas (tidak tertutup)</li>
              <li>✅ Background kontras dengan tubuh</li>
              <li>✅ Orang berdiri menghadap kamera</li>
              <li>⚡ Model AI akan detect 17 keypoints otomatis!</li>
            </ul>
          </div>

          <div className="mt-4 pt-4 border-t border-blue-700">
            <h3 className="font-bold mb-2">🔍 Troubleshooting:</h3>
            <ul className="text-sm space-y-1">
              <li>
                ❌ <strong>No pose detected</strong>: Coba foto dengan pose
                lebih jelas
              </li>
              <li>
                ❌ <strong>Loading lama</strong>: Tunggu model AI selesai load
                (pertama kali)
              </li>
              <li>
                ❌ <strong>Error</strong>: Refresh halaman dan coba lagi
              </li>
              <li>
                ✅ <strong>Console log</strong>: Buka F12 untuk debug info
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

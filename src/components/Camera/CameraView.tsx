"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/appStore";
import PermissionPrompt from "./PermissionPrompt";
import ErrorDisplay from "@/components/UI/ErrorDisplay";
import Scene from "@/components/ThreeD/Scene";

interface CameraViewProps {
  showCamera?: boolean;
  showOverlayInfo?: boolean;
}

export default function CameraView({ showCamera = true, showOverlayInfo = true }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { isCameraActive, setCameraActive } = useAppStore();

  // Check if we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug logging - MUST be before any conditional returns
  useEffect(() => {
    console.log("📊 CameraView state:", {
      isCameraActive,
      hasPermission,
      isClient,
      error,
    });
    if (isCameraActive) {
      console.log("✅ Camera is active, Scene should render now");
    }
  }, [isCameraActive, hasPermission, isClient, error]);

  useEffect(() => {
    if (!hasPermission || !isClient) return;

    const startCamera = async () => {
      try {
        // Check if getUserMedia is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError("Browser tidak mendukung akses kamera");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
          console.log("✅ Camera active, isCameraActive will be set to true");
          console.log("📹 Video element ready:", videoRef.current);
        }
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        let errorMessage = "Gagal mengakses kamera";

        if (err.name === "NotAllowedError") {
          errorMessage =
            "Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.";
        } else if (err.name === "NotFoundError") {
          errorMessage = "Kamera tidak ditemukan";
        } else if (err.name === "NotReadableError") {
          errorMessage = "Kamera sedang digunakan aplikasi lain";
        }

        setError(errorMessage);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [hasPermission, isClient, setCameraActive]);

  if (!hasPermission) {
    return <PermissionPrompt onAllow={() => setHasPermission(true)} />;
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => {
          setError(null);
          setHasPermission(false);
        }}
      />
    );
  }

  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain"
        style={{
          transform: 'scaleX(-1)', // Mirror the video (selfie mode)
          opacity: showCamera ? 1 : 0, // Hide camera but keep it running
        }}
      />

      {/* Show camera status overlay */}
      {isCameraActive && showCamera && (
        <div className="absolute top-20 left-4 bg-green-500/80 text-white px-3 py-1 rounded-full text-sm z-10">
          ● Kamera Aktif
        </div>
      )}

      {/* 3D scene with T-shirt overlay */}
      {isCameraActive && (
        <>
          {(() => {
            console.log(
              "🎨 Rendering Scene component with videoElement:",
              videoRef.current
            );
            return null;
          })()}
          <Scene videoElement={videoRef.current} showOverlayInfo={showOverlayInfo} />
        </>
      )}
    </div>
  );
}

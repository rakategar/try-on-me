import { useState, useEffect } from "react";

export function usePoseDetection(videoElement: HTMLVideoElement | null) {
  const [landmarks, setLandmarks] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!videoElement) return;

    // Initialize pose detection here
    setIsReady(true);

    return () => {
      setIsReady(false);
    };
  }, [videoElement]);

  return { landmarks, isReady };
}

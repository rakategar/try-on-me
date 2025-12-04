"use client";

import { Camera } from "lucide-react";
import html2canvas from "html2canvas";

export default function CaptureButton() {
  const handleCapture = async () => {
    try {
      const canvas = await html2canvas(document.body);
      const image = canvas.toDataURL("image/png");

      // Download image
      const link = document.createElement("a");
      link.download = "try-on-me-capture.png";
      link.href = image;
      link.click();
    } catch (error) {
      console.error("Error capturing:", error);
    }
  };

  return (
    <button
      onClick={handleCapture}
      className="rounded-full bg-white p-4 shadow-lg hover:scale-110 active:scale-95 transition-transform"
    >
      <Camera className="h-8 w-8 text-black" />
    </button>
  );
}

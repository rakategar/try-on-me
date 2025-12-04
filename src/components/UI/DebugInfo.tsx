"use client";

import { useEffect, useState } from "react";

export default function DebugInfo() {
  const [info, setInfo] = useState({
    userAgent: "",
    isSecure: false,
    hasMediaDevices: false,
    hasGetUserMedia: false,
    hasWebGL: false,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check WebGL support
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

      setInfo({
        userAgent: navigator.userAgent,
        isSecure: window.location.protocol === "https:",
        hasMediaDevices: !!navigator.mediaDevices,
        hasGetUserMedia: !!(
          navigator.mediaDevices && navigator.mediaDevices.getUserMedia
        ),
        hasWebGL: !!gl,
      });

      // Type guard for WebGL context
      const isWebGLContext = (ctx: any): ctx is WebGLRenderingContext => {
        return ctx && typeof ctx.getParameter === 'function';
      };

      console.log("🔍 Debug Info:", {
        protocol: window.location.protocol,
        hasWebGL: !!gl,
        webGLVersion: isWebGLContext(gl) ? gl.getParameter(gl.VERSION) : "N/A",
      });
    }
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 text-white p-4 text-xs z-50 max-h-64 overflow-auto">
      <div className="space-y-1">
        <div className="font-bold mb-2 text-yellow-400">
          🔍 Debug Information
        </div>
        <div>
          <strong>Protocol:</strong>{" "}
          {info.isSecure
            ? "✅ HTTPS"
            : "❌ HTTP (kamera tidak bisa di HTTP mobile)"}
        </div>
        <div>
          <strong>MediaDevices:</strong>{" "}
          {info.hasMediaDevices ? "✅ Available" : "❌ Not Available"}
        </div>
        <div>
          <strong>getUserMedia:</strong>{" "}
          {info.hasGetUserMedia ? "✅ Supported" : "❌ Not Supported"}
        </div>
        <div>
          <strong>WebGL (for 3D):</strong>{" "}
          {info.hasWebGL
            ? "✅ Supported"
            : "❌ Not Supported (3D tidak akan muncul!)"}
        </div>
        <div className="pt-2 border-t border-gray-700 mt-2">
          <strong>📱 User Agent:</strong> <br />
          <span className="text-gray-400">
            {info.userAgent.substring(0, 150)}...
          </span>
        </div>
        <div className="pt-2 text-yellow-300">
          💡 Tip: Buka Chrome DevTools (chrome://inspect) untuk lihat console
          logs
        </div>
      </div>
    </div>
  );
}

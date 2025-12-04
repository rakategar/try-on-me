export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Try-On-Me",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  debug: process.env.NEXT_PUBLIC_DEBUG_MODE === "true",
};

export const CAMERA_CONFIG = {
  fps: parseInt(process.env.NEXT_PUBLIC_CAMERA_FPS || "30"),
  width: parseInt(process.env.NEXT_PUBLIC_CAMERA_WIDTH || "1280"),
  height: parseInt(process.env.NEXT_PUBLIC_CAMERA_HEIGHT || "720"),
  facingMode: "user" as "user" | "environment",
};

export const POSE_CONFIG = {
  model: process.env.NEXT_PUBLIC_POSE_MODEL || "mediapipe",
  detectionConfidence: parseFloat(
    process.env.NEXT_PUBLIC_DETECTION_CONFIDENCE || "0.7"
  ),
  trackingConfidence: 0.5,
  modelComplexity: 1,
};

export const TSHIRT_CONFIG = {
  defaultColor: "#ffffff",
  defaultSize: "M",
  sizes: ["S", "M", "L", "XL"],
};

export const FEATURE_FLAGS = {
  analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  debug: process.env.NEXT_PUBLIC_DEBUG_MODE === "true",
};

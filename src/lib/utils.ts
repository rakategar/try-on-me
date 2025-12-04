export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export const degToRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const radToDeg = (radians: number): number => {
  return radians * (180 / Math.PI);
};

export const distance2D = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

export const distance3D = (
  x1: number,
  y1: number,
  z1: number,
  x2: number,
  y2: number,
  z2: number
): number => {
  return Math.sqrt(
    Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2)
  );
};

export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const requestFullscreen = async (
  element: HTMLElement
): Promise<void> => {
  if (element.requestFullscreen) {
    await element.requestFullscreen();
  }
};

export const exitFullscreen = async (): Promise<void> => {
  if (document.exitFullscreen) {
    await document.exitFullscreen();
  }
};

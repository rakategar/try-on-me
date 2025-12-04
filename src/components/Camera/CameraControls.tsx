"use client";

export default function CameraControls() {
  return (
    <div className="flex gap-2">
      <button className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
        <span className="sr-only">Flip Camera</span>
      </button>
    </div>
  );
}

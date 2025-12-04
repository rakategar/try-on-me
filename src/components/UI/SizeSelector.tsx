"use client";

export default function SizeSelector() {
  const sizes = ["S", "M", "L", "XL"];

  return (
    <div className="flex gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
        >
          {size}
        </button>
      ))}
    </div>
  );
}

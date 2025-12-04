"use client";

import { useDesignStore } from "@/store/designStore";

const designs = [
  { id: 1, name: "Design 1", color: "#FF6B6B", thumbnail: "/designs/1.jpg" },
  { id: 2, name: "Design 2", color: "#4ECDC4", thumbnail: "/designs/2.jpg" },
  { id: 3, name: "Design 3", color: "#45B7D1", thumbnail: "/designs/3.jpg" },
  { id: 4, name: "Design 4", color: "#FFA07A", thumbnail: "/designs/4.jpg" },
];

export default function DesignSelector() {
  const { selectedDesign, setSelectedDesign } = useDesignStore();

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2 no-scrollbar">
      {designs.map((design) => (
        <button
          key={design.id}
          onClick={() => setSelectedDesign(design)}
          className={`flex-shrink-0 rounded-lg overflow-hidden transition-all ${
            selectedDesign?.id === design.id
              ? "ring-4 ring-white scale-110"
              : "ring-2 ring-white/30"
          }`}
        >
          <div
            className="h-16 w-16"
            style={{ backgroundColor: design.color }}
          />
        </button>
      ))}
    </div>
  );
}

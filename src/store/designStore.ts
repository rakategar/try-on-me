import { create } from "zustand";

interface Design {
  id: number;
  name: string;
  color: string;
  thumbnail: string;
}

interface DesignState {
  selectedDesign: Design | null;
  designs: Design[];
  setSelectedDesign: (design: Design) => void;
}

export const useDesignStore = create<DesignState>((set) => ({
  selectedDesign: null,
  designs: [],
  setSelectedDesign: (design) => set({ selectedDesign: design }),
}));

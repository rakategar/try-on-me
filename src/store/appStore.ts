import { create } from "zustand";

interface AppState {
  isCameraActive: boolean;
  isLoading: boolean;
  error: string | null;
  setCameraActive: (active: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isCameraActive: false,
  isLoading: true,
  error: null,
  setCameraActive: (active) => set({ isCameraActive: active }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));

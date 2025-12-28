import { create } from "zustand";

type SelectionStore = {
  selectedObjects: string[];
  selectedSpawns: string[];
  setSelectedObjects: (ids: string[]) => void;
  setSelectedSpawns: (ids: string[]) => void;
  clearSelection: () => void;
};

export const useSelectionStore = create<SelectionStore>((set) => ({
  selectedObjects: [],
  selectedSpawns: [],
  setSelectedObjects: (ids) => set({ selectedObjects: ids }),
  setSelectedSpawns: (ids) => set({ selectedSpawns: ids }),
  clearSelection: () => set({ selectedObjects: [], selectedSpawns: [] }),
}));

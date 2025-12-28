import { create } from "zustand";
import type { Brush, EditorTool, ObjectTransformMode, ViewportState } from "../types/editor";

const defaultBrush: Brush = {
  size: 24,
  strength: 0.45,
  falloff: "smooth",
  shape: "circle",
};

const defaultViewport: ViewportState = {
  zoom: 1,
  position: { x: 0, y: 0, z: 0 },
};

type EditorStore = {
  tool: EditorTool;
  brush: Brush;
  viewport: ViewportState;
  layers: {
    terrain: boolean;
    objects: boolean;
    spawns: boolean;
    attrs: boolean;
  };
  objects: {
    assets: {
      id: string;
      label: string;
      crc32: number;
      gr2Path?: string;
    }[];
    selectedAssetId: string | null;
    selectedObject: { id: string; chunkId: string } | null;
    transformMode: ObjectTransformMode;
    placement: {
      yaw: number;
      pitch: number;
      roll: number;
      heightBias: number;
      randomYaw: boolean;
    };
  };
  terrain: {
    exaggeration: number;
    wireframe: boolean;
    points: boolean;
    mode: "raise" | "lower" | "smooth";
    intensity: number;
  };
  water: {
    enabled: boolean;
    level: number;
    opacity: number;
  };
  attributes: {
    mode: "paint" | "erase";
    flag: number;
    colors: {
      blocked: string;
      water: string;
      bannable: string;
    };
    opacity: number;
  };
  brushPreview: {
    visible: boolean;
    position: { x: number; y: number; z: number };
  };
  setTool: (tool: EditorTool) => void;
  setBrush: (brush: Partial<Brush>) => void;
  setViewport: (viewport: Partial<ViewportState>) => void;
  setLayerVisibility: (layer: keyof EditorStore["layers"], visible: boolean) => void;
  setTerrain: (partial: Partial<EditorStore["terrain"]>) => void;
  setWater: (partial: Partial<EditorStore["water"]>) => void;
  setAttributes: (partial: Partial<EditorStore["attributes"]>) => void;
  addObjectAsset: (asset: EditorStore["objects"]["assets"][number]) => void;
  upsertObjectAssets: (assets: EditorStore["objects"]["assets"]) => void;
  setSelectedObjectAsset: (id: string | null) => void;
  setSelectedObject: (selection: EditorStore["objects"]["selectedObject"]) => void;
  setObjectPlacement: (partial: Partial<EditorStore["objects"]["placement"]>) => void;
  setObjectTransformMode: (mode: ObjectTransformMode) => void;
  setBrushPreview: (visible: boolean, position?: { x: number; y: number; z: number }) => void;
};

export const useEditorStore = create<EditorStore>((set) => ({
  tool: "select",
  brush: defaultBrush,
  viewport: defaultViewport,
  layers: { terrain: true, objects: true, spawns: true, attrs: false },
  objects: {
    assets: [],
    selectedAssetId: null,
    selectedObject: null,
    transformMode: "translate",
    placement: {
      yaw: 0,
      pitch: 0,
      roll: 0,
      heightBias: -95,
      randomYaw: false,
    },
  },
  terrain: { exaggeration: 3, wireframe: false, points: false, mode: "raise", intensity: 120 },
  water: { enabled: true, level: 6, opacity: 0.65 },
  attributes: {
    mode: "paint",
    flag: 0x01,
    colors: {
      blocked: "#ff5a5a",
      water: "#588eff",
      bannable: "#f5c84c",
    },
    opacity: 0.4,
  },
  brushPreview: { visible: false, position: { x: 0, y: 0, z: 0 } },
  setTool: (tool) => set({ tool }),
  setBrush: (brush) =>
    set((state) => ({ brush: { ...state.brush, ...brush } })),
  setViewport: (viewport) =>
    set((state) => ({ viewport: { ...state.viewport, ...viewport } })),
  setLayerVisibility: (layer, visible) =>
    set((state) => ({ layers: { ...state.layers, [layer]: visible } })),
  setTerrain: (partial) =>
    set((state) => ({ terrain: { ...state.terrain, ...partial } })),
  setWater: (partial) =>
    set((state) => ({ water: { ...state.water, ...partial } })),
  setAttributes: (partial) =>
    set((state) => ({ attributes: { ...state.attributes, ...partial } })),
  addObjectAsset: (asset) =>
    set((state) => {
      const next = state.objects.assets.slice();
      const index = next.findIndex((item) => item.id === asset.id);
      if (index >= 0) {
        const current = next[index];
        next[index] = {
          ...current,
          label: current.label.startsWith("CRC ") ? asset.label : current.label,
          gr2Path: current.gr2Path ?? asset.gr2Path,
        };
      } else {
        next.push(asset);
      }
      return { objects: { ...state.objects, assets: next } };
    }),
  upsertObjectAssets: (assets) =>
    set((state) => {
      if (assets.length === 0) return state;
      const next = state.objects.assets.slice();
      const indexById = new Map(next.map((item, index) => [item.id, index]));
      for (const asset of assets) {
        const existingIndex = indexById.get(asset.id);
        if (existingIndex === undefined) {
          indexById.set(asset.id, next.length);
          next.push(asset);
          continue;
        }
        const current = next[existingIndex];
        next[existingIndex] = {
          ...current,
          label: current.label.startsWith("CRC ") ? asset.label : current.label,
          gr2Path: current.gr2Path ?? asset.gr2Path,
        };
      }
      return { objects: { ...state.objects, assets: next } };
    }),
  setSelectedObjectAsset: (id) =>
    set((state) => ({ objects: { ...state.objects, selectedAssetId: id } })),
  setSelectedObject: (selection) =>
    set((state) => ({ objects: { ...state.objects, selectedObject: selection } })),
  setObjectPlacement: (partial) =>
    set((state) => ({
      objects: {
        ...state.objects,
        placement: { ...state.objects.placement, ...partial },
      },
    })),
  setObjectTransformMode: (mode) =>
    set((state) => ({ objects: { ...state.objects, transformMode: mode } })),
  setBrushPreview: (visible, position) =>
    set((state) => ({
      brushPreview: {
        visible,
        position: position ?? state.brushPreview.position,
      },
    })),
}));

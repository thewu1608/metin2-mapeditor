import { create } from "zustand";
import type { ChunkData, MapProject, MapSettings } from "../types/project";
import type { AreaObject, AttributeData, HeightmapData } from "../types/metin2";

const defaultSettings: MapSettings = {
  cellScale: 200,
  heightScale: 50,
  viewRadius: 60000,
  mapSize: { width: 1, height: 1 },
  basePosition: { x: 409600, y: 921600 },
  textureSet: "textureset/metin2_a1.txt",
  environment: "environment/metin2_map_a1.msenv",
};

const createDefaultProject = (): MapProject => ({
  name: "Untitled",
  version: "0.1.0",
  settings: defaultSettings,
  chunks: {},
  spawns: { monsters: [], npcs: [], bosses: [], stones: [] },
  metadata: {
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    author: "local",
  },
});

type ProjectStore = {
  project: MapProject;
  history: {
    undo: HeightmapData[];
    redo: HeightmapData[];
  };
  setProject: (project: MapProject) => void;
  updateSettings: (partial: Partial<MapSettings>) => void;
  updateChunk: (id: string, partial: Partial<ChunkData>) => void;
  setChunkHeightmap: (id: string, heightmap: HeightmapData) => void;
  setChunkAttributes: (id: string, attributes: AttributeData) => void;
  setChunkObjects: (id: string, objects: AreaObject[]) => void;
  addChunkObject: (id: string, object: AreaObject) => void;
  removeChunkObject: (id: string, objectId: string) => void;
  updateChunkObject: (id: string, objectId: string, partial: Partial<AreaObject>) => void;
  moveChunkObject: (fromId: string, toId: string, objectId: string, object: AreaObject) => void;
  undoHeightmap: (id: string) => void;
  redoHeightmap: (id: string) => void;
  touch: () => void;
};

export const useProjectStore = create<ProjectStore>((set) => ({
  project: createDefaultProject(),
  history: { undo: [], redo: [] },
  setProject: (project) => set({ project }),
  updateSettings: (partial) =>
    set((state) => ({
      project: {
        ...state.project,
        settings: { ...state.project.settings, ...partial },
        metadata: {
          ...state.project.metadata,
          modified: new Date().toISOString(),
        },
      },
    })),
  updateChunk: (id, partial) =>
    set((state) => ({
      project: {
        ...state.project,
        chunks: {
          ...state.project.chunks,
          [id]: { id, ...state.project.chunks[id], ...partial },
        },
        metadata: {
          ...state.project.metadata,
          modified: new Date().toISOString(),
        },
      },
    })),
  setChunkHeightmap: (id, heightmap) =>
    set((state) => {
      const current = state.project.chunks[id]?.heightmap;
      const nextUndo = current
        ? [{ size: current.size, data: current.data.map((row) => row.slice()) }, ...state.history.undo]
        : state.history.undo;
      return {
        project: {
          ...state.project,
          chunks: {
            ...state.project.chunks,
            [id]: { id, ...state.project.chunks[id], heightmap },
          },
          metadata: {
            ...state.project.metadata,
            modified: new Date().toISOString(),
          },
        },
        history: { undo: nextUndo.slice(0, 50), redo: [] },
      };
    }),
  setChunkAttributes: (id, attributes) =>
    set((state) => ({
      project: {
        ...state.project,
        chunks: {
          ...state.project.chunks,
          [id]: { id, ...state.project.chunks[id], attributes },
        },
        metadata: {
          ...state.project.metadata,
          modified: new Date().toISOString(),
        },
      },
    })),
  setChunkObjects: (id, objects) =>
    set((state) => ({
      project: {
        ...state.project,
        chunks: {
          ...state.project.chunks,
          [id]: { id, ...state.project.chunks[id], objects },
        },
        metadata: {
          ...state.project.metadata,
          modified: new Date().toISOString(),
        },
      },
    })),
  addChunkObject: (id, object) =>
    set((state) => {
      const current = state.project.chunks[id]?.objects ?? [];
      return {
        project: {
          ...state.project,
          chunks: {
            ...state.project.chunks,
            [id]: { id, ...state.project.chunks[id], objects: [...current, object] },
          },
          metadata: {
            ...state.project.metadata,
            modified: new Date().toISOString(),
          },
        },
      };
    }),
  removeChunkObject: (id, objectId) =>
    set((state) => {
      const current = state.project.chunks[id]?.objects ?? [];
      return {
        project: {
          ...state.project,
          chunks: {
            ...state.project.chunks,
            [id]: {
              id,
              ...state.project.chunks[id],
              objects: current.filter((obj) => obj.id !== objectId),
            },
          },
          metadata: {
            ...state.project.metadata,
            modified: new Date().toISOString(),
          },
        },
      };
    }),
  updateChunkObject: (id, objectId, partial) =>
    set((state) => {
      const current = state.project.chunks[id]?.objects ?? [];
      const index = current.findIndex((obj) => obj.id === objectId);
      if (index < 0) return state;
      const next = current.slice();
      next[index] = { ...next[index], ...partial };
      return {
        project: {
          ...state.project,
          chunks: {
            ...state.project.chunks,
            [id]: { id, ...state.project.chunks[id], objects: next },
          },
          metadata: {
            ...state.project.metadata,
            modified: new Date().toISOString(),
          },
        },
      };
    }),
  moveChunkObject: (fromId, toId, objectId, object) =>
    set((state) => {
      const source = state.project.chunks[fromId]?.objects ?? [];
      const index = source.findIndex((obj) => obj.id === objectId);
      if (index < 0) return state;
      const remaining = source.filter((obj) => obj.id !== objectId);
      const target = state.project.chunks[toId]?.objects ?? [];
      return {
        project: {
          ...state.project,
          chunks: {
            ...state.project.chunks,
            [fromId]: { id: fromId, ...state.project.chunks[fromId], objects: remaining },
            [toId]: { id: toId, ...state.project.chunks[toId], objects: [...target, object] },
          },
          metadata: {
            ...state.project.metadata,
            modified: new Date().toISOString(),
          },
        },
      };
    }),
  undoHeightmap: (id) =>
    set((state) => {
      const previous = state.history.undo[0];
      const current = state.project.chunks[id]?.heightmap;
      if (!previous || !current) return state;
      const redo = [
        { size: current.size, data: current.data.map((row) => row.slice()) },
        ...state.history.redo,
      ];
      return {
        project: {
          ...state.project,
          chunks: {
            ...state.project.chunks,
            [id]: { id, ...state.project.chunks[id], heightmap: previous },
          },
          metadata: {
            ...state.project.metadata,
            modified: new Date().toISOString(),
          },
        },
        history: { undo: state.history.undo.slice(1), redo: redo.slice(0, 50) },
      };
    }),
  redoHeightmap: (id) =>
    set((state) => {
      const next = state.history.redo[0];
      const current = state.project.chunks[id]?.heightmap;
      if (!next || !current) return state;
      const undo = [
        { size: current.size, data: current.data.map((row) => row.slice()) },
        ...state.history.undo,
      ];
      return {
        project: {
          ...state.project,
          chunks: {
            ...state.project.chunks,
            [id]: { id, ...state.project.chunks[id], heightmap: next },
          },
          metadata: {
            ...state.project.metadata,
            modified: new Date().toISOString(),
          },
        },
        history: { undo: undo.slice(0, 50), redo: state.history.redo.slice(1) },
      };
    }),
  touch: () =>
    set((state) => ({
      project: {
        ...state.project,
        metadata: {
          ...state.project.metadata,
          modified: new Date().toISOString(),
        },
      },
    })),
}));

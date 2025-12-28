import type { AreaObject, AttributeData, HeightmapData, SpawnEntry } from "./metin2";

export type MapSettings = {
  cellScale: number;
  heightScale: number;
  viewRadius: number;
  mapSize: { width: number; height: number };
  basePosition: { x: number; y: number };
  textureSet: string;
  environment: string;
};

export type ChunkData = {
  id: string;
  heightmap?: HeightmapData;
  attributes?: AttributeData;
  objects?: AreaObject[];
};

export type MapProject = {
  name: string;
  version: string;
  settings: MapSettings;
  chunks: Record<string, ChunkData>;
  spawns: {
    monsters: SpawnEntry[];
    npcs: SpawnEntry[];
    bosses: SpawnEntry[];
    stones: SpawnEntry[];
  };
  metadata: {
    created: string;
    modified: string;
    author: string;
  };
};

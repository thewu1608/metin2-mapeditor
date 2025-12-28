import type { HeightmapData } from "../../types/metin2";
import type { MapProject } from "../../types/project";

export const GAME_UNIT_SCALE = 100;

export const toGameUnits = (value: number) => value * GAME_UNIT_SCALE;
export const toEditorUnits = (value: number) => value / GAME_UNIT_SCALE;

export const getBaseHeightmapSize = (project: MapProject, fallback = 131) => {
  const chunks = Object.values(project.chunks);
  for (const chunk of chunks) {
    if (chunk.heightmap) {
      return chunk.heightmap.size;
    }
  }
  return fallback;
};

export const getChunkWorldSize = (heightmapSize: number, cellScale: number) => {
  return (heightmapSize - 1) * (cellScale / 100);
};

export const getMapWorldSize = (
  project: MapProject,
  heightmapSize: number,
) => {
  const chunkWorldSize = getChunkWorldSize(heightmapSize, project.settings.cellScale);
  return {
    chunkWorldSize,
    width: project.settings.mapSize.width * chunkWorldSize,
    height: project.settings.mapSize.height * chunkWorldSize,
  };
};

export const getChunkKey = (project: MapProject, x: number, y: number) => {
  const keys = Object.keys(project.chunks);
  const width = keys.some((key) => key.length === 6) ? 3 : 2;
  return `${String(x).padStart(width, "0")}${String(y).padStart(width, "0")}`;
};

export const sampleHeightmap = (heightmap: HeightmapData, x: number, y: number) => {
  const size = heightmap.size;
  const clamp = (value: number) => Math.max(0, Math.min(size - 1, value));
  const x0 = Math.floor(clamp(x));
  const y0 = Math.floor(clamp(y));
  const x1 = Math.min(size - 1, x0 + 1);
  const y1 = Math.min(size - 1, y0 + 1);
  const tx = clamp(x) - x0;
  const ty = clamp(y) - y0;
  const h00 = heightmap.data[y0]?.[x0] ?? 0;
  const h10 = heightmap.data[y0]?.[x1] ?? 0;
  const h01 = heightmap.data[y1]?.[x0] ?? 0;
  const h11 = heightmap.data[y1]?.[x1] ?? 0;
  const hx0 = h00 + (h10 - h00) * tx;
  const hx1 = h01 + (h11 - h01) * tx;
  return hx0 + (hx1 - hx0) * ty;
};

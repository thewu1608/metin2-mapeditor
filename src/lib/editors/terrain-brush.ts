import type { Brush } from "../../types/editor";
import type { HeightmapData } from "../../types/metin2";

type BrushMode = "raise" | "lower" | "smooth";

const falloffValue = (distance: number, radius: number, falloff: Brush["falloff"]) => {
  if (radius <= 0) return 1;
  const t = Math.min(1, distance / radius);
  switch (falloff) {
    case "constant":
      return 1;
    case "linear":
      return 1 - t;
    case "smooth":
    default:
      return 1 - t * t * (3 - 2 * t);
  }
};

const cloneHeightmap = (heightmap: HeightmapData) => {
  return {
    size: heightmap.size,
    data: heightmap.data.map((row) => row.slice()),
  };
};

export const applyTerrainBrush = (
  heightmap: HeightmapData,
  x: number,
  y: number,
  brush: Brush,
  mode: BrushMode,
  intensity: number,
  gridScale: number,
) => {
  const next = cloneHeightmap(heightmap);
  const size = next.size;
  const radius = Math.max(1, Math.floor((brush.size / gridScale) / 2));
  const minX = Math.max(0, x - radius);
  const maxX = Math.min(size - 1, x + radius);
  const minY = Math.max(0, y - radius);
  const maxY = Math.min(size - 1, y + radius);

  for (let iy = minY; iy <= maxY; iy += 1) {
    for (let ix = minX; ix <= maxX; ix += 1) {
      const dx = ix - x;
      const dy = iy - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > radius) continue;
      const falloff = falloffValue(distance, radius, brush.falloff);
      const strength = falloff * brush.strength;
      const current = next.data[iy][ix];

      if (mode === "smooth") {
        let sum = 0;
        let count = 0;
        for (let sy = -1; sy <= 1; sy += 1) {
          for (let sx = -1; sx <= 1; sx += 1) {
            const tx = ix + sx;
            const ty = iy + sy;
            if (tx < 0 || ty < 0 || tx >= size || ty >= size) continue;
            sum += next.data[ty][tx];
            count += 1;
          }
        }
        const avg = count ? sum / count : current;
        next.data[iy][ix] = current + (avg - current) * strength;
      } else {
        const dir = mode === "raise" ? 1 : -1;
        next.data[iy][ix] = current + dir * intensity * strength;
      }
    }
  }

  return next;
};

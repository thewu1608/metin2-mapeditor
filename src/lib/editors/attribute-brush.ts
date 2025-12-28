import type { Brush } from "../../types/editor";
import type { AttributeData } from "../../types/metin2";

type AttributeMode = "paint" | "erase";

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

const cloneAttributes = (attributes: AttributeData): AttributeData => ({
  width: attributes.width,
  height: attributes.height,
  data: attributes.data.map((row) => row.slice()),
});

export const createEmptyAttributes = (width = 256, height = 256): AttributeData => {
  const data = Array.from({ length: height }, () => Array.from({ length: width }, () => 0));
  return { width, height, data };
};

export const applyAttributeBrush = (
  attributes: AttributeData,
  x: number,
  y: number,
  brush: Brush,
  mode: AttributeMode,
  flag: number,
  radiusCells: number,
) => {
  const next = cloneAttributes(attributes);
  const width = next.width;
  const height = next.height;
  const radius = Math.max(1, Math.floor(radiusCells));
  const minX = Math.max(0, x - radius);
  const maxX = Math.min(width - 1, x + radius);
  const minY = Math.max(0, y - radius);
  const maxY = Math.min(height - 1, y + radius);

  for (let iy = minY; iy <= maxY; iy += 1) {
    for (let ix = minX; ix <= maxX; ix += 1) {
      const dx = ix - x;
      const dy = iy - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > radius) continue;
      const falloff = falloffValue(distance, radius, brush.falloff);
      if (falloff <= 0) continue;
      const current = next.data[iy][ix];
      if (mode === "paint") {
        next.data[iy][ix] = current | flag;
      } else {
        next.data[iy][ix] = current & ~flag;
      }
    }
  }

  return next;
};

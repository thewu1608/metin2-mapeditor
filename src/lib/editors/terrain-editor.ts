import type { Brush } from "../../types/editor";

export const applyRaise = (
  heightmap: number[][],
  position: { x: number; y: number },
  brush: Brush,
  amount: number,
) => {
  const size = heightmap.length;
  const radius = Math.max(1, Math.floor(brush.size / 2));
  for (let y = -radius; y <= radius; y += 1) {
    for (let x = -radius; x <= radius; x += 1) {
      const tx = position.x + x;
      const ty = position.y + y;
      if (tx < 0 || ty < 0 || tx >= size || ty >= size) continue;
      heightmap[ty][tx] += amount * brush.strength;
    }
  }
};

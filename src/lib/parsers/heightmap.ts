import type { HeightmapData } from "../../types/metin2";

export const parseHeightmap = (buffer: ArrayBuffer): HeightmapData => {
  const view = new DataView(buffer);
  const length = view.byteLength / 2;
  const size = Math.sqrt(length);
  if (!Number.isInteger(size)) {
    throw new Error(`Invalid heightmap size: ${length}`);
  }
  const rows: number[][] = [];
  let offset = 0;
  for (let y = 0; y < size; y += 1) {
    const row: number[] = [];
    for (let x = 0; x < size; x += 1) {
      row.push(view.getInt16(offset, true));
      offset += 2;
    }
    rows.push(row);
  }
  return { size, data: rows };
};

export const serializeHeightmap = (heightmap: HeightmapData): ArrayBuffer => {
  const { size, data } = heightmap;
  const buffer = new ArrayBuffer(size * size * 2);
  const view = new Int16Array(buffer);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      view[y * size + x] = data[y]?.[x] ?? 0;
    }
  }
  return buffer;
};

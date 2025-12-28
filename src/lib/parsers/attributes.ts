import type { AttributeData } from "../../types/metin2";

const ATTR_MAGIC = 0x0a4a;

export const parseAttributes = (buffer: ArrayBuffer): AttributeData => {
  const view = new DataView(buffer);
  const magic = view.getUint16(0, true);
  if (magic !== ATTR_MAGIC) {
    throw new Error("Invalid attr.atr magic");
  }
  const width = view.getUint16(2, true);
  const height = view.getUint16(4, true);
  const data: number[][] = [];
  const baseOffset = 6;
  for (let y = 0; y < height; y += 1) {
    const row: number[] = [];
    for (let x = 0; x < width; x += 1) {
      row.push(view.getUint8(baseOffset + y * width + x));
    }
    data.push(row);
  }
  return { width, height, data };
};

export const serializeAttributes = (attributes: AttributeData): ArrayBuffer => {
  const { width, height, data } = attributes;
  const buffer = new ArrayBuffer(6 + width * height);
  const view = new DataView(buffer);
  view.setUint16(0, ATTR_MAGIC, true);
  view.setUint16(2, width, true);
  view.setUint16(4, height, true);
  const baseOffset = 6;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      view.setUint8(baseOffset + y * width + x, data[y]?.[x] ?? 0);
    }
  }
  return buffer;
};

export const setFlag = (
  attributes: AttributeData,
  x: number,
  y: number,
  flag: number,
) => {
  const current = attributes.data[y]?.[x] ?? 0;
  if (attributes.data[y]) {
    attributes.data[y][x] = current | flag;
  }
};

export const clearFlag = (
  attributes: AttributeData,
  x: number,
  y: number,
  flag: number,
) => {
  const current = attributes.data[y]?.[x] ?? 0;
  if (attributes.data[y]) {
    attributes.data[y][x] = current & ~flag;
  }
};

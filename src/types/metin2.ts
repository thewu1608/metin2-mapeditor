export type HeightmapData = {
  size: number;
  data: number[][];
};

export type AttributeData = {
  width: number;
  height: number;
  data: number[][];
};

export enum AttributeFlags {
  BLOCKED = 0x01,
  WATER = 0x02,
  BANNABLE = 0x04,
}

export type SpawnEntry = {
  id: string;
  type: "m" | "g" | "n" | "s";
  vnum: string;
  position: { x: number; y: number; z: number };
  spawnArea: { x: number; y: number };
  direction: number;
  respawnTime: string;
  probability: number;
  count: number;
  displayName?: string;
  iconPath?: string;
};

export type AreaObject = {
  id: string;
  crc32: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  heightBias: number;
  scale?: { x: number; y: number; z: number };
  label?: string;
  gr2Path?: string;
};

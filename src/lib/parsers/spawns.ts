import type { SpawnEntry } from "../../types/metin2";

const makeId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `spawn_${Math.random().toString(36).slice(2, 10)}`;
};

export const parseRegen = (content: string): SpawnEntry[] => {
  const lines = content.split(/\r?\n/);
  return lines
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//"))
    .map((line) => {
      const [
        type,
        cx,
        cy,
        sx,
        sy,
        z,
        dir,
        time,
        percent,
        count,
        vnum,
      ] = line.split("\t");
      return {
        id: makeId(),
        type: (type as SpawnEntry["type"]) ?? "m",
        vnum: vnum ?? "",
        position: { x: Number(cx), y: Number(cy), z: Number(z) },
        spawnArea: { x: Number(sx), y: Number(sy) },
        direction: Number(dir),
        respawnTime: time ?? "",
        probability: Number(percent),
        count: Number(count),
      };
    });
};

export const serializeRegen = (entries: SpawnEntry[]): string => {
  return entries
    .map(
      (entry) =>
        [
          entry.type,
          entry.position.x,
          entry.position.y,
          entry.spawnArea.x,
          entry.spawnArea.y,
          entry.position.z,
          entry.direction,
          entry.respawnTime,
          entry.probability,
          entry.count,
          entry.vnum,
        ].join("\t"),
    )
    .join("\n");
};

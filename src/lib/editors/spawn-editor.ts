import type { SpawnEntry } from "../../types/metin2";

export const addSpawn = (spawns: SpawnEntry[], spawn: Omit<SpawnEntry, "id">) => {
  const id = `spawn_${Math.random().toString(36).slice(2, 10)}`;
  spawns.push({ id, ...spawn });
  return id;
};

export const updateSpawn = (
  spawns: SpawnEntry[],
  id: string,
  data: Partial<SpawnEntry>,
) => {
  const entry = spawns.find((spawn) => spawn.id === id);
  if (!entry) return;
  Object.assign(entry, data);
};

export const removeSpawn = (spawns: SpawnEntry[], id: string) => {
  const index = spawns.findIndex((spawn) => spawn.id === id);
  if (index >= 0) {
    spawns.splice(index, 1);
  }
};

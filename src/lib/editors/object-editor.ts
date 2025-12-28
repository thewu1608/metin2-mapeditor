import type { AreaObject } from "../../types/metin2";

export const placeObject = (
  objects: AreaObject[],
  next: Omit<AreaObject, "id">,
) => {
  const id = `obj_${Math.random().toString(36).slice(2, 10)}`;
  objects.push({ id, ...next });
  return id;
};

export const removeObject = (objects: AreaObject[], id: string) => {
  const index = objects.findIndex((obj) => obj.id === id);
  if (index >= 0) {
    objects.splice(index, 1);
  }
};

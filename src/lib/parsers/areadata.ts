import type { AreaObject } from "../../types/metin2";

const parseRotation = (value: string) => {
  if (value.includes("#")) {
    const parts = value.split("#").map((part) => Number(part));
    return {
      x: parts[0] ?? 0,
      y: parts[1] ?? 0,
      z: parts[2] ?? 0,
    };
  }
  return { x: 0, y: 0, z: Number(value) };
};

const formatFloat = (value: number) => {
  if (!Number.isFinite(value)) return "0.000000";
  return value.toFixed(6);
};

export const parseAreaData = (content: string): AreaObject[] => {
  const lines = content.split(/\r?\n/);
  const objects: AreaObject[] = [];
  let inObject = false;
  let currentLines: string[] = [];
  let index = 0;

  const flushObject = () => {
    if (!currentLines.length) return;
    const tokens: string[] = [];
    for (const raw of currentLines) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      tokens.push(...trimmed.split(/\s+/));
    }
    if (tokens.length < 4) return;
    const position = {
      x: Number(tokens[0]),
      y: Number(tokens[1]),
      z: Number(tokens[2]),
    };
    const crc32 = Number(tokens[3]);
    const rotationToken = tokens[4] ?? "0";
    const heightBias = tokens[5] ? Number(tokens[5]) : 0;
    objects.push({
      id: `obj_${index.toString(36)}`,
      crc32,
      position,
      rotation: parseRotation(rotationToken),
      heightBias,
    });
    index += 1;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.toLowerCase().startsWith("start object")) {
      inObject = true;
      currentLines = [];
      continue;
    }
    if (trimmed.toLowerCase().startsWith("end object")) {
      inObject = false;
      flushObject();
      currentLines = [];
      continue;
    }
    if (inObject) {
      currentLines.push(line);
    }
  }

  return objects;
};

export const serializeAreaData = (objects: AreaObject[]) => {
  const lines: string[] = ["AreaDataFile", ""];
  objects.forEach((obj, i) => {
    lines.push(`Start Object${String(i).padStart(3, "0")}`);
    lines.push(`    ${formatFloat(obj.position.x)} ${formatFloat(obj.position.y)} ${formatFloat(obj.position.z)}`);
    lines.push(`    ${obj.crc32}`);
    lines.push(`    ${formatFloat(obj.rotation.x)}#${formatFloat(obj.rotation.y)}#${formatFloat(obj.rotation.z)}`);
    lines.push(`    ${formatFloat(obj.heightBias ?? 0)}`);
    lines.push("End Object");
  });
  lines.push("");
  lines.push(`ObjectCount ${objects.length}`);
  return lines.join("\n");
};

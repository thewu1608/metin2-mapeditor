import type { MapSettings } from "../../types/project";

const defaultSettings: MapSettings = {
  cellScale: 200,
  heightScale: 50,
  viewRadius: 60000,
  mapSize: { width: 1, height: 1 },
  basePosition: { x: 0, y: 0 },
  textureSet: "",
  environment: "",
};

export const parseSettings = (content: string): MapSettings => {
  const settings = { ...defaultSettings };
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//")) continue;
    let parts = trimmed.split(/[,\t]+/).map((part) => part.trim()).filter(Boolean);
    if (parts.length === 1) {
      parts = trimmed.split(/\s+/).map((part) => part.trim()).filter(Boolean);
    }
    const [key, ...rest] = parts;
    const value = rest.join(",").trim();
    switch (key) {
      case "CellScale":
        settings.cellScale = Number(value);
        break;
      case "HeightScale":
        settings.heightScale = Number(value);
        break;
      case "ViewRadius":
        settings.viewRadius = Number(value);
        break;
      case "MapSize": {
        const [w, h] = rest.map((v) => Number(v));
        if (Number.isFinite(w) && Number.isFinite(h)) {
          settings.mapSize = { width: w, height: h };
        }
        break;
      }
      case "BasePosition": {
        const [x, y] = rest.map((v) => Number(v));
        if (Number.isFinite(x) && Number.isFinite(y)) {
          settings.basePosition = { x, y };
        }
        break;
      }
      case "TextureSet":
        settings.textureSet = value;
        break;
      case "Environment":
        settings.environment = value;
        break;
      default:
        break;
    }
  }
  return settings;
};

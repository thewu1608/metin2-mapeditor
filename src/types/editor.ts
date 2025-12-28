export type Brush = {
  size: number;
  strength: number;
  falloff: "linear" | "smooth" | "constant";
  shape: "circle" | "square";
};

export type EditorTool = "select" | "terrain" | "objects" | "spawns" | "attributes";

export type ObjectTransformMode = "translate" | "rotate" | "scale";

export type ViewportState = {
  zoom: number;
  position: { x: number; y: number; z: number };
};

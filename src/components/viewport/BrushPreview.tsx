import { useMemo } from "react";
import * as THREE from "three";
import { useEditorStore } from "../../store/editor-store";
import { useProjectStore } from "../../store/project-store";

const BrushPreview = () => {
  const brushPreview = useEditorStore((state) => state.brushPreview);
  const brush = useEditorStore((state) => state.brush);
  const tool = useEditorStore((state) => state.tool);
  const cellScale = useProjectStore((state) => state.project.settings.cellScale);

  const radius = useMemo(() => {
    const gridScale = cellScale / 100;
    return Math.max(0.5, (brush.size / gridScale) / 2);
  }, [brush.size, cellScale]);

  if ((tool !== "terrain" && tool !== "attributes") || !brushPreview.visible) return null;

  return (
    <mesh
      position={[brushPreview.position.x, brushPreview.position.y + 0.2, brushPreview.position.z]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[radius * 0.85, radius, 64]} />
      <meshBasicMaterial color="#f5c84c" transparent opacity={0.8} />
    </mesh>
  );
};

export default BrushPreview;

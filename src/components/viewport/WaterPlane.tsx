import { useMemo } from "react";
import * as THREE from "three";
import { getBaseHeightmapSize, getMapWorldSize } from "../../lib/utils/map-math";
import { useEditorStore } from "../../store/editor-store";
import { useProjectStore } from "../../store/project-store";

const WaterPlane = () => {
  const water = useEditorStore((state) => state.water);
  const project = useProjectStore((state) => state.project);
  const heightmap = project.chunks["00"]?.heightmap;

  const geometry = useMemo(() => {
    if (!heightmap) return null;
    const baseSize = getBaseHeightmapSize(project);
    const mapSize = getMapWorldSize(project, baseSize);
    const width = mapSize.width;
    const depth = mapSize.height;
    return new THREE.PlaneGeometry(width, depth, 1, 1);
  }, [heightmap, project]);

  if (!water.enabled || !geometry) return null;

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, water.level, 0]}>
      <meshStandardMaterial
        color="#2b6fa7"
        transparent
        opacity={water.opacity}
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
};

export default WaterPlane;

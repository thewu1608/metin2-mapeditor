import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { getBaseHeightmapSize, getMapWorldSize } from "../../lib/utils/map-math";
import { useProjectStore } from "../../store/project-store";

const AutoCamera = () => {
  const { camera } = useThree();
  const { project } = useProjectStore();
  const hasHeightmap = Object.values(project.chunks).some((chunk) => chunk.heightmap);

  const mapWidth = project.settings.mapSize.width;
  const mapHeight = project.settings.mapSize.height;
  const cellScale = project.settings.cellScale;
  const chunkCount = Object.keys(project.chunks).length;

  useEffect(() => {
    if (!hasHeightmap) return;
    const baseSize = getBaseHeightmapSize(project);
    const mapSize = getMapWorldSize(project, baseSize);
    const distance = Math.max(20, Math.max(mapSize.width, mapSize.height) * 0.6);
    camera.position.set(distance, distance * 0.75, distance);
    camera.lookAt(0, 0, 0);
  }, [camera, hasHeightmap, mapWidth, mapHeight, cellScale, chunkCount, project]);

  return null;
};

export default AutoCamera;

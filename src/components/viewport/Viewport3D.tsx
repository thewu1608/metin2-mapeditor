import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { getBaseHeightmapSize, getMapWorldSize } from "../../lib/utils/map-math";
import { useProjectStore } from "../../store/project-store";
import AutoCamera from "./AutoCamera";
import AttrOverlay from "./AttrOverlay";
import BrushPreview from "./BrushPreview";
import MinimapOverlay from "./MinimapOverlay";
import ObjectRenderer from "./ObjectRenderer";
import TerrainMesh from "./TerrainMesh";
import WaterPlane from "./WaterPlane";

const Viewport3D = () => {
  const project = useProjectStore((state) => state.project);
  const heightmap = project.chunks["00"]?.heightmap;
  const baseSize = getBaseHeightmapSize(project);
  const mapWorld = getMapWorldSize(project, baseSize);

  return (
    <div className="relative h-full min-h-[480px] w-full">
      <Canvas className="h-full w-full" camera={{ position: [15, 18, 15], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <hemisphereLight color="#cfd6e6" groundColor="#1b202c" intensity={0.6} />
        <directionalLight position={[12, 20, 12]} intensity={0.8} />
        <AutoCamera />
        <OrbitControls enableDamping makeDefault />
        <TerrainMesh />
        <ObjectRenderer />
        <BrushPreview />
        <WaterPlane />
        <gridHelper
          args={[Math.max(mapWorld.width, mapWorld.height), 20, "#394359", "#232a3a"]}
        />
      </Canvas>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-6 top-6 rounded-lg border border-white/10 bg-panel/80 px-3 py-2 text-xs text-inkMuted shadow-panel">
          3D Viewport (Three.js)
        </div>
        {!heightmap ? (
          <div className="absolute left-6 top-16 max-w-xs rounded-lg border border-white/10 bg-panel/90 px-3 py-2 text-xs text-inkMuted shadow-panel">
            Lade eine height.raw im Projekt-Import, um das Terrain zu sehen.
          </div>
        ) : null}
        {heightmap ? (
          <div className="absolute left-6 top-16 rounded-lg border border-white/10 bg-panel/80 px-3 py-2 text-[11px] text-inkMuted shadow-panel">
            Heightmap: {heightmap.size}x{heightmap.size}
          </div>
        ) : null}
      </div>
      <MinimapOverlay />
      <AttrOverlay />
    </div>
  );
};

export default Viewport3D;

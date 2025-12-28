import { useMemo, useRef } from "react";
import * as THREE from "three";
import { applyAttributeBrush, createEmptyAttributes } from "../../lib/editors/attribute-brush";
import { applyTerrainBrush } from "../../lib/editors/terrain-brush";
import {
  getBaseHeightmapSize,
  getChunkKey,
  getMapWorldSize,
  sampleHeightmap,
  toGameUnits,
} from "../../lib/utils/map-math";
import { useEditorStore } from "../../store/editor-store";
import { useProjectStore } from "../../store/project-store";

const TerrainMesh = () => {
  const { project, setChunkHeightmap, setChunkAttributes, addChunkObject } = useProjectStore();
  const { terrain } = useEditorStore();
  const tool = useEditorStore((state) => state.tool);
  const brush = useEditorStore((state) => state.brush);
  const attrSettings = useEditorStore((state) => state.attributes);
  const setBrushPreview = useEditorStore((state) => state.setBrushPreview);
  const setSelectedObject = useEditorStore((state) => state.setSelectedObject);
  const objectAssets = useEditorStore((state) => state.objects.assets);
  const selectedObjectId = useEditorStore((state) => state.objects.selectedAssetId);
  const placement = useEditorStore((state) => state.objects.placement);
  const isPaintingRef = useRef(false);
  const settings = project.settings;

  const buildChunkGeometry = (chunkHeightmap: { size: number; data: number[][] } | undefined) => {
    if (!chunkHeightmap) return null;
    const size = chunkHeightmap.size;
    const gridScale = settings.cellScale / 100;
    const width = (size - 1) * gridScale;
    const depth = (size - 1) * gridScale;
    const geo = new THREE.PlaneGeometry(width, depth, size - 1, size - 1);
    const positions = geo.attributes.position as THREE.BufferAttribute;
    const colors: number[] = [];
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const value = chunkHeightmap.data[y]?.[x] ?? 0;
        const height = value * settings.heightScale;
        min = Math.min(min, height);
        max = Math.max(max, height);
      }
    }
    const range = Math.max(1, max - min);
    const low = new THREE.Color("#4f5a38");
    const mid = new THREE.Color("#6f6a43");
    const high = new THREE.Color("#7a776a");
    const peak = new THREE.Color("#b2b0a4");
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const index = y * size + x;
        const heightValue = chunkHeightmap.data[y]?.[x] ?? 0;
        const height = heightValue * settings.heightScale;
        const normalized = (height - min) / range;
        const displayHeight = (height / 100) * terrain.exaggeration;
        positions.setZ(index, displayHeight);
        let color = low.clone().lerp(mid, Math.min(1, normalized * 1.2));
        if (normalized > 0.55) {
          color = mid.clone().lerp(high, (normalized - 0.55) / 0.3);
        }
        if (normalized > 0.85) {
          color = high.clone().lerp(peak, (normalized - 0.85) / 0.15);
        }
        colors.push(color.r, color.g, color.b);
      }
    }
    positions.needsUpdate = true;
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.rotateX(-Math.PI / 2);
    geo.computeVertexNormals();
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
  };

  const baseSize = getBaseHeightmapSize(project);
  const mapWorld = getMapWorldSize(project, baseSize);
  const halfMapX = mapWorld.width / 2;
  const halfMapZ = mapWorld.height / 2;

  const flatHeightmap = useMemo(() => {
    const size = baseSize;
    const data = Array.from({ length: size }, () => Array.from({ length: size }, () => 0));
    return { size, data };
  }, [baseSize]);

  const chunkMeshes = useMemo(() => {
    const meshes: { id: string; geometry: THREE.BufferGeometry; position: [number, number, number] }[] = [];
    for (let cy = 0; cy < settings.mapSize.height; cy += 1) {
      for (let cx = 0; cx < settings.mapSize.width; cx += 1) {
        const id = getChunkKey(project, cx, cy);
        const chunkHeightmap = project.chunks[id]?.heightmap ?? flatHeightmap;
        const geometry = buildChunkGeometry(chunkHeightmap);
        if (!geometry) continue;
        const posX = -halfMapX + mapWorld.chunkWorldSize / 2 + cx * mapWorld.chunkWorldSize;
        const posZ = -halfMapZ + mapWorld.chunkWorldSize / 2 + cy * mapWorld.chunkWorldSize;
        meshes.push({ id, geometry, position: [posX, 0, posZ] });
      }
    }
    return meshes;
  }, [
    project.chunks,
    settings.mapSize,
    settings.cellScale,
    settings.heightScale,
    flatHeightmap,
    mapWorld.chunkWorldSize,
    halfMapX,
    halfMapZ,
    terrain.exaggeration,
  ]);

  const applyAtPoint = (point: THREE.Vector3) => {
    const gridScale = settings.cellScale / 100;
    const localX = point.x + halfMapX;
    const localY = point.z + halfMapZ;
    const chunkX = Math.floor(localX / mapWorld.chunkWorldSize);
    const chunkY = Math.floor(localY / mapWorld.chunkWorldSize);
    if (
      chunkX < 0 ||
      chunkY < 0 ||
      chunkX >= settings.mapSize.width ||
      chunkY >= settings.mapSize.height
    ) {
      return;
    }
    const chunkId = getChunkKey(project, chunkX, chunkY);
    const chunkLocalX = localX - chunkX * mapWorld.chunkWorldSize;
    const chunkLocalY = localY - chunkY * mapWorld.chunkWorldSize;

    if (tool === "terrain") {
      const targetHeightmap = project.chunks[chunkId]?.heightmap ?? flatHeightmap;
      const size = targetHeightmap.size;
      const ix = Math.round(chunkLocalX / gridScale);
      const iy = Math.round(chunkLocalY / gridScale);
      if (ix < 0 || iy < 0 || ix >= size || iy >= size) return;
      const next = applyTerrainBrush(
        targetHeightmap,
        ix,
        iy,
        brush,
        terrain.mode,
        terrain.intensity,
        gridScale,
      );
      setChunkHeightmap(chunkId, next);
    }
    if (tool === "attributes") {
      const attrData = project.chunks[chunkId]?.attributes ?? createEmptyAttributes(256, 256);
      const cellWorld = mapWorld.chunkWorldSize / (attrData.width - 1);
      const attrX = Math.round(chunkLocalX / cellWorld);
      const attrY = Math.round(chunkLocalY / cellWorld);
      if (attrX < 0 || attrY < 0 || attrX >= attrData.width || attrY >= attrData.height) {
        return;
      }
      const radiusCells = (brush.size / 2) / cellWorld;
      const nextAttr = applyAttributeBrush(
        attrData,
        attrX,
        attrY,
        brush,
        attrSettings.mode,
        attrSettings.flag,
        radiusCells,
      );
      setChunkAttributes(chunkId, nextAttr);
    }
  };

  const placeAtPoint = (point: THREE.Vector3) => {
    const selected = objectAssets.find((asset) => asset.id === selectedObjectId);
    if (!selected) return;
    const gridScale = settings.cellScale / 100;
    const localX = point.x + halfMapX;
    const localY = point.z + halfMapZ;
    const chunkX = Math.floor(localX / mapWorld.chunkWorldSize);
    const chunkY = Math.floor(localY / mapWorld.chunkWorldSize);
    if (
      chunkX < 0 ||
      chunkY < 0 ||
      chunkX >= settings.mapSize.width ||
      chunkY >= settings.mapSize.height
    ) {
      return;
    }
    const chunkId = getChunkKey(project, chunkX, chunkY);
    const chunkLocalX = localX - chunkX * mapWorld.chunkWorldSize;
    const chunkLocalY = localY - chunkY * mapWorld.chunkWorldSize;
    const heightmap = project.chunks[chunkId]?.heightmap ?? flatHeightmap;
    const heightX = chunkLocalX / gridScale;
    const heightY = chunkLocalY / gridScale;
    const rawHeight = sampleHeightmap(heightmap, heightX, heightY);
    const height = rawHeight * settings.heightScale;
    const yaw = placement.randomYaw ? Math.random() * 360 : placement.yaw;
    const rotation = { x: yaw, y: placement.pitch, z: placement.roll };
    const id = `obj_${Math.random().toString(36).slice(2, 10)}`;
    const next = {
      id,
      crc32: selected.crc32,
      position: {
        x: toGameUnits(point.x),
        y: toGameUnits(point.z),
        z: height,
      },
      rotation,
      heightBias: placement.heightBias,
      label: selected.label,
      gr2Path: selected.gr2Path,
    };
    addChunkObject(chunkId, next);
    setSelectedObject({ id, chunkId });
  };

  if (!chunkMeshes.length) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60, 1, 1]} />
        <meshStandardMaterial color="#202836" />
      </mesh>
    );
  }

  return (
    <group>
      {chunkMeshes.map((chunk) => (
        <mesh
          key={chunk.id}
          geometry={chunk.geometry}
          position={chunk.position}
          receiveShadow
          frustumCulled={false}
        >
          <meshStandardMaterial
            roughness={0.85}
            metalness={0.1}
            wireframe={terrain.wireframe}
            vertexColors
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <mesh
        position={[0, 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={(event) => {
          if (tool === "terrain" || tool === "attributes") {
            isPaintingRef.current = true;
            applyAtPoint(event.point);
            setBrushPreview(true, event.point);
            return;
          }
          if (tool === "objects") {
            placeAtPoint(event.point);
            return;
          }
          if (tool === "select") {
            setSelectedObject(null);
          }
        }}
        onPointerMove={(event) => {
          if (tool !== "terrain" && tool !== "attributes") {
            setBrushPreview(false);
            return;
          }
          setBrushPreview(true, event.point);
          if (!isPaintingRef.current) return;
          applyAtPoint(event.point);
        }}
        onPointerUp={() => {
          isPaintingRef.current = false;
        }}
        onPointerLeave={() => {
          isPaintingRef.current = false;
          setBrushPreview(false);
        }}
      >
        <planeGeometry args={[mapWorld.width, mapWorld.height, 1, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default TerrainMesh;

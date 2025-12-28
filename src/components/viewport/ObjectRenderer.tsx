import { TransformControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  getBaseHeightmapSize,
  getChunkKey,
  getMapWorldSize,
  sampleHeightmap,
  toEditorUnits,
  toGameUnits,
} from "../../lib/utils/map-math";
import { useEditorStore } from "../../store/editor-store";
import { useProjectStore } from "../../store/project-store";
import type { AreaObject } from "../../types/metin2";

type ObjectEntry = {
  chunkId: string;
  obj: AreaObject;
};

const ObjectRenderer = () => {
  const project = useProjectStore((state) => state.project);
  const updateChunkObject = useProjectStore((state) => state.updateChunkObject);
  const moveChunkObject = useProjectStore((state) => state.moveChunkObject);
  const layers = useEditorStore((state) => state.layers);
  const tool = useEditorStore((state) => state.tool);
  const selectedObject = useEditorStore((state) => state.objects.selectedObject);
  const transformMode = useEditorStore((state) => state.objects.transformMode);
  const setSelectedObject = useEditorStore((state) => state.setSelectedObject);
  const terrain = useEditorStore((state) => state.terrain);
  const controls = useThree((state) => state.controls) as { enabled?: boolean } | null;
  const selectedRef = useRef<THREE.Group>(null);
  const markerSize = Math.max(1.4, (project.settings.cellScale / 100) * 0.8);

  const objects = useMemo(() => {
    return Object.entries(project.chunks).flatMap(([chunkId, chunk]) =>
      (chunk.objects ?? []).map((obj) => ({ chunkId, obj })),
    );
  }, [project.chunks]);

  const selectedEntry = useMemo(() => {
    if (!selectedObject) return null;
    return (
      objects.find(
        (entry) =>
          entry.chunkId === selectedObject.chunkId && entry.obj.id === selectedObject.id,
      ) ?? null
    );
  }, [objects, selectedObject]);

  const baseSize = getBaseHeightmapSize(project);
  const mapWorld = getMapWorldSize(project, baseSize);
  const halfMapX = mapWorld.width / 2;
  const halfMapZ = mapWorld.height / 2;

  const flatHeightmap = useMemo(() => {
    const size = baseSize;
    const data = Array.from({ length: size }, () => Array.from({ length: size }, () => 0));
    return { size, data };
  }, [baseSize]);

  const resolveChunkAt = (x: number, z: number) => {
    const localX = x + halfMapX;
    const localY = z + halfMapZ;
    const chunkX = Math.floor(localX / mapWorld.chunkWorldSize);
    const chunkY = Math.floor(localY / mapWorld.chunkWorldSize);
    if (
      chunkX < 0 ||
      chunkY < 0 ||
      chunkX >= project.settings.mapSize.width ||
      chunkY >= project.settings.mapSize.height
    ) {
      return null;
    }
    const chunkId = getChunkKey(project, chunkX, chunkY);
    const chunkLocalX = localX - chunkX * mapWorld.chunkWorldSize;
    const chunkLocalY = localY - chunkY * mapWorld.chunkWorldSize;
    return { chunkId, chunkLocalX, chunkLocalY };
  };

  const applyTransform = () => {
    if (!selectedEntry || !selectedRef.current) return;
    const ref = selectedRef.current;
    const nextChunk = resolveChunkAt(ref.position.x, ref.position.z);
    if (!nextChunk) return;
    const gridScale = project.settings.cellScale / 100;
    const heightmap = project.chunks[nextChunk.chunkId]?.heightmap ?? flatHeightmap;
    const heightX = nextChunk.chunkLocalX / gridScale;
    const heightY = nextChunk.chunkLocalY / gridScale;
    const rawHeight = sampleHeightmap(heightmap, heightX, heightY);
    const baseHeight = rawHeight * project.settings.heightScale;
    const totalHeight = toGameUnits(ref.position.y / terrain.exaggeration);
    const heightBias = totalHeight - baseHeight;
    const euler = ref.rotation;
    const partial = {
      position: {
        x: toGameUnits(ref.position.x),
        y: toGameUnits(ref.position.z),
        z: baseHeight,
      },
      rotation: {
        x: THREE.MathUtils.radToDeg(euler.y),
        y: THREE.MathUtils.radToDeg(euler.x),
        z: THREE.MathUtils.radToDeg(euler.z),
      },
      heightBias,
      scale: { x: ref.scale.x, y: ref.scale.y, z: ref.scale.z },
    };
    const next = { ...selectedEntry.obj, ...partial };
    if (nextChunk.chunkId === selectedEntry.chunkId) {
      updateChunkObject(selectedEntry.chunkId, selectedEntry.obj.id, partial);
      return;
    }
    moveChunkObject(selectedEntry.chunkId, nextChunk.chunkId, selectedEntry.obj.id, next);
    setSelectedObject({ id: selectedEntry.obj.id, chunkId: nextChunk.chunkId });
  };

  const renderObject = (entry: ObjectEntry, isSelected: boolean) => {
    const { obj } = entry;
    const x = toEditorUnits(obj.position.x);
    const z = toEditorUnits(obj.position.y);
    const y =
      toEditorUnits(obj.position.z + obj.heightBias) * terrain.exaggeration + markerSize * 0.45;
    const scale = obj.scale ?? { x: 1, y: 1, z: 1 };
    const rotation = new THREE.Euler(
      THREE.MathUtils.degToRad(obj.rotation.y),
      THREE.MathUtils.degToRad(obj.rotation.x),
      THREE.MathUtils.degToRad(obj.rotation.z),
      "YXZ",
    );
    const onSelect = (event: ThreeEvent<PointerEvent>) => {
      if (tool !== "select" && tool !== "objects") return;
      event.stopPropagation();
      setSelectedObject({ id: obj.id, chunkId: entry.chunkId });
    };
    return (
      <group
        key={`${entry.chunkId}_${obj.id}`}
        ref={isSelected ? selectedRef : undefined}
        position={[x, y, z]}
        rotation={rotation}
        scale={[scale.x, scale.y, scale.z]}
        onPointerDown={onSelect}
      >
        <mesh renderOrder={2}>
          <boxGeometry args={[markerSize, markerSize * 1.6, markerSize]} />
          <meshBasicMaterial
            color={isSelected ? "#f2c07a" : "#7ad3f2"}
            depthTest={false}
            depthWrite={false}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>
    );
  };

  if (!layers.objects) return null;

  return (
    <group>
      {objects
        .filter(
          (entry) =>
            !selectedEntry ||
            entry.chunkId !== selectedEntry.chunkId ||
            entry.obj.id !== selectedEntry.obj.id,
        )
        .map((entry) => renderObject(entry, false))}
      {selectedEntry ? (
        <TransformControls
          mode={transformMode}
          onMouseDown={() => {
            if (controls && "enabled" in controls) controls.enabled = false;
          }}
          onMouseUp={() => {
            if (controls && "enabled" in controls) controls.enabled = true;
          }}
          onObjectChange={applyTransform}
        >
          {renderObject(selectedEntry, true)}
        </TransformControls>
      ) : null}
    </group>
  );
};

export default ObjectRenderer;

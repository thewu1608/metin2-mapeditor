import { useEffect, useRef } from "react";
import { getChunkKey } from "../../lib/utils/map-math";
import { useEditorStore } from "../../store/editor-store";
import { useProjectStore } from "../../store/project-store";

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const AttrOverlay = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const project = useProjectStore((state) => state.project);
  const visible = useEditorStore((state) => state.layers.attrs);
  const attrColors = useEditorStore((state) => state.attributes.colors);
  const opacity = useEditorStore((state) => state.attributes.opacity);

  const chunkCount = Object.keys(project.chunks).length;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !visible) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      let attrWidth = 256;
      let attrHeight = 256;
      for (const chunk of Object.values(project.chunks)) {
        if (chunk.attributes) {
          attrWidth = chunk.attributes.width;
          attrHeight = chunk.attributes.height;
          break;
        }
      }
      const totalWidth = project.settings.mapSize.width * attrWidth;
      const totalHeight = project.settings.mapSize.height * attrHeight;
      const cellW = rect.width / totalWidth;
      const cellH = rect.height / totalHeight;

      for (let cy = 0; cy < project.settings.mapSize.height; cy += 1) {
        for (let cx = 0; cx < project.settings.mapSize.width; cx += 1) {
          const chunk = project.chunks[getChunkKey(project, cx, cy)];
          if (!chunk?.attributes) continue;
          const attr = chunk.attributes;
          for (let y = 0; y < attr.height; y += 1) {
            for (let x = 0; x < attr.width; x += 1) {
              const value = attr.data[y]?.[x] ?? 0;
              if (!value) continue;
              const drawX = (cx * attrWidth + x) * cellW;
              const drawY = (cy * attrHeight + y) * cellH;
              if (value & 0x01) {
                ctx.fillStyle = hexToRgba(attrColors.blocked, opacity);
                ctx.fillRect(drawX, drawY, cellW, cellH);
              }
              if (value & 0x02) {
                ctx.fillStyle = hexToRgba(attrColors.water, opacity);
                ctx.fillRect(drawX, drawY, cellW, cellH);
              }
              if (value & 0x04) {
                ctx.fillStyle = hexToRgba(attrColors.bannable, opacity);
                ctx.fillRect(drawX, drawY, cellW, cellH);
              }
            }
          }
        }
      }
    };

    render();
    const observer = new ResizeObserver(render);
    observer.observe(container);
    return () => observer.disconnect();
  }, [
    visible,
    attrColors.blocked,
    attrColors.water,
    attrColors.bannable,
    opacity,
    project.settings.mapSize.width,
    project.settings.mapSize.height,
    chunkCount,
  ]);

  if (!visible) return null;

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
};

export default AttrOverlay;

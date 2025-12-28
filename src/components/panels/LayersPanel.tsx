import { useState } from "react";
import { serializeAttributes } from "../../lib/parsers/attributes";
import { serializeAreaData } from "../../lib/parsers/areadata";
import { serializeHeightmap } from "../../lib/parsers/heightmap";
import type { MapSettings } from "../../types/project";
import { useEditorStore } from "../../store/editor-store";
import { useProjectStore } from "../../store/project-store";

const LayersPanel = () => {
  const layers = useEditorStore((state) => state.layers);
  const setLayerVisibility = useEditorStore((state) => state.setLayerVisibility);
  const attrColors = useEditorStore((state) => state.attributes.colors);
  const attrOpacity = useEditorStore((state) => state.attributes.opacity);
  const setAttributes = useEditorStore((state) => state.setAttributes);
  const project = useProjectStore((state) => state.project);
  const [chunkId, setChunkId] = useState("00");

  const resolveChunkKey = () => {
    const cleaned = chunkId.trim();
    if (cleaned.includes(",") || cleaned.includes(" ")) {
      const parts = cleaned.split(/[,\s]+/).map((part) => Number(part));
      if (parts.length >= 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
        const x = String(parts[0]).padStart(3, "0");
        const y = String(parts[1]).padStart(3, "0");
        return `${x}${y}`;
      }
    }
    return cleaned;
  };

  const exportAttributes = () => {
    const key = resolveChunkKey();
    const chunk = project.chunks[key];
    if (!chunk?.attributes) return;
    const buffer = serializeAttributes(chunk.attributes);
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${key}_attr.atr`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAllAttributes = async () => {
    const zip = new (await import("jszip")).default();
    let count = 0;
    for (const [key, chunk] of Object.entries(project.chunks)) {
      if (!chunk.attributes) continue;
      const buffer = serializeAttributes(chunk.attributes);
      zip.file(`${key}/attr.atr`, buffer);
      count += 1;
    }
    if (count === 0) return;
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "attr_export.zip";
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAreaData = () => {
    const key = resolveChunkKey();
    const chunk = project.chunks[key];
    if (!chunk?.objects?.length) return;
    const content = serializeAreaData(chunk.objects);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${key}_AreaData.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAllAreaData = async () => {
    const zip = new (await import("jszip")).default();
    let count = 0;
    for (const [key, chunk] of Object.entries(project.chunks)) {
      if (!chunk.objects?.length) continue;
      const content = serializeAreaData(chunk.objects);
      zip.file(`${key}/AreaData.txt`, content);
      count += 1;
    }
    if (count === 0) return;
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "areadata_export.zip";
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAllHeightmaps = async () => {
    const zip = new (await import("jszip")).default();
    let count = 0;
    for (const [key, chunk] of Object.entries(project.chunks)) {
      if (!chunk.heightmap) continue;
      const buffer = serializeHeightmap(chunk.heightmap);
      zip.file(`${key}/height.raw`, buffer);
      count += 1;
    }
    if (count === 0) return;
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "height_export.zip";
    link.click();
    URL.revokeObjectURL(url);
  };

  const serializeSettings = (settings: MapSettings) => {
    return [
      "ScriptType,MapSetting",
      "",
      `CellScale,${settings.cellScale}`,
      `HeightScale,${settings.heightScale}`,
      `ViewRadius,${settings.viewRadius}`,
      `MapSize,${settings.mapSize.width},${settings.mapSize.height}`,
      `BasePosition,${settings.basePosition.x},${settings.basePosition.y}`,
      `TextureSet,${settings.textureSet}`,
      `Environment,${settings.environment}`,
    ].join("\n");
  };

  const exportFullMap = async () => {
    const zip = new (await import("jszip")).default();
    let count = 0;
    for (const [key, chunk] of Object.entries(project.chunks)) {
      if (chunk.heightmap) {
        const buffer = serializeHeightmap(chunk.heightmap);
        zip.file(`${key}/height.raw`, buffer);
        count += 1;
      }
      if (chunk.attributes) {
        const buffer = serializeAttributes(chunk.attributes);
        zip.file(`${key}/attr.atr`, buffer);
      }
      if (chunk.objects?.length) {
        const content = serializeAreaData(chunk.objects);
        zip.file(`${key}/AreaData.txt`, content);
      }
    }
    zip.file("Setting.txt", serializeSettings(project.settings));
    if (count === 0) return;
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name || "map"}_export.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-xl border border-white/10 bg-panelAlt/70 p-3 shadow-panel">
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-ink">Layers</h2>
      </header>
      <div className="space-y-2 text-xs text-inkMuted">
        <label className="flex items-center justify-between rounded-md border border-white/5 bg-white/5 px-3 py-2">
          <span>Terrain</span>
          <input
            type="checkbox"
            checked={layers.terrain}
            onChange={(event) => setLayerVisibility("terrain", event.target.checked)}
          />
        </label>
        <label className="flex items-center justify-between rounded-md border border-white/5 bg-white/5 px-3 py-2">
          <span>Objects</span>
          <input
            type="checkbox"
            checked={layers.objects}
            onChange={(event) => setLayerVisibility("objects", event.target.checked)}
          />
        </label>
        <label className="flex items-center justify-between rounded-md border border-white/5 bg-white/5 px-3 py-2">
          <span>Spawns</span>
          <input
            type="checkbox"
            checked={layers.spawns}
            onChange={(event) => setLayerVisibility("spawns", event.target.checked)}
          />
        </label>
        <label className="flex items-center justify-between rounded-md border border-white/5 bg-white/5 px-3 py-2">
          <span>Attrs</span>
          <input
            type="checkbox"
            checked={layers.attrs}
            onChange={(event) => setLayerVisibility("attrs", event.target.checked)}
          />
        </label>
        <div className="rounded-md border border-white/5 bg-white/5 px-3 py-2">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-inkMuted">
            Attr Legende
          </div>
          <div className="grid grid-cols-1 gap-2 text-[11px] text-inkMuted">
            <label className="flex items-center justify-between gap-2">
              <span>Blocked</span>
              <input
                type="color"
                value={attrColors.blocked}
                onChange={(event) =>
                  setAttributes({
                    colors: { ...attrColors, blocked: event.target.value },
                  })
                }
              />
            </label>
            <label className="flex items-center justify-between gap-2">
              <span>Water</span>
              <input
                type="color"
                value={attrColors.water}
                onChange={(event) =>
                  setAttributes({
                    colors: { ...attrColors, water: event.target.value },
                  })
                }
              />
            </label>
            <label className="flex items-center justify-between gap-2">
              <span>Bannable</span>
              <input
                type="color"
                value={attrColors.bannable}
                onChange={(event) =>
                  setAttributes({
                    colors: { ...attrColors, bannable: event.target.value },
                  })
                }
              />
            </label>
            <label className="flex items-center justify-between gap-2">
              <span>Opacity</span>
              <input
                type="range"
                min={0.1}
                max={0.9}
                step={0.05}
                value={attrOpacity}
                onChange={(event) =>
                  setAttributes({ opacity: Number(event.target.value) })
                }
              />
            </label>
          </div>
        </div>
        <div className="rounded-md border border-white/5 bg-white/5 px-3 py-2">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-inkMuted">
            Attr Export
          </div>
          <div className="flex items-center gap-2 text-[11px] text-inkMuted">
            <input
              className="w-12 rounded-md bg-panel px-2 py-1 text-xs text-ink"
              value={chunkId}
              onChange={(event) => setChunkId(event.target.value)}
              placeholder="000000"
            />
            <button
              className="rounded-md bg-accent/20 px-2 py-1 text-[11px] text-accent"
              onClick={exportAttributes}
            >
              attr.atr export
            </button>
            <button
              className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-inkMuted hover:text-ink"
              onClick={exportAreaData}
            >
              AreaData export
            </button>
          </div>
          <button
            className="mt-2 w-full rounded-md bg-white/5 px-2 py-1 text-[11px] text-inkMuted hover:text-ink"
            onClick={() => void exportAllAttributes()}
          >
            Alle attr.atr als ZIP
          </button>
          <button
            className="mt-2 w-full rounded-md bg-white/5 px-2 py-1 text-[11px] text-inkMuted hover:text-ink"
            onClick={() => void exportAllAreaData()}
          >
            Alle AreaData als ZIP
          </button>
          <button
            className="mt-2 w-full rounded-md bg-white/5 px-2 py-1 text-[11px] text-inkMuted hover:text-ink"
            onClick={() => void exportAllHeightmaps()}
          >
            Alle height.raw als ZIP
          </button>
          <button
            className="mt-2 w-full rounded-md bg-accent/20 px-2 py-1 text-[11px] text-accent"
            onClick={() => void exportFullMap()}
          >
            Gesamte Map als ZIP
          </button>
        </div>
      </div>
    </section>
  );
};

export default LayersPanel;

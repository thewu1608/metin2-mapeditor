import { useState } from "react";
import JSZip from "jszip";
import { parseAttributes } from "../../lib/parsers/attributes";
import { parseAreaData } from "../../lib/parsers/areadata";
import { parseHeightmap } from "../../lib/parsers/heightmap";
import { parseSettings } from "../../lib/parsers/settings";
import { useEditorStore } from "../../store/editor-store";
import { useProjectStore } from "../../store/project-store";

const ProjectLoader = () => {
  const [status, setStatus] = useState<string>("");
  const [files, setFiles] = useState({
    settings: "",
    heightmap: "",
    attributes: "",
    objects: "",
  });
  const [areaChunkId, setAreaChunkId] = useState("00");
  const [heightStats, setHeightStats] = useState<{
    min: number;
    max: number;
    avg: number;
  } | null>(null);
  const { project, updateSettings, setChunkHeightmap, setChunkAttributes, setChunkObjects } =
    useProjectStore();
  const upsertObjectAssets = useEditorStore((state) => state.upsertObjectAssets);

  const resolveChunkKey = (raw: string) => {
    const cleaned = raw.trim();
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

  const handleSettings = async (file: File) => {
    const text = await file.text();
    const settings = parseSettings(text);
    updateSettings(settings);
    setStatus(`Setting.txt geladen (${settings.mapSize.width}x${settings.mapSize.height})`);
    setFiles((prev) => ({ ...prev, settings: file.name }));
  };

  const handleHeightmap = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const heightmap = parseHeightmap(buffer);
    setChunkHeightmap("00", heightmap);
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    let sum = 0;
    let count = 0;
    for (let y = 0; y < heightmap.size; y += 1) {
      for (let x = 0; x < heightmap.size; x += 1) {
        const value = heightmap.data[y]?.[x] ?? 0;
        min = Math.min(min, value);
        max = Math.max(max, value);
        sum += value;
        count += 1;
      }
    }
    const avg = count ? Math.round(sum / count) : 0;
    setHeightStats({ min, max, avg });
    setStatus(
      `height.raw geladen (${heightmap.size}x${heightmap.size}) min:${min} max:${max} avg:${avg}`,
    );
    setFiles((prev) => ({ ...prev, heightmap: file.name }));
  };

  const handleAttributes = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const attributes = parseAttributes(buffer);
    setChunkAttributes("00", attributes);
    setStatus(`attr.atr geladen (${attributes.width}x${attributes.height})`);
    setFiles((prev) => ({ ...prev, attributes: file.name }));
  };

  const handleAreaData = async (file: File) => {
    const text = await file.text();
    const objects = parseAreaData(text);
    const chunkKey = resolveChunkKey(areaChunkId);
    setChunkObjects(chunkKey, objects);
    upsertObjectAssets(
      objects.map((obj) => ({
        id: `asset_${obj.crc32}`,
        label: obj.label ?? `CRC ${obj.crc32}`,
        crc32: obj.crc32,
        gr2Path: obj.gr2Path,
      })),
    );
    setStatus(`AreaData geladen (${objects.length} Objekte)`);
    setFiles((prev) => ({ ...prev, objects: file.name }));
  };

  const handleMapFolder = async (filesList: FileList) => {
    const files = Array.from(filesList);
    const heightFiles = files.filter((file) => file.name.toLowerCase() === "height.raw");
    const attrFiles = files.filter((file) => file.name.toLowerCase() === "attr.atr");

    let loaded = 0;
    for (const file of heightFiles) {
      const rel = (file as File & { webkitRelativePath?: string }).webkitRelativePath ?? "";
      const folder = rel.split("/")[0] ?? "";
      const match = folder.match(/^(\d{3})(\d{3})$/);
      if (!match) continue;
      const chunkKey = `${match[1]}${match[2]}`;
      const buffer = await file.arrayBuffer();
      const heightmap = parseHeightmap(buffer);
      setChunkHeightmap(chunkKey, heightmap);
      loaded += 1;
    }

    for (const file of attrFiles) {
      const rel = (file as File & { webkitRelativePath?: string }).webkitRelativePath ?? "";
      const folder = rel.split("/")[0] ?? "";
      const match = folder.match(/^(\d{3})(\d{3})$/);
      if (!match) continue;
      const chunkKey = `${match[1]}${match[2]}`;
      const buffer = await file.arrayBuffer();
      const attributes = parseAttributes(buffer);
      setChunkAttributes(chunkKey, attributes);
    }

    if (loaded > 0) {
      setStatus(`Map-Ordner geladen (${loaded} height.raw)`);
    }
  };


  const handleZip = async (file: File) => {
    const zip = await JSZip.loadAsync(file);
    let loaded = 0;
    let settingsLoaded = false;
    const entries = Object.values(zip.files);
    for (const entry of entries) {
      if (entry.dir) continue;
      const name = entry.name.replace(/\\/g, "/");
      const parts = name.split("/").filter(Boolean);
      if (parts.length < 2) continue;
      const chunkFolder = parts.find((part) => /^(\d{3})(\d{3})$/.test(part));
      const filename = parts[parts.length - 1].toLowerCase();
      if (filename === "setting.txt") {
        const text = await entry.async("string");
        const settings = parseSettings(text);
        updateSettings(settings);
        setFiles((prev) => ({ ...prev, settings: "Setting.txt (ZIP)" }));
        settingsLoaded = true;
        continue;
      }
      if (!chunkFolder) continue;
      const match = chunkFolder.match(/^(\d{3})(\d{3})$/);
      if (!match) continue;
      const chunkKey = `${match[1]}${match[2]}`;
      if (filename === "height.raw") {
        const buffer = await entry.async("arraybuffer");
        const heightmap = parseHeightmap(buffer);
        setChunkHeightmap(chunkKey, heightmap);
        loaded += 1;
      }
      if (filename === "attr.atr") {
        const buffer = await entry.async("arraybuffer");
        const attributes = parseAttributes(buffer);
        setChunkAttributes(chunkKey, attributes);
      }
      if (filename === "areadata.txt") {
        const text = await entry.async("string");
        const objects = parseAreaData(text);
        setChunkObjects(chunkKey, objects);
        upsertObjectAssets(
          objects.map((obj) => ({
            id: `asset_${obj.crc32}`,
            label: obj.label ?? `CRC ${obj.crc32}`,
            crc32: obj.crc32,
            gr2Path: obj.gr2Path,
          })),
        );
      }
    }
    if (loaded > 0) {
      setStatus(
        `ZIP geladen (${loaded} height.raw${settingsLoaded ? ", Setting.txt" : ""})`,
      );
    }
  };

  return (
    <section className="rounded-xl border border-white/10 bg-panelAlt/80 p-3 shadow-panel">
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-ink">Projekt Import</h2>
      </header>
      <div className="space-y-3 text-xs text-inkMuted">
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-md border border-white/5 bg-white/5 px-3 py-2">
            <span>Setting.txt</span>
            <label className="cursor-pointer rounded-md bg-accent/20 px-2 py-1 text-[11px] text-accent">
              Datei waehlen
              <input
                type="file"
                accept=".txt"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleSettings(file);
                }}
                className="hidden"
              />
            </label>
          </div>
          {files.settings ? <div className="text-[11px] text-ink">{files.settings}</div> : null}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-md border border-white/5 bg-white/5 px-3 py-2">
            <span>height.raw</span>
            <label className="cursor-pointer rounded-md bg-accent/20 px-2 py-1 text-[11px] text-accent">
              Datei waehlen
              <input
                type="file"
                accept=".raw"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleHeightmap(file);
                }}
                className="hidden"
              />
            </label>
          </div>
          {files.heightmap ? <div className="text-[11px] text-ink">{files.heightmap}</div> : null}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-md border border-white/5 bg-white/5 px-3 py-2">
            <span>attr.atr</span>
            <label className="cursor-pointer rounded-md bg-accent/20 px-2 py-1 text-[11px] text-accent">
              Datei waehlen
              <input
                type="file"
                accept=".atr"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleAttributes(file);
                }}
                className="hidden"
              />
            </label>
          </div>
          {files.attributes ? (
            <div className="text-[11px] text-ink">{files.attributes}</div>
          ) : null}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 rounded-md border border-white/5 bg-white/5 px-3 py-2">
            <span>AreaData.txt</span>
            <input
              className="w-14 rounded-md bg-panel px-2 py-1 text-[11px] text-ink"
              value={areaChunkId}
              onChange={(event) => setAreaChunkId(event.target.value)}
              placeholder="000000"
            />
            <label className="cursor-pointer rounded-md bg-accent/20 px-2 py-1 text-[11px] text-accent">
              Datei waehlen
              <input
                type="file"
                accept=".txt"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleAreaData(file);
                }}
                className="hidden"
              />
            </label>
          </div>
          {files.objects ? <div className="text-[11px] text-ink">{files.objects}</div> : null}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-md border border-white/5 bg-white/5 px-3 py-2">
            <span>Map-ZIP</span>
            <label className="cursor-pointer rounded-md bg-accent/20 px-2 py-1 text-[11px] text-accent">
              ZIP waehlen
              <input
                type="file"
                accept=".zip"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleZip(file);
                }}
                className="hidden"
              />
            </label>
          </div>
          <div className="text-[11px] text-inkMuted">
            ZIP mit Ordnern wie 000000/000001/... und height.raw
          </div>
        </div>
        <div className="rounded-md border border-white/5 bg-white/5 px-3 py-2 text-[11px]">
          <div className="text-ink">Aktuell</div>
          <div>
            MapSize: {project.settings.mapSize.width}x{project.settings.mapSize.height}
          </div>
          <div>HeightScale: {project.settings.heightScale}</div>
          {heightStats ? (
            <div>
              Height: min {heightStats.min} / max {heightStats.max} / avg {heightStats.avg}
            </div>
          ) : null}
        </div>
        {status ? <div className="text-[11px] text-accent">{status}</div> : null}
      </div>
    </section>
  );
};

export default ProjectLoader;

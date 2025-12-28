import { useMemo, useState } from "react";
import { parsePropertyFile } from "../../lib/parsers/property";
import { getCaseCrc32 } from "../../lib/utils/crc32";
import { useEditorStore } from "../../store/editor-store";

const ObjectBrowser = () => {
  const assets = useEditorStore((state) => state.objects.assets);
  const selectedAssetId = useEditorStore((state) => state.objects.selectedAssetId);
  const placement = useEditorStore((state) => state.objects.placement);
  const addObjectAsset = useEditorStore((state) => state.addObjectAsset);
  const upsertObjectAssets = useEditorStore((state) => state.upsertObjectAssets);
  const setSelectedObjectAsset = useEditorStore((state) => state.setSelectedObjectAsset);
  const setObjectPlacement = useEditorStore((state) => state.setObjectPlacement);

  const [label, setLabel] = useState("");
  const [crcInput, setCrcInput] = useState("");
  const [gr2Path, setGr2Path] = useState("");
  const [query, setQuery] = useState("");
  const [importStatus, setImportStatus] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return assets;
    return assets.filter((asset) =>
      asset.label.toLowerCase().includes(needle) || String(asset.crc32).includes(needle),
    );
  }, [assets, query]);

  const handleAdd = () => {
    const directCrc = Number(crcInput);
    const crc32 = Number.isFinite(directCrc) ? directCrc : gr2Path ? getCaseCrc32(gr2Path) : NaN;
    if (!Number.isFinite(crc32)) return;
    const assetLabel = label.trim() || gr2Path.trim() || `CRC ${crc32}`;
    const asset = {
      id: `asset_${crc32}`,
      label: assetLabel,
      crc32,
      gr2Path: gr2Path.trim() || undefined,
    };
    addObjectAsset(asset);
    setSelectedObjectAsset(asset.id);
    setLabel("");
    setCrcInput("");
    setGr2Path("");
  };

  const handlePropertyFolder = async (filesList: FileList) => {
    const files = Array.from(filesList);
    const propertyFiles = files.filter((file) => {
      const lower = file.name.toLowerCase();
      return lower.endsWith(".prb") || lower.endsWith(".prt");
    });
    const assets = [];
    for (const file of propertyFiles) {
      const text = await file.text();
      const parsed = parsePropertyFile(text, file.name);
      if (parsed) assets.push(parsed);
    }
    if (assets.length) {
      upsertObjectAssets(assets);
      if (!selectedAssetId) {
        setSelectedObjectAsset(assets[0].id);
      }
      setImportStatus(`${assets.length} Properties geladen`);
    } else {
      setImportStatus("Keine Property-Dateien gefunden");
    }
  };

  return (
    <section className="rounded-xl border border-white/10 bg-panelAlt/80 p-3 shadow-panel">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Objekt-Browser</h2>
        <span className="text-[11px] text-inkMuted">{assets.length} Assets</span>
      </header>
      <input
        className="w-full rounded-md border border-white/10 bg-panel px-3 py-2 text-xs text-ink outline-none placeholder:text-inkMuted/60"
        placeholder="Suche nach Name oder CRC32"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="mt-3 space-y-2 text-[11px] text-inkMuted">
        <div className="rounded-md border border-white/5 bg-white/5 px-3 py-2">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-inkMuted">
            Neues Objekt
          </div>
          <div className="grid gap-2">
            <input
              className="w-full rounded-md border border-white/10 bg-panel px-2 py-1 text-xs text-ink"
              placeholder="Label (z.B. Haus 01)"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
            <input
              className="w-full rounded-md border border-white/10 bg-panel px-2 py-1 text-xs text-ink"
              placeholder="CRC32 (optional)"
              value={crcInput}
              onChange={(event) => setCrcInput(event.target.value)}
            />
            <input
              className="w-full rounded-md border border-white/10 bg-panel px-2 py-1 text-xs text-ink"
              placeholder="GR2 Pfad (optional)"
              value={gr2Path}
              onChange={(event) => setGr2Path(event.target.value)}
            />
            <button
              className="rounded-md bg-accent/20 px-2 py-1 text-[11px] text-accent"
              onClick={handleAdd}
            >
              Objekt hinzufuegen
            </button>
            <div className="text-[10px] text-inkMuted">
              Ohne CRC32 wird der GR2 Pfad per Case-CRC32 gehasht.
            </div>
          </div>
        </div>
        <div className="rounded-md border border-white/5 bg-white/5 px-3 py-2">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-inkMuted">
            Property-Ordner import
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-accent/20 px-2 py-1 text-[11px] text-accent">
            Ordner waehlen
            {/* @ts-expect-error webkitdirectory is supported in Chromium */}
            <input
              type="file"
              multiple
              webkitdirectory=""
              directory=""
              onChange={(event) => {
                const list = event.target.files;
                if (list) void handlePropertyFolder(list);
              }}
              className="hidden"
            />
          </label>
          {importStatus ? (
            <div className="mt-2 text-[10px] text-inkMuted">{importStatus}</div>
          ) : null}
        </div>
        <div className="rounded-md border border-white/5 bg-white/5 px-3 py-2">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-inkMuted">
            Platzierung
          </div>
          <div className="grid gap-2">
            <label className="flex items-center justify-between gap-2">
              <span>Yaw</span>
              <input
                className="w-20 rounded-md bg-panel px-2 py-1 text-xs text-ink"
                type="number"
                value={placement.yaw}
                onChange={(event) => setObjectPlacement({ yaw: Number(event.target.value) })}
              />
            </label>
            <label className="flex items-center justify-between gap-2">
              <span>Pitch</span>
              <input
                className="w-20 rounded-md bg-panel px-2 py-1 text-xs text-ink"
                type="number"
                value={placement.pitch}
                onChange={(event) => setObjectPlacement({ pitch: Number(event.target.value) })}
              />
            </label>
            <label className="flex items-center justify-between gap-2">
              <span>Roll</span>
              <input
                className="w-20 rounded-md bg-panel px-2 py-1 text-xs text-ink"
                type="number"
                value={placement.roll}
                onChange={(event) => setObjectPlacement({ roll: Number(event.target.value) })}
              />
            </label>
            <label className="flex items-center justify-between gap-2">
              <span>HeightBias</span>
              <input
                className="w-20 rounded-md bg-panel px-2 py-1 text-xs text-ink"
                type="number"
                value={placement.heightBias}
                onChange={(event) => setObjectPlacement({ heightBias: Number(event.target.value) })}
              />
            </label>
            <label className="flex items-center justify-between gap-2">
              <span>Random Yaw</span>
              <input
                type="checkbox"
                checked={placement.randomYaw}
                onChange={(event) => setObjectPlacement({ randomYaw: event.target.checked })}
              />
            </label>
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-2 text-xs text-inkMuted">
        {filtered.map((asset) => (
          <button
            key={asset.id}
            className={`w-full rounded-md border px-3 py-2 text-left ${
              selectedAssetId === asset.id
                ? "border-accent/50 bg-accent/20 text-accent"
                : "border-white/5 bg-white/5 text-inkMuted hover:text-ink"
            }`}
            onClick={() => setSelectedObjectAsset(asset.id)}
          >
            <div className="text-[11px] font-semibold">{asset.label}</div>
            <div className="text-[10px] text-inkMuted">CRC {asset.crc32}</div>
            {asset.gr2Path ? (
              <div className="text-[10px] text-inkMuted">{asset.gr2Path}</div>
            ) : null}
          </button>
        ))}
        {filtered.length === 0 ? (
          <div className="rounded-md border border-white/5 bg-white/5 px-3 py-2 text-[11px] text-inkMuted">
            Keine Objekte gefunden.
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default ObjectBrowser;

import { useEditorStore } from "../../store/editor-store";
import { useProjectStore } from "../../store/project-store";

const ToolOptions = () => {
  const tool = useEditorStore((state) => state.tool);
  const brush = useEditorStore((state) => state.brush);
  const terrain = useEditorStore((state) => state.terrain);
  const water = useEditorStore((state) => state.water);
  const attributes = useEditorStore((state) => state.attributes);
  const transformMode = useEditorStore((state) => state.objects.transformMode);
  const selectedObject = useEditorStore((state) => state.objects.selectedObject);
  const setTool = useEditorStore((state) => state.setTool);
  const setTerrain = useEditorStore((state) => state.setTerrain);
  const setWater = useEditorStore((state) => state.setWater);
  const setBrush = useEditorStore((state) => state.setBrush);
  const setAttributes = useEditorStore((state) => state.setAttributes);
  const setObjectTransformMode = useEditorStore((state) => state.setObjectTransformMode);
  const undoHeightmap = useProjectStore((state) => state.undoHeightmap);
  const redoHeightmap = useProjectStore((state) => state.redoHeightmap);

  return (
    <div className="flex items-center justify-between border-b border-white/5 bg-panelAlt px-4 py-2 text-xs text-inkMuted">
      <div className="flex items-center gap-3">
        <span className="font-medium text-ink">Aktives Tool</span>
        <button
          className={`rounded-md px-3 py-1 ${
            tool === "select" ? "bg-accent/15 text-accent" : "bg-white/5 hover:text-ink"
          }`}
          onClick={() => setTool("select")}
        >
          Select
        </button>
        <button
          className={`rounded-md px-3 py-1 ${
            tool === "terrain" ? "bg-accent/15 text-accent" : "bg-white/5 hover:text-ink"
          }`}
          onClick={() => setTool("terrain")}
        >
          Terrain
        </button>
        <button
          className={`rounded-md px-3 py-1 ${
            tool === "objects" ? "bg-accent/15 text-accent" : "bg-white/5 hover:text-ink"
          }`}
          onClick={() => setTool("objects")}
        >
          Objects
        </button>
        <button
          className={`rounded-md px-3 py-1 ${
            tool === "spawns" ? "bg-accent/15 text-accent" : "bg-white/5 hover:text-ink"
          }`}
          onClick={() => setTool("spawns")}
        >
          Spawns
        </button>
        <button
          className={`rounded-md px-3 py-1 ${
            tool === "attributes" ? "bg-accent/15 text-accent" : "bg-white/5 hover:text-ink"
          }`}
          onClick={() => setTool("attributes")}
        >
          Attrs
        </button>
      </div>
      <div className="flex items-center gap-3">
        <span>Brush: {brush.size}</span>
        <label className="flex items-center gap-2">
          <span>Size</span>
          <input
            type="range"
            min={4}
            max={120}
            step={2}
            value={brush.size}
            onChange={(event) =>
              setBrush({ size: Number(event.target.value) })
            }
          />
        </label>
        <span>Strength: {brush.strength}</span>
        <span>Falloff: {brush.falloff}</span>
        {tool === "terrain" ? (
          <>
            <button
              className="rounded-md bg-white/5 px-3 py-1 hover:text-ink"
              onClick={() => undoHeightmap("00")}
            >
              Undo
            </button>
            <button
              className="rounded-md bg-white/5 px-3 py-1 hover:text-ink"
              onClick={() => redoHeightmap("00")}
            >
              Redo
            </button>
            <label className="flex items-center gap-2">
              <span>Mode</span>
              <select
                className="rounded-md bg-panel px-2 py-1 text-xs"
                value={terrain.mode}
                onChange={(event) =>
                  setTerrain({ mode: event.target.value as typeof terrain.mode })
                }
              >
                <option value="raise">Raise</option>
                <option value="lower">Lower</option>
                <option value="smooth">Smooth</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span>Intensity</span>
              <input
                type="range"
                min={10}
                max={400}
                step={10}
                value={terrain.intensity}
                onChange={(event) =>
                  setTerrain({ intensity: Number(event.target.value) })
                }
              />
            </label>
          </>
        ) : null}
        {tool === "attributes" ? (
          <>
            <label className="flex items-center gap-2">
              <span>Mode</span>
              <select
                className="rounded-md bg-panel px-2 py-1 text-xs"
                value={attributes.mode}
                onChange={(event) =>
                  setAttributes({
                    mode: event.target.value as typeof attributes.mode,
                  })
                }
              >
                <option value="paint">Paint</option>
                <option value="erase">Erase</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span>Flag</span>
              <select
                className="rounded-md bg-panel px-2 py-1 text-xs"
                value={attributes.flag}
                onChange={(event) =>
                  setAttributes({ flag: Number(event.target.value) })
                }
              >
                <option value={0x01}>Blocked</option>
                <option value={0x02}>Water</option>
                <option value={0x04}>Bannable</option>
              </select>
            </label>
          </>
        ) : null}
        {tool === "objects" || tool === "select" ? (
          <>
            <span>Gizmo</span>
            <button
              className={`rounded-md px-3 py-1 ${
                transformMode === "translate"
                  ? "bg-accent/15 text-accent"
                  : "bg-white/5 hover:text-ink"
              }`}
              onClick={() => setObjectTransformMode("translate")}
            >
              Bewegen
            </button>
            <button
              className={`rounded-md px-3 py-1 ${
                transformMode === "rotate"
                  ? "bg-accent/15 text-accent"
                  : "bg-white/5 hover:text-ink"
              }`}
              onClick={() => setObjectTransformMode("rotate")}
            >
              Drehen
            </button>
            <button
              className={`rounded-md px-3 py-1 ${
                transformMode === "scale"
                  ? "bg-accent/15 text-accent"
                  : "bg-white/5 hover:text-ink"
              }`}
              onClick={() => setObjectTransformMode("scale")}
            >
              Skalieren
            </button>
            <span className="text-[11px] text-inkMuted">
              {selectedObject ? `Objekt: ${selectedObject.id}` : "Kein Objekt selektiert"}
            </span>
          </>
        ) : null}
        <label className="flex items-center gap-2">
          <span>Height</span>
          <input
            type="range"
            min={1}
            max={12}
            step={0.5}
            value={terrain.exaggeration}
            onChange={(event) =>
              setTerrain({ exaggeration: Number(event.target.value) })
            }
          />
        </label>
        <label className="flex items-center gap-2">
          <span>Wire</span>
          <input
            type="checkbox"
            checked={terrain.wireframe}
            onChange={(event) => setTerrain({ wireframe: event.target.checked })}
          />
        </label>
        <label className="flex items-center gap-2">
          <span>Points</span>
          <input
            type="checkbox"
            checked={terrain.points}
            onChange={(event) => setTerrain({ points: event.target.checked })}
          />
        </label>
        <label className="flex items-center gap-2">
          <span>Water</span>
          <input
            type="checkbox"
            checked={water.enabled}
            onChange={(event) => setWater({ enabled: event.target.checked })}
          />
        </label>
        <label className="flex items-center gap-2">
          <span>Level</span>
          <input
            type="range"
            min={-10}
            max={40}
            step={1}
            value={water.level}
            onChange={(event) => setWater({ level: Number(event.target.value) })}
          />
        </label>
      </div>
    </div>
  );
};

export default ToolOptions;

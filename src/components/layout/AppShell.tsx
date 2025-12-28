import { useEffect } from "react";
import { useEditorStore } from "../../store/editor-store";
import { useProjectStore } from "../../store/project-store";
import LayersPanel from "../panels/LayersPanel";
import ObjectBrowser from "../panels/ObjectBrowser";
import ProjectLoader from "../panels/ProjectLoader";
import PropertiesPanel from "../panels/PropertiesPanel";
import SpawnEditor from "../panels/SpawnEditor";
import MainToolbar from "../toolbar/MainToolbar";
import ToolOptions from "../toolbar/ToolOptions";
import Viewport3D from "../viewport/Viewport3D";
import StatusBar from "./StatusBar";

const AppShell = () => {
  const tool = useEditorStore((state) => state.tool);
  const brush = useEditorStore((state) => state.brush);
  const setBrush = useEditorStore((state) => state.setBrush);
  const undoHeightmap = useProjectStore((state) => state.undoHeightmap);
  const redoHeightmap = useProjectStore((state) => state.redoHeightmap);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (tool !== "terrain") return;
      if (event.key === "[") {
        setBrush({ size: Math.max(4, brush.size - 4) });
      }
      if (event.key === "]") {
        setBrush({ size: Math.min(120, brush.size + 4) });
      }
      if (event.ctrlKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undoHeightmap("00");
      }
      if (event.ctrlKey && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redoHeightmap("00");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [tool, brush.size, setBrush]);

  return (
    <div className="app-bg min-h-screen text-ink">
      <div className="grid min-h-screen grid-rows-[auto_auto_1fr_auto]">
        <MainToolbar />
        <ToolOptions />
        <main className="grid min-h-0 grid-cols-[260px_1fr_320px]">
          <section className="flex min-h-0 flex-col gap-3 border-r border-white/5 bg-panel/80 p-3">
            <ProjectLoader />
            <ObjectBrowser />
            <LayersPanel />
          </section>
          <section className="min-h-0 bg-canvas">
            <Viewport3D />
          </section>
          <section className="flex min-h-0 flex-col gap-3 border-l border-white/5 bg-panel/90 p-3">
            <PropertiesPanel />
            <SpawnEditor />
          </section>
        </main>
        <StatusBar />
      </div>
    </div>
  );
};

export default AppShell;

const StatusBar = () => {
  return (
    <footer className="flex items-center justify-between border-t border-white/5 bg-panelAlt px-4 py-2 text-xs text-inkMuted">
      <div className="flex items-center gap-4">
        <span>Coords: 0, 0, 0</span>
        <span>Zoom: 1.0x</span>
        <span>Tool: Select</span>
      </div>
      <div className="flex items-center gap-4">
        <span>Project: Untitled</span>
        <span>Status: Unsaved</span>
      </div>
    </footer>
  );
};

export default StatusBar;

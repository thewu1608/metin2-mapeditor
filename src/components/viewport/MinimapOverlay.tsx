const MinimapOverlay = () => {
  return (
    <div className="absolute bottom-6 right-6 h-40 w-40 rounded-xl border border-white/10 bg-panel/90 p-3 shadow-panel">
      <div className="flex h-full flex-col justify-between text-[11px] text-inkMuted">
        <div className="text-ink">Minimap</div>
        <div className="flex items-center justify-between">
          <span>Zoom</span>
          <span>1.0x</span>
        </div>
      </div>
    </div>
  );
};

export default MinimapOverlay;

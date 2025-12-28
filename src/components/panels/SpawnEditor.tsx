const SpawnEditor = () => {
  return (
    <section className="rounded-xl border border-white/10 bg-panelAlt/70 p-3 shadow-panel">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Spawn Editor</h2>
        <button className="rounded-md bg-accent/20 px-2 py-1 text-[11px] text-accent">+ Add</button>
      </header>
      <div className="space-y-2 text-xs text-inkMuted">
        <div className="rounded-md border border-white/5 bg-white/5 px-3 py-2">
          <div className="text-ink">m 6912 (Orc)</div>
          <div className="text-[11px] text-inkMuted">Area: 200x150 | Respawn: 30s</div>
        </div>
        <div className="rounded-md border border-white/5 bg-white/5 px-3 py-2">
          <div className="text-ink">n 20060 (Shop)</div>
          <div className="text-[11px] text-inkMuted">Area: 0x0 | Respawn: --</div>
        </div>
      </div>
    </section>
  );
};

export default SpawnEditor;

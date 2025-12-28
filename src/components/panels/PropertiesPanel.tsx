const PropertiesPanel = () => {
  return (
    <section className="rounded-xl border border-white/10 bg-panelAlt/80 p-3 shadow-panel">
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-ink">Properties</h2>
      </header>
      <div className="space-y-3 text-xs text-inkMuted">
        <div className="rounded-lg border border-white/5 bg-white/5 p-3">
          <div className="text-[11px] uppercase tracking-wide text-inkMuted">Transform</div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-ink">
            <input className="rounded-md bg-panel px-2 py-1 text-xs" placeholder="X" />
            <input className="rounded-md bg-panel px-2 py-1 text-xs" placeholder="Y" />
            <input className="rounded-md bg-panel px-2 py-1 text-xs" placeholder="Z" />
          </div>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/5 p-3">
          <div className="text-[11px] uppercase tracking-wide text-inkMuted">Selection</div>
          <p className="mt-2 text-inkMuted">Kein Objekt selektiert.</p>
        </div>
      </div>
    </section>
  );
};

export default PropertiesPanel;

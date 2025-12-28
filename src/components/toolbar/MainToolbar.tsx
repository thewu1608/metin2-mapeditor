const MainToolbar = () => {
  return (
    <header className="flex items-center justify-between border-b border-white/5 bg-panel px-4 py-3">
      <div className="flex items-center gap-6 text-sm font-medium text-ink">
        <span className="text-base font-semibold text-accent">M2MapForge</span>
        <nav className="flex items-center gap-4 text-inkMuted">
          <button className="hover:text-ink">Datei</button>
          <button className="hover:text-ink">Bearbeiten</button>
          <button className="hover:text-ink">Ansicht</button>
          <button className="hover:text-ink">Tools</button>
          <button className="hover:text-ink">Hilfe</button>
        </nav>
      </div>
      <div className="flex items-center gap-3 text-xs text-inkMuted">
        <span>Workspace: Local</span>
        <span className="rounded-full bg-accent/20 px-2 py-1 text-accent">Alpha</span>
      </div>
    </header>
  );
};

export default MainToolbar;

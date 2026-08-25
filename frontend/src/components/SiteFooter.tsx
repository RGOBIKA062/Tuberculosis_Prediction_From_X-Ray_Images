export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-dark py-12 text-muted-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-sm bg-primary" />
          <span className="font-bold uppercase tracking-tight text-surface-dark-foreground">
            TB Detection AI
          </span>
        </div>
        <div className="text-center text-xs font-medium">
          Decision support only — every result must be confirmed by a qualified clinician.
        </div>
        <div className="font-mono text-[10px] tracking-widest">© 2026 TB DETECTION AI</div>
      </div>
    </footer>
  );
}

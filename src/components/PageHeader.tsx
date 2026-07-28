export function PageHeader({
  kicker,
  title,
  description,
  children,
}: {
  kicker?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="border-b border-foreground/5 bg-surface/40">
      <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">
        {kicker && (
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent mb-4 block">
            {kicker}
          </span>
        )}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-balance">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground mt-4 text-base md:text-lg leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {children && <div className="shrink-0">{children}</div>}
        </div>
      </div>
    </header>
  );
}
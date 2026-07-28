export function SkeletonCard() {
  return (
    <div className="w-full space-y-3 animate-pulse">
      <div className="aspect-[4/5] w-full rounded-sm bg-foreground/10" />
      <div className="space-y-2">
        <div className="h-3 w-1/4 rounded bg-foreground/10" />
        <div className="h-4 w-3/4 rounded bg-foreground/10" />
      </div>
    </div>
  );
}

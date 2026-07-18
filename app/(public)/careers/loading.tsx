export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-16">
      <div className="h-4 w-40 rounded bg-muted" />
      <div className="mt-4 h-10 w-72 rounded bg-muted" />
      <div className="mt-10 space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border bg-muted/60" />
        ))}
      </div>
    </div>
  );
}

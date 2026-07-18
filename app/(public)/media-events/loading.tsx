export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-16">
      <div className="h-4 w-40 rounded bg-muted" />
      <div className="mt-4 h-10 w-72 rounded bg-muted" />
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 rounded-xl border bg-muted/60" />
        ))}
      </div>
    </div>
  );
}

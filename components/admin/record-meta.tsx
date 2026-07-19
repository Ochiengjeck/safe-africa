import { formatDate } from "@/lib/format";

/** "Created … · Last updated …" metadata line for edit pages. */
export function RecordMeta({ createdAt, updatedAt }: { createdAt: Date; updatedAt: Date }) {
  return (
    <p className="font-mono text-xs text-muted-foreground">
      Created {formatDate(createdAt)} · Last updated {formatDate(updatedAt)}
    </p>
  );
}

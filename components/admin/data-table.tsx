"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUp, ArrowDown, ChevronsUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Column<Row> = {
  key: string;
  header: string;
  /** Extracts the sortable/searchable primitive for this column. */
  value?: (row: Row) => string | number | Date | null | undefined;
  /** Custom cell renderer; falls back to String(value). */
  cell?: (row: Row) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  numeric?: boolean;
  /** Hide this column in the mobile card view. */
  hideOnMobile?: boolean;
  className?: string;
};

type DataTableProps<Row> = {
  rows: Row[];
  columns: Column<Row>[];
  rowKey: (row: Row) => string;
  /** Renders per-row actions (Edit/Delete buttons). */
  actions?: (row: Row) => React.ReactNode;
  /** Entire row navigates here on click (consistent row-click behavior). */
  rowHref?: (row: Row) => string;
  defaultSort?: { key: string; dir: "asc" | "desc" };
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** Enables checkbox selection + contextual bulk action bar. */
  bulkActions?: (selectedIds: string[], clear: () => void) => React.ReactNode;
  /** Visually mark rows (e.g. unread messages). */
  rowClassName?: (row: Row) => string | undefined;
};

const PAGE_SIZES = [10, 25, 50];

/**
 * Client-side admin data table: search (debounced by React state batching at
 * this scale), column sorting, pagination, URL-persisted state, mobile card
 * fallback, empty vs zero-result states, optional bulk selection.
 * Client-side operations are intentional — CMS datasets are small.
 */
export function DataTable<Row>({
  rows,
  columns,
  rowKey,
  actions,
  rowHref,
  defaultSort,
  searchPlaceholder = "Search…",
  emptyMessage = "Nothing here yet.",
  bulkActions,
  rowClassName,
}: DataTableProps<Row>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const query = searchParams.get("q") ?? "";
  const sortKey = searchParams.get("sort") ?? defaultSort?.key ?? "";
  const sortDir = (searchParams.get("dir") ?? defaultSort?.dir ?? "desc") as "asc" | "desc";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = PAGE_SIZES.includes(Number(searchParams.get("size"))) ? Number(searchParams.get("size")) : 10;

  function setParams(update: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(update)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    startTransition(() => router.replace(`?${params.toString()}`, { scroll: false }));
  }

  const searchableColumns = columns.filter((c) => c.searchable !== false && c.value);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const needle = query.toLowerCase();
    return rows.filter((row) =>
      searchableColumns.some((column) => {
        const value = column.value!(row);
        return value != null && String(value).toLowerCase().includes(needle);
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, query]);

  const sorted = useMemo(() => {
    const column = columns.find((c) => c.key === sortKey && c.value);
    if (!column) return filtered;
    const factor = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = column.value!(a);
      const bv = column.value!(b);
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av instanceof Date && bv instanceof Date) return (av.getTime() - bv.getTime()) * factor;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * factor;
      return String(av).localeCompare(String(bv)) * factor;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
  const rangeStart = sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, sorted.length);

  const pageIds = pageRows.map(rowKey);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));

  function toggleSort(key: string) {
    if (sortKey === key) setParams({ dir: sortDir === "asc" ? "desc" : "asc", page: null });
    else setParams({ sort: key, dir: "asc", page: null });
  }

  function togglePageSelection() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  const clearSelection = () => setSelected(new Set());

  if (rows.length === 0) {
    return <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            placeholder={searchPlaceholder}
            className="pl-8"
            onChange={(e) => setParams({ q: e.target.value, page: null })}
            aria-label="Search table"
          />
        </div>
        <p className="text-sm text-muted-foreground" role="status">
          {query
            ? `${sorted.length} match${sorted.length === 1 ? "" : "es"}`
            : `Showing ${rangeStart}–${rangeEnd} of ${sorted.length}`}
        </p>
      </div>

      {bulkActions && selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-secondary/60 px-4 py-2.5">
          <p className="text-sm font-medium">{selected.size} selected</p>
          {bulkActions([...selected], clearSelection)}
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            Clear
          </Button>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          <p>No matches for “{query}”.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setParams({ q: null, page: null })}>
            Clear search
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  {bulkActions && (
                    <th className="w-10 px-3 py-2.5">
                      <input
                        type="checkbox"
                        aria-label="Select page"
                        checked={allPageSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = !allPageSelected && somePageSelected;
                        }}
                        onChange={togglePageSelection}
                        className="h-4 w-4 rounded border-input"
                      />
                    </th>
                  )}
                  {columns.map((column) => (
                    <th key={column.key} className={cn("px-4 py-2.5 font-medium", column.numeric && "text-right", column.className)}>
                      {column.sortable !== false && column.value ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(column.key)}
                          className="inline-flex items-center gap-1 hover:text-foreground"
                          aria-label={`Sort by ${column.header}`}
                        >
                          {column.header}
                          {sortKey === column.key ? (
                            sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        column.header
                      )}
                    </th>
                  ))}
                  {actions && <th className="px-4 py-2.5" />}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, i) => {
                  const id = rowKey(row);
                  return (
                    <tr
                      key={id}
                      className={cn(
                        "border-b last:border-0",
                        i % 2 === 1 && "bg-muted/30",
                        rowHref && "cursor-pointer hover:bg-accent/60",
                        rowClassName?.(row)
                      )}
                      onClick={rowHref ? () => router.push(rowHref(row)) : undefined}
                    >
                      {bulkActions && (
                        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            aria-label="Select row"
                            checked={selected.has(id)}
                            onChange={() =>
                              setSelected((prev) => {
                                const next = new Set(prev);
                                if (next.has(id)) next.delete(id);
                                else next.add(id);
                                return next;
                              })
                            }
                            className="h-4 w-4 rounded border-input"
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cn("px-4 py-2.5", column.numeric && "text-right font-mono text-xs", column.className)}
                        >
                          {column.cell ? column.cell(row) : String(column.value?.(row) ?? "—")}
                        </td>
                      ))}
                      {actions && (
                        <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">{actions(row)}</div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <ul className="space-y-3 md:hidden">
            {pageRows.map((row) => {
              const id = rowKey(row);
              return (
                <li key={id} className={cn("rounded-lg border bg-card p-4", rowClassName?.(row))}>
                  {bulkActions && (
                    <label className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={selected.has(id)}
                        onChange={() =>
                          setSelected((prev) => {
                            const next = new Set(prev);
                            if (next.has(id)) next.delete(id);
                            else next.add(id);
                            return next;
                          })
                        }
                        className="h-4 w-4 rounded border-input"
                      />
                      Select
                    </label>
                  )}
                  <dl className="space-y-1.5">
                    {columns
                      .filter((column) => !column.hideOnMobile)
                      .map((column) => (
                        <div key={column.key} className="flex items-baseline justify-between gap-3 text-sm">
                          <dt className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground">{column.header}</dt>
                          <dd className="min-w-0 text-right">{column.cell ? column.cell(row) : String(column.value?.(row) ?? "—")}</dd>
                        </div>
                      ))}
                  </dl>
                  {(actions || rowHref) && (
                    <div className="mt-3 flex justify-end gap-2">
                      {rowHref && (
                        <Button variant="outline" size="sm" onClick={() => router.push(rowHref(row))}>
                          Open
                        </Button>
                      )}
                      {actions?.(row)}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              Rows per page
              <select
                value={pageSize}
                onChange={(e) => setParams({ size: e.target.value, page: null })}
                className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setParams({ page: String(safePage - 1) })}
              >
                Previous
              </Button>
              <span className="text-muted-foreground">
                Page {safePage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setParams({ page: String(safePage + 1) })}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

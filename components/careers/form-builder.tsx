"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FIELD_TYPES, type FieldType, type FormField } from "@/lib/careers/form-fields";

const TYPE_LABELS: Record<FieldType, string> = {
  section: "Section heading",
  short_text: "Short text",
  long_text: "Long text",
  email: "Email",
  phone: "Phone",
  url: "URL / link",
  number: "Number",
  date: "Date",
  select: "Dropdown (choose one)",
  multiselect: "Checkboxes (choose many)",
  yes_no: "Yes / No",
  consent: "Consent checkbox",
  file: "File upload (CV)",
};

const NEEDS_OPTIONS: FieldType[] = ["select", "multiselect"];
const CAN_MAP: FieldType[] = ["short_text", "email", "phone"];

let counter = 0;
function newId() {
  counter += 1;
  return `field_${Date.now().toString(36)}_${counter}`;
}

/**
 * Visual builder for a dynamic application form. Serializes the ordered field
 * list into a hidden input (`name`, default "fields") so a plain server-action
 * form can submit it. Reused inline by the vacancy form for custom forms.
 */
export function FormBuilder({ name = "fields", defaultValue }: { name?: string; defaultValue?: FormField[] }) {
  const [fields, setFields] = useState<FormField[]>(
    defaultValue && defaultValue.length ? defaultValue : [{ id: newId(), type: "short_text", label: "" }]
  );

  const update = (i: number, patch: Partial<FormField>) =>
    setFields((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const remove = (i: number) => setFields((prev) => prev.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) =>
    setFields((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const add = () => setFields((prev) => [...prev, { id: newId(), type: "short_text", label: "" }]);

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(fields)} />

      {fields.map((field, i) => (
        <div key={field.id} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-start gap-3">
            <div className="grid flex-1 gap-3 sm:grid-cols-[180px_1fr]">
              <label className="space-y-1 text-xs font-medium text-muted-foreground">
                Field type
                <select
                  value={field.type}
                  onChange={(e) => update(i, { type: e.target.value as FieldType })}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm text-foreground"
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs font-medium text-muted-foreground">
                {field.type === "section" ? "Heading text" : "Question label"}
                <Input
                  value={field.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                  placeholder={field.type === "section" ? "e.g. Your experience" : "e.g. Full name"}
                />
              </label>
            </div>
            <div className="flex gap-1 pt-5">
              <Button type="button" variant="ghost" size="icon" onClick={() => move(i, -1)} aria-label="Move up" disabled={i === 0}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => move(i, 1)} aria-label="Move down" disabled={i === fields.length - 1}>
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove field" disabled={fields.length === 1}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          {field.type !== "section" && (
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              {field.type !== "consent" && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.required ?? false}
                    onChange={(e) => update(i, { required: e.target.checked })}
                    className="h-4 w-4 rounded border-input"
                  />
                  Required
                </label>
              )}
              {CAN_MAP.includes(field.type) && (
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  Maps to
                  <select
                    value={field.map ?? ""}
                    onChange={(e) => update(i, { map: (e.target.value || undefined) as FormField["map"] })}
                    className="h-8 rounded-md border border-input bg-transparent px-2 text-sm text-foreground"
                  >
                    <option value="">—</option>
                    <option value="name">Applicant name</option>
                    <option value="email">Applicant email</option>
                    <option value="phone">Applicant phone</option>
                  </select>
                </label>
              )}
            </div>
          )}

          {NEEDS_OPTIONS.includes(field.type) && (
            <label className="mt-3 block space-y-1 text-xs font-medium text-muted-foreground">
              Options (one per line)
              <textarea
                value={(field.options ?? []).join("\n")}
                onChange={(e) => update(i, { options: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
                rows={3}
                className="w-full rounded-md border border-input bg-transparent p-2 text-sm text-foreground"
                placeholder={"Option one\nOption two"}
              />
            </label>
          )}

          {field.type !== "section" && (
            <label className="mt-3 block space-y-1 text-xs font-medium text-muted-foreground">
              Help text (optional)
              <Input value={field.helpText ?? ""} onChange={(e) => update(i, { helpText: e.target.value || undefined })} />
            </label>
          )}
        </div>
      ))}

      <Button type="button" variant="outline" onClick={add} className="gap-2">
        <Plus className="h-4 w-4" /> Add field
      </Button>
    </div>
  );
}

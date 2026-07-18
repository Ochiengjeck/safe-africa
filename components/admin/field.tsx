import type { ActionState } from "@/lib/action-utils";

/**
 * Label + control wrapper with the field's server-side validation errors.
 * Errors are announced to assistive tech: the child control should carry
 * id={name}; the error list is linked via aria-describedby-compatible id.
 */
export function Field({
  label,
  name,
  state,
  children,
}: {
  label: string;
  name: string;
  state: ActionState;
  children: React.ReactNode;
}) {
  const errors = state?.fieldErrors?.[name];
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {errors && (
        <div id={`${name}-error`} role="alert">
          {errors.map((error) => (
            <p key={error} className="text-xs text-destructive">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function FormError({ state }: { state: ActionState }) {
  if (!state?.error) return null;
  return (
    <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {state.error}
    </p>
  );
}

export function FormSuccess({ state, message = "Saved." }: { state: ActionState; message?: string }) {
  if (!state?.ok) return null;
  return (
    <p role="status" className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
      {message}
    </p>
  );
}

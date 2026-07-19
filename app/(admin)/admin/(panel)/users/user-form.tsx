"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveUser } from "@/lib/actions/users";
import { Input } from "@/components/ui/input";
import { Field, FormError } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import type { User } from "@/lib/generated/prisma/client";

export function UserForm({ user }: { user?: Pick<User, "id" | "email" | "name" | "role" | "active"> }) {
  const [state, action] = useActionState(saveUser, null);
  return (
    <form action={action} className="max-w-xl space-y-5">
      {user && <input type="hidden" name="id" value={user.id} />}
      <FormError state={state} />
      <Field label="Name" name="name" state={state}>
        <Input id="name" name="name" defaultValue={user?.name} required />
      </Field>
      <Field label="Email" name="email" state={state}>
        <Input id="email" name="email" type="email" defaultValue={user?.email} required />
      </Field>
      <Field label={user ? "New password (leave empty to keep current)" : "Password (min 10 characters)"} name="password" state={state}>
        <Input id="password" name="password" type="password" autoComplete="new-password" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Role" name="role" state={state}>
          <select
            id="role"
            name="role"
            defaultValue={user?.role ?? "EDITOR"}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="EDITOR">Editor — content only</option>
            <option value="ADMIN">Admin — content, careers, messages</option>
            <option value="SUPER_ADMIN">Super admin — everything</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 pt-6 text-sm font-medium">
          <input
            type="checkbox"
            name="active"
            defaultChecked={user?.active ?? true}
            className="h-4 w-4 rounded border-input"
          />
          Account active
        </label>
      </div>
      <div className="flex items-center gap-3">
        <SubmitButton>{user ? "Save changes" : "Create user"}</SubmitButton>
        <Link href="/admin/users" className="text-sm font-medium text-muted-foreground hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}

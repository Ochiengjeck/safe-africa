"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteUser } from "@/lib/actions/users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/generated/prisma/client";

const columns: Column<User>[] = [
  { key: "name", header: "Name", value: (u) => u.name, cell: (u) => <span className="font-medium">{u.name}</span> },
  { key: "email", header: "Email", value: (u) => u.email },
  {
    key: "role",
    header: "Role",
    value: (u) => u.role,
    cell: (u) => <Badge variant="secondary">{u.role.replace("_", " ").toLowerCase()}</Badge>,
  },
  { key: "status", header: "Status", value: (u) => (u.active ? "Active" : "Disabled") },
];

export function UsersTable({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  return (
    <DataTable
      rows={users}
      columns={columns}
      rowKey={(u) => u.id}
      rowHref={(u) => `/admin/users/${u.id}`}
      defaultSort={{ key: "name", dir: "asc" }}
      searchPlaceholder="Search name, email…"
      emptyMessage="No users."
      actions={(u) => (
        <>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/users/${u.id}`}>Edit</Link>
          </Button>
          {u.id !== currentUserId && (
            <DeleteButton
              action={deleteUser.bind(null, u.id)}
              resourceLabel={`user ${u.email}`}
              description="They lose CMS access immediately. This cannot be undone — consider deactivating instead."
            />
          )}
        </>
      )}
    />
  );
}

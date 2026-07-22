"use client";

import { useActionState, useState } from "react";
import { saveTeamMember, deleteTeamMember } from "@/lib/actions/team";
import { restoreItem } from "@/lib/actions/trash";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FormError } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { UploadField } from "@/components/upload-field";
import { RichTextEditor } from "@/components/rich-text/editor";
import type { TeamMember } from "@/lib/generated/prisma/client";

export function TeamManager({ members }: { members: TeamMember[] }) {
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [state, action] = useActionState(saveTeamMember, null);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-3">
        {members.length === 0 && <p className="text-sm text-muted-foreground">No team members yet.</p>}
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{member.name}</p>
              <p className="truncate text-sm text-muted-foreground">{member.title}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(member)}>
                Edit
              </Button>
              <DeleteButton
                action={deleteTeamMember.bind(null, member.id)}
                restore={restoreItem.bind(null, "teamMember", member.id)}
                resourceLabel={`team member ${member.name}`}
              />
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{editing ? `Edit ${editing.name}` : "Add team member"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4" key={editing?.id ?? "new"}>
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <FormError state={state} />
            <Field label="Name" name="name" state={state}>
              <Input id="name" name="name" defaultValue={editing?.name} required />
            </Field>
            <Field label="Title / role" name="title" state={state}>
              <Input id="title" name="title" defaultValue={editing?.title} required />
            </Field>
            <Field label="Bio" name="bio" state={state}>
              <RichTextEditor name="bio" defaultValue={editing?.bio ?? ""} />
            </Field>
            <Field label="Display order" name="order" state={state}>
              <Input id="order" name="order" type="number" min={0} defaultValue={editing?.order ?? 0} />
            </Field>
            <UploadField
              name="photo"
              folder="safe-africa/team"
              label="Photo"
              accept="image/*"
              defaultUrl={editing?.photo ?? undefined}
            />
            <div className="flex gap-2">
              <SubmitButton>{editing ? "Save changes" : "Add member"}</SubmitButton>
              {editing && (
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

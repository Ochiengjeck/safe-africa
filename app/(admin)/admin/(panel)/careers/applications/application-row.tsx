"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateApplicationStatus } from "@/lib/actions/careers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Application, ApplicationStatus } from "@/lib/generated/prisma/client";

const STATUSES: ApplicationStatus[] = ["NEW", "REVIEWED", "SHORTLISTED", "REJECTED"];

export function ApplicationRow({
  application,
  vacancyTitle,
  receivedAt,
}: {
  application: Application;
  vacancyTitle: string;
  receivedAt: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">
            {application.name}{" "}
            <Badge variant={application.status === "NEW" ? "default" : "secondary"}>
              {application.status.toLowerCase()}
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {vacancyTitle} · {receivedAt}
          </p>
        </div>
        {application.cvUrl && (
          <Button asChild variant="outline" size="sm">
            <a href={application.cvUrl} target="_blank" rel="noreferrer">
              Download CV
            </a>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {application.email} · {application.phone}
        </p>
        <p className="whitespace-pre-wrap text-sm">{application.coverLetter}</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.filter((status) => status !== application.status).map((status) => (
            <Button
              key={status}
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await updateApplicationStatus(application.id, status);
                  router.refresh();
                })
              }
            >
              Mark {status.toLowerCase()}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import { AccessDenied } from "@/components/admin/access-denied";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Settings — SAFE Africa CMS" };

export default async function AdminSettingsPage() {
  const session = await requireSession();
  if (session.user.role !== "SUPER_ADMIN") {
    return <AccessDenied currentRole={session.user.role} requiredRole="SUPER_ADMIN" feature="Website settings" />;
  }

  const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  const socialLinks = (settings?.socialLinks ?? {}) as Record<string, string>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Website settings</h1>
      <SettingsForm
        defaults={{
          address: settings?.address ?? "",
          poBox: settings?.poBox ?? "",
          phone: settings?.phone ?? "",
          email: settings?.email ?? "",
          linkedin: socialLinks.linkedin ?? "",
          twitter: socialLinks.twitter ?? "",
          facebook: socialLinks.facebook ?? "",
          mapEmbedUrl: settings?.mapEmbedUrl ?? "",
        }}
      />
    </div>
  );
}

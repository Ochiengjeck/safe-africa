import { getSiteSettings } from "@/lib/content";
import { SectionHeading } from "@/components/site/section-heading";
import { ContactForm } from "./contact-form";
import { MapPin, Mail, Phone } from "lucide-react";

export const revalidate = 3600;
export const metadata = {
  title: "Contact Us",
  description: "Get in touch with SAFE Africa Ltd — Greenhouse Mall, Ngong Road, Nairobi, Kenya.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeading
        eyebrow="Contact"
        title="Let's talk"
        intro="Whether you are planning an evaluation, need advisory support, or want to explore a partnership — we'd love to hear from you."
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" aria-hidden="true" />
            <div>
              <p className="font-medium">Office</p>
              <p className="mt-1 text-sm text-muted-foreground">{settings.address}</p>
              {settings.poBox && <p className="mt-1 text-sm text-muted-foreground">{settings.poBox}</p>}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" aria-hidden="true" />
            <div>
              <p className="font-medium">Email</p>
              <a href={`mailto:${settings.email}`} className="mt-1 text-sm text-primary hover:underline">
                {settings.email}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" aria-hidden="true" />
            <div>
              <p className="font-medium">Telephone</p>
              <a
                href={`tel:${settings.phone.replace(/\s/g, "")}`}
                className="mt-1 text-sm text-primary hover:underline"
              >
                {settings.phone}
              </a>
            </div>
          </div>
          {settings.mapEmbedUrl && (
            <iframe
              src={settings.mapEmbedUrl}
              title="SAFE Africa office location"
              className="h-64 w-full rounded-xl border"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-xl font-semibold">Send us a message</h2>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}

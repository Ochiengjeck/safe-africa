import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/content";
import { SiteNav } from "@/components/site/site-nav";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, thematicAreas] = await Promise.all([
    getSiteSettings(),
    prisma.thematicArea.findMany({ orderBy: { order: "asc" }, select: { slug: true, title: true } }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SAFE Africa Ltd",
    legalName: "Smart Agriculture and Food Economics Africa Ltd",
    url: "https://safeafrika.com",
    logo: "https://safeafrika.com/safe-africa-logo.png",
    email: settings.email,
    telephone: settings.phone,
    address: { "@type": "PostalAddress", streetAddress: settings.address, addressCountry: "KE" },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a href="#content" className="skip-link">
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/safe-africa-logo.png" alt="" width={38} height={38} className="rounded-md" />
            <span className="font-display text-lg font-bold leading-tight">
              SAFE <span className="text-brand-orange-deep">Africa</span>
            </span>
          </Link>
          <SiteNav />
        </div>
      </header>

      <div id="content" className="flex-1">
        {children}
      </div>

      <footer className="bg-sidebar text-sidebar-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Image src="/safe-africa-logo.png" alt="" width={40} height={40} className="rounded-md" />
              <p className="font-display text-lg font-bold">SAFE Africa Ltd</p>
            </div>
            <p className="max-w-sm text-sm opacity-80">
              Smart Agriculture and Food Economics Africa Ltd — advancing data-driven insights to
              improve livelihoods across Africa.
            </p>
            <div className="evidence-bars" aria-hidden="true">
              <span /><span /><span /><span />
            </div>
          </div>
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-wider opacity-60">Thematic areas</p>
            <ul className="space-y-2 text-sm">
              {thematicAreas.map((area) => (
                <li key={area.slug}>
                  <Link href={`/thematic-areas/${area.slug}`} className="opacity-85 hover:opacity-100 hover:underline">
                    {area.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4 text-sm">
            <p className="font-mono text-xs uppercase tracking-wider opacity-60">Contact</p>
            <p className="opacity-85">{settings.address}</p>
            {settings.poBox && <p className="opacity-85">{settings.poBox}</p>}
            <p>
              <a href={`mailto:${settings.email}`} className="opacity-85 hover:opacity-100 hover:underline">
                {settings.email}
              </a>
              <br />
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="opacity-85 hover:opacity-100 hover:underline">
                {settings.phone}
              </a>
            </p>
            <ul className="flex gap-4 text-sm">
              {Object.entries(settings.socialLinks)
                .filter(([, url]) => url)
                .map(([network, url]) => (
                  <li key={network}>
                    <a href={url} target="_blank" rel="noreferrer" className="capitalize opacity-85 hover:opacity-100 hover:underline">
                      {network}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="mx-auto max-w-6xl px-4 py-5 text-xs opacity-60">
            © {new Date().getFullYear()} SAFE Africa Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

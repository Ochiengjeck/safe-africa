import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Admin Login — SAFE Africa" };

export default async function LoginPage(props: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await props.searchParams;
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <section className="hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/safe-africa-logo.png" alt="" width={44} height={44} className="rounded-lg" />
          <span className="font-display text-lg font-bold">SAFE Africa</span>
        </Link>
        <div className="max-w-md">
          <span className="evidence-bars" aria-hidden="true" style={{ height: 28 }}>
            <span /><span /><span /><span />
          </span>
          <h1 className="font-display mt-5 text-3xl font-bold leading-snug">
            The content studio behind the evidence.
          </h1>
          <p className="mt-4 text-sm opacity-80">
            Manage projects, publications, vacancies, and every word on safeafrika.com. Changes
            publish to the live site the moment you save.
          </p>
        </div>
        <p className="font-mono text-xs uppercase tracking-widest opacity-50">
          Advancing data-driven insights
        </p>
      </section>

      {/* Form panel */}
      <section className="flex items-center justify-center bg-muted/40 px-4 py-12">
        <div className="w-full max-w-sm space-y-6 rounded-xl border bg-background p-8 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
            <Image src="/safe-africa-logo.png" alt="" width={52} height={52} className="rounded-lg lg:hidden" />
            <div>
              <h2 className="font-display text-xl font-bold">Sign in</h2>
              <p className="mt-1 text-sm text-muted-foreground">Use your SAFE Africa CMS account.</p>
            </div>
          </div>
          <LoginForm callbackUrl={callbackUrl} />
          <p className="text-center text-xs text-muted-foreground lg:text-left">
            Trouble signing in? Contact a site administrator.
          </p>
        </div>
      </section>
    </main>
  );
}

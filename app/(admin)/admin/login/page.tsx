import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata = { title: "Admin Login — SAFE Africa" };

export default async function LoginPage(props: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await props.searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-background p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src="/safe-africa-logo.png" alt="SAFE Africa" width={64} height={64} className="rounded-lg" />
          <div>
            <h1 className="text-lg font-semibold">SAFE Africa CMS</h1>
            <p className="text-sm text-muted-foreground">Sign in to manage the website</p>
          </div>
        </div>
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}

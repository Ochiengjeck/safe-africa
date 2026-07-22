import { PageHero } from "@/components/site/page-hero";
import { TalentPoolForm } from "./talent-pool-form";

export const metadata = {
  title: "Join Our Talent Pool",
  description:
    "Register your professional profile with SAFE Africa and be the first to hear about openings that match your expertise. No CV file needed — build your profile in the form.",
};

export default function TalentPoolPage() {
  return (
    <main>
      <PageHero
        eyebrow="Talent pool"
        title="Join our talent pool"
        intro="Register your profile and we'll notify you whenever a new opening matches your expertise. There's no CV upload — enter your details below and we'll generate a structured CV from them."
      />
      <div className="mx-auto max-w-4xl px-4 py-14">
        <div className="mb-8 rounded-xl border border-brand-blue/30 bg-brand-blue/5 p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Please do not upload a CV file.</strong> Enter your details into the form
          fields — SAFE Africa generates a standardized CV from your entries, which you can preview before submitting.
        </div>
        <TalentPoolForm />
      </div>
    </main>
  );
}

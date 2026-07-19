import { ServiceForm } from "../service-form";

export const metadata = { title: "New Service — SAFE Africa CMS" };

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">New service</h1>
      <ServiceForm />
    </div>
  );
}

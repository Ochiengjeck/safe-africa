import { VacancyForm } from "../vacancy-form";

export const metadata = { title: "New Vacancy — SAFE Africa CMS" };

export default function NewVacancyPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">New vacancy</h1>
      <VacancyForm />
    </div>
  );
}

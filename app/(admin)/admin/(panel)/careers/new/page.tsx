import { VacancyForm } from "../vacancy-form";

export const metadata = { title: "New Vacancy — SAFE Africa CMS" };

export default function NewVacancyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New vacancy</h1>
      <VacancyForm />
    </div>
  );
}

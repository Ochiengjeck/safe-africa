import { AreaForm } from "../area-form";

export const metadata = { title: "New Thematic Area — SAFE Africa CMS" };

export default function NewThematicAreaPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New thematic area</h1>
      <AreaForm />
    </div>
  );
}

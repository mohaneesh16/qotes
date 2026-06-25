import QuotesGrid from "@/components/QuotesGrid";

export const metadata = {
  title: "Browse Quotes — Qotes",
};

export default function QuotesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">Browse Quotes</h1>
        <p className="text-slate-500">Discover quotes across all categories</p>
      </div>
      <QuotesGrid />
    </div>
  );
}

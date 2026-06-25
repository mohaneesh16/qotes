import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getFeaturedQuotes() {
  try {
    return await prisma.quote.findMany({
      take: 3,
      orderBy: { likes: { _count: "desc" } },
      include: {
        _count: { select: { likes: true } },
        user: { select: { name: true } },
      },
    });
  } catch {
    return [];
  }
}

async function getStats() {
  try {
    const [quoteCount, userCount] = await Promise.all([
      prisma.quote.count(),
      prisma.user.count(),
    ]);
    return { quoteCount, userCount };
  } catch {
    return { quoteCount: 0, userCount: 0 };
  }
}

export default async function HomePage() {
  const [featured, stats] = await Promise.all([
    getFeaturedQuotes(),
    getStats(),
  ]);

  return (
    <div className="space-y-16">
      <section className="text-center py-16 space-y-6">
        <h1 className="text-5xl font-bold text-slate-800 tracking-tight">
          Words that{" "}
          <span className="text-blue-600">inspire</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
          Discover, save, and share quotes that move you. Add your own to
          inspire others.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/quotes"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Quotes
          </Link>
        </div>
        {stats.quoteCount > 0 && (
          <p className="text-sm text-slate-400">
            {stats.quoteCount} quotes from {stats.userCount} contributors
          </p>
        )}
      </section>

      {featured.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-slate-700 mb-6">
            Most Liked
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featured.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
              >
                <blockquote className="text-slate-700 font-serif leading-relaxed mb-3">
                  &ldquo;{q.content}&rdquo;
                </blockquote>
                <p className="text-slate-500 text-sm">— {q.author}</p>
                <p className="text-slate-400 text-xs mt-2">
                  {q._count.likes} likes
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {featured.length === 0 && (
        <section className="text-center py-12">
          <div className="bg-white rounded-2xl border border-slate-100 p-12 max-w-md mx-auto">
            <div className="text-5xl mb-4">💬</div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">
              No quotes yet
            </h2>
            <p className="text-slate-500 mb-6">
              Be the first to add an inspiring quote!
            </p>
            <Link
              href="/quotes"
              className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

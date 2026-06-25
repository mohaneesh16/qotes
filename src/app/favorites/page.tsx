"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import QuoteCard from "@/components/QuoteCard";

type Quote = {
  id: string;
  content: string;
  author: string;
  category: string;
  liked: boolean;
  likesCount: number;
  user?: { name: string | null; image: string | null } | null;
  createdAt: string;
};

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => {
        setQuotes(d.quotes ?? []);
        setLoading(false);
      });
  }, [session]);

  if (status === "loading") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔐</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Sign in to see your favorites
        </h1>
        <p className="text-slate-500 mb-6">
          Like quotes to save them here for later.
        </p>
        <button
          onClick={() => signIn()}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">Favorites</h1>
        <p className="text-slate-500">Quotes you&apos;ve liked</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">💔</div>
          <p className="text-xl text-slate-500">No favorites yet</p>
          <p className="text-slate-400 mt-1">
            Browse quotes and hit the heart to save them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quotes.map((q) => (
            <QuoteCard key={q.id} quote={q} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import QuoteCard from "./QuoteCard";
import AddQuoteModal from "./AddQuoteModal";

const CATEGORIES = [
  "All",
  "General",
  "Motivation",
  "Wisdom",
  "Humor",
  "Love",
  "Life",
  "Success",
];

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

export default function QuotesGrid() {
  const { data: session } = useSession();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      ...(category !== "All" ? { category } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    });
    const res = await fetch(`/api/quotes?${params}`);
    const data = await res.json();
    setQuotes(data.quotes);
    setTotalPages(data.pages);
    setLoading(false);
  }, [page, category, debouncedSearch]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search quotes or authors..."
          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {session && (
          <button
            onClick={() => setAddOpen(true)}
            className="sm:hidden px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            + Add Quote
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCategory(c);
              setPage(1);
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === c
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 bg-slate-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg mb-2">No quotes found</p>
          <p className="text-sm">
            {session
              ? "Be the first to add one!"
              : "Sign in to add quotes."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quotes.map((q) => (
            <QuoteCard
              key={q.id}
              quote={q}
              onAuthRequired={() => setAuthModalOpen(true)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {authModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setAuthModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-4">❤️</div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Sign in to save favorites
            </h2>
            <p className="text-slate-500 mb-6">
              Create an account to like quotes and build your collection.
            </p>
            <button
              onClick={() => signIn()}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Sign in with Google or GitHub
            </button>
          </div>
        </div>
      )}

      <AddQuoteModal open={addOpen} onClose={() => { setAddOpen(false); fetchQuotes(); }} />
    </div>
  );
}

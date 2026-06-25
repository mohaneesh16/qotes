"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

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

type Props = {
  quote: Quote;
  onAuthRequired?: () => void;
};

export default function QuoteCard({ quote, onAuthRequired }: Props) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(quote.liked);
  const [likesCount, setLikesCount] = useState(quote.likesCount);
  const [sharing, setSharing] = useState(false);

  async function toggleLike() {
    if (!session) {
      onAuthRequired?.();
      return;
    }
    const res = await fetch(`/api/quotes/${quote.id}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    }
  }

  async function share() {
    const text = `"${quote.content}" — ${quote.author}`;
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({ title: "Quote", text });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
      }
    } finally {
      setSharing(false);
    }
  }

  const categoryColors: Record<string, string> = {
    General: "bg-slate-100 text-slate-600",
    Motivation: "bg-amber-100 text-amber-700",
    Wisdom: "bg-blue-100 text-blue-700",
    Humor: "bg-green-100 text-green-700",
    Love: "bg-rose-100 text-rose-700",
    Life: "bg-purple-100 text-purple-700",
    Success: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow duration-200">
      <span
        className={`self-start text-xs font-medium px-2.5 py-1 rounded-full mb-4 ${
          categoryColors[quote.category] ?? categoryColors.General
        }`}
      >
        {quote.category}
      </span>

      <blockquote className="flex-1 text-slate-800 text-lg leading-relaxed font-serif mb-4">
        &ldquo;{quote.content}&rdquo;
      </blockquote>

      <p className="text-slate-500 text-sm font-medium mb-5">— {quote.author}</p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              liked
                ? "text-rose-500"
                : "text-slate-400 hover:text-rose-400"
            }`}
          >
            <HeartIcon filled={liked} />
            <span>{likesCount}</span>
          </button>

          <button
            onClick={share}
            disabled={sharing}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors"
          >
            <ShareIcon />
            <span>Share</span>
          </button>
        </div>

        {quote.user?.name && (
          <span className="text-xs text-slate-400">by {quote.user.name}</span>
        )}
      </div>
    </div>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
      />
    </svg>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import AddQuoteModal from "./AddQuoteModal";

export default function Navbar() {
  const { data: session } = useSession();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-slate-800 tracking-tight"
          >
            Qotes
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/quotes"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Browse
            </Link>

            {session ? (
              <>
                <Link
                  href="/favorites"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Favorites
                </Link>
                <button
                  onClick={() => setAddOpen(true)}
                  className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add Quote
                </button>
                <div className="flex items-center gap-2 ml-1">
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </nav>

      <AddQuoteModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}

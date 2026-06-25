import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const likes = await prisma.like.findMany({
    where: { userId: session.user.id },
    include: {
      quote: {
        include: {
          user: { select: { name: true, image: true } },
          _count: { select: { likes: true } },
        },
      },
    },
    orderBy: { id: "desc" },
  });

  const quotes = likes.map(({ quote }) => ({
    ...quote,
    liked: true,
    likesCount: quote._count.likes,
    _count: undefined,
  }));

  return NextResponse.json({ quotes });
}

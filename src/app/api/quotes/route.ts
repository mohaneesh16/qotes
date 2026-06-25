import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 12;

  const where = {
    ...(category && category !== "All" ? { category } : {}),
    ...(search
      ? {
          OR: [
            { content: { contains: search } },
            { author: { contains: search } },
          ],
        }
      : {}),
  };

  const userId = session?.user?.id;

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      include: {
        user: { select: { name: true, image: true } },
        ...(userId
          ? { likes: { where: { userId } } }
          : {}),
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.quote.count({ where }),
  ]);

  return NextResponse.json({
    quotes: quotes.map((q) => ({
      ...q,
      liked: userId ? ("likes" in q && Array.isArray(q.likes) ? q.likes.length > 0 : false) : false,
      likesCount: q._count.likes,
      likes: undefined,
      _count: undefined,
    })),
    total,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, author, category } = await req.json();

  if (!content?.trim() || !author?.trim()) {
    return NextResponse.json(
      { error: "Content and author are required" },
      { status: 400 }
    );
  }

  const quote = await prisma.quote.create({
    data: {
      content: content.trim(),
      author: author.trim(),
      category: category ?? "General",
      userId: session.user.id,
    },
  });

  return NextResponse.json(quote, { status: 201 });
}

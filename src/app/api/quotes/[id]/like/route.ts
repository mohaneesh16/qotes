import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: quoteId } = await params;
  const existing = await prisma.like.findUnique({
    where: { userId_quoteId: { userId: session.user.id, quoteId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    const count = await prisma.like.count({ where: { quoteId } });
    return NextResponse.json({ liked: false, likesCount: count });
  }

  await prisma.like.create({
    data: { userId: session.user.id, quoteId },
  });
  const count = await prisma.like.count({ where: { quoteId } });
  return NextResponse.json({ liked: true, likesCount: count });
}

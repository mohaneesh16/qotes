import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();
  if (!idToken) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  // Verify the ID token with Google
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  if (!res.ok) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const info = await res.json();

  // Ensure the token was issued for our app
  if (info.aud !== process.env.AUTH_GOOGLE_ID) {
    return NextResponse.json({ error: "Token audience mismatch" }, { status: 401 });
  }

  const { sub, email, name, picture } = info;

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, name, image: picture, emailVerified: new Date() },
    });
  } else {
    // Keep name/image up to date
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name, image: picture },
    });
  }

  // Find or create the linked Google account
  const existing = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider: "google", providerAccountId: sub } },
  });
  if (!existing) {
    await prisma.account.create({
      data: { userId: user.id, type: "oauth", provider: "google", providerAccountId: sub },
    });
  }

  // Create a new session (30 days)
  const sessionToken = randomBytes(32).toString("hex");
  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({
    token: sessionToken,
    name: user.name ?? "",
    email: user.email ?? "",
    image: user.image ?? null,
  });
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qotes API",
  description: "Backend API for the Qotes mobile app.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

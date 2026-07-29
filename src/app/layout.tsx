import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hackathon Coach — AI-Powered Project Coaching",
  description:
    "Turn your hackathon idea into a scoped build plan, milestone roadmap, pitch outline, and live blocker tracker with AI coaching.",
  keywords: ["hackathon", "coach", "AI", "project planning", "pitch", "roadmap"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}

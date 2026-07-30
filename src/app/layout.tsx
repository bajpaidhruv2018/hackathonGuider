import type { Metadata } from "next";
import "./globals.css";
import { NavigationLayout } from "@/components/NavigationLayout";

export const metadata: Metadata = {
  title: "Hackathon Coach — Mission Control",
  description:
    "AI-powered coaching for high-stakes hackathons. Monitor velocity, untangle architecture, and execute with precision.",
  keywords: ["hackathon", "coach", "AI", "project planning", "mission control"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-background text-on-background font-body-md">
        <NavigationLayout>{children}</NavigationLayout>
      </body>
    </html>
  );
}

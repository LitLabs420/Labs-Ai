import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ScrollProgress } from "@/components/ScrollProgress";
import { BackToTop } from "@/components/BackToTop";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "LitLabs OS – Money-Making AI Command Center",
  description:
    "LitLabs OS: daily content, DM sales, promos, fraud detection + live dashboard for beauty pros.",
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#10b981',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50 antialiased">
        <ScrollProgress />
        <AuthProvider>
          {children}
        </AuthProvider>
        <BackToTop />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

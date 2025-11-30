import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LitLabs AI - Your Personal Marketing Plug",
  description: "AI that books clients for beauty professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}

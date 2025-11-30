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
        <div className="max-w-6xl mx-auto px-4 py-6">
          <header className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center font-bold text-lg">
                🔥
              </div>
              <span className="font-bold text-xl tracking-wide">LitLabs AI</span>
            </div>
            <nav className="flex gap-6 text-sm text-gray-400">
              <a href="/" className="hover:text-white transition">
                Home
              </a>
              <a href="#pricing" className="hover:text-white transition">
                Pricing
              </a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

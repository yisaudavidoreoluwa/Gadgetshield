import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "RupalShield // Anti-Theft Gadget Registry & Verification Platform",
  description: "Monochrome industrial verification, anti-theft registry, digital ownership deeds, and silent technician protection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white min-h-screen flex flex-col selection:bg-white selection:text-black">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}

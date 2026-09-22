import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/lib/supabase/auth-context";
import PwaInstallPrompt from "@/components/pwa/PwaInstallPrompt";

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Gadgetshield // Anti-Theft Gadget Registry & Verification Platform",
  description: "Monochrome industrial verification, anti-theft registry, digital ownership deeds, and lawful asset recovery.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gadgetshield",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col selection:bg-white selection:text-black">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <PwaInstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}

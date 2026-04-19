import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AeroProvider } from "@/components/aero/aero-provider";
import { AeroOrb } from "@/components/aero/aero-orb";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkyPrint — Clean Aviation Intelligence",
  description:
    "Carbon transparency at every altitude. Compare flights by contrail impact, not just CO2.",
  icons: {
    icon: "/planeLogo.png",
    apple: "/planeLogo.png",
  },
  openGraph: {
    title: "SkyPrint — Clean Aviation Intelligence",
    description:
      "Carbon transparency at every altitude. Compare flights by contrail impact, not just CO2.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AeroProvider>
          <Header />
          <main className="min-h-screen flex-1 pt-14">{children}</main>
          <Footer />
          <AeroOrb />
        </AeroProvider>
      </body>
    </html>
  );
}

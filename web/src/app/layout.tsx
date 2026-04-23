import type { Metadata } from "next";
import { Geist, Geist_Mono, Open_Sans, Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const jetbrainsMonoJetbrainsMono = JetBrains_Mono({subsets:['latin'],weight:['100','200','300','400','500','600','700','800'],variable:'--font-jetbrains-mono'});

const poppinsPoppins = Poppins({subsets:['latin'],weight:['100','200','300','400','500','600','700','800','900'],variable:'--font-poppins'});

const openSansOpenSans = Open_Sans({subsets:['latin'],weight:['300','400','500','600','700','800'],variable:'--font-open-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MetaForce - Salesforce AI Agent",
  description: "AI-powered Salesforce configuration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, openSansOpenSans.variable, poppinsPoppins.variable, jetbrainsMonoJetbrainsMono.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

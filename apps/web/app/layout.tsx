import type { Metadata } from "next";
import localFont from "next/font/local";
import { Bangers, Comic_Neue } from "next/font/google";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});
const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
  display: "swap",
});
const comicNeue = Comic_Neue({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-comic-neue",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DexterForms — Beautiful Form Builder",
    template: "%s | DexterForms",
  },
  description:
    "Create beautiful, dynamic forms and collect responses with ease. DexterForms is the modern form builder for creators and teams.",
  keywords: ["form builder", "surveys", "typeform alternative", "form creator"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${bangers.variable} ${comicNeue.variable} antialiased`}>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}

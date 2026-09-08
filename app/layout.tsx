import type { Metadata } from "next";
import { Rubik, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const heading = Rubik({ subsets: ["latin", "cyrillic"], variable: "--font-heading", weight: ["500", "600", "700"] });
const sans = Nunito_Sans({ subsets: ["latin", "cyrillic"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "Marketplace — покупайте и продавайте онлайн", template: "%s | Marketplace" },
  description: "Многопользовательский маркетплейс: тысячи товаров от независимых продавцов.",
  openGraph: {
    type: "website",
    siteName: "Marketplace",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${heading.variable} ${sans.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

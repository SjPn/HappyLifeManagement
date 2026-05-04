import type { Metadata, Viewport } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-onest",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Happy Life — онлайн ОСББ / котеджі",
  description:
    "Новини, заявки, голосування, сусіди. Платформа для українських громад.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ecfdf5" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1110" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      suppressHydrationWarning
      className={`${onest.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full font-sans text-slate-900 dark:text-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

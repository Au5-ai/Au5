import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/shared/providers/query-provider";
import { Toaster } from "@/shared/components/ui";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// const vazirmatn = Vazirmatn({
//   variable: "--font-vazirmatn",
//   subsets: ["arabic", "latin"],
//   display: "swap",
// });

export const metadata: Metadata = {
  title: "Au5.ai",
  description: "Meeting note taker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <QueryProvider>{children}</QueryProvider>

        <Toaster position="top-center" />
      </body>
    </html>
  );
}

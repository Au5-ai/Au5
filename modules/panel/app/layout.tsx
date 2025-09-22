import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/shared/providers/query-provider";
import { Toaster } from "@/shared/components/ui";

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

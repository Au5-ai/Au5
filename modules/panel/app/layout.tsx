import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/shared/providers/query-provider";
import { ConfigProvider } from "@/shared/providers/config-provider";
import { Toaster } from "@/shared/components/ui";

export const metadata: Metadata = {
  title: "Riter",
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
        <ConfigProvider>
          <QueryProvider>{children}</QueryProvider>
        </ConfigProvider>

        <Toaster position="top-center" />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lexa KB - Your AI-Powered Second Brain",
  description: "Upload your notes, documents, and ideas. Get them organized, searchable, and chat with AI about your knowledge.",
  openGraph: {
    title: "Lexa KB - Your AI-Powered Second Brain",
    description: "Upload your notes, documents, and ideas. Get them organized, searchable, and chat with AI about your knowledge.",
    url: "https://app.hellolexa.space",
    siteName: "Lexa KB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lexa KB - Your AI-Powered Second Brain",
    description: "Upload your notes, documents, and ideas. Get them organized, searchable, and chat with AI about your knowledge.",
    site: "@hellolexa_",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EmbedAI — Turn your docs into an AI chatbot",
  description: "Upload documents and create an embeddable AI chatbot in minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {/* Global top loading bar — shows on every page transition */}
          <NextTopLoader
            color="#0ea5e9"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #0ea5e9,0 0 5px #0ea5e9"
          />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
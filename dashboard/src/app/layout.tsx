import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anchor Dashboard",
  description: "LLM Observability Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

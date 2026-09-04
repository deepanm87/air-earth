import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body style={{ margin: 0 }}>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}

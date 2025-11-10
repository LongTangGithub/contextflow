import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ToastProvider } from '@/lib/toast-context';
import ToastContainer from '@/components/ui/ToastContainer';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ContextFlow - Research Copilot for Developers",
  description: "AI-powered research synthesis tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ToastProvider>
          {children}
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}

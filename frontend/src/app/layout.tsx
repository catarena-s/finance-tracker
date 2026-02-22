import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { AppProvider } from "@/contexts/AppContext";
import { ErrorProvider } from "@/components/error";
import { AppLayout } from "@/components/layout";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Трекер личных финансов",
  description: "Трекер личных финансов",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${inter.className} min-h-screen text-slate-900 antialiased`}>
        <ErrorProvider>
          <AppProvider>
            <AppLayout>{children}</AppLayout>
          </AppProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}

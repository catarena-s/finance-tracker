import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { AppProvider } from "@/contexts/AppContext";
import { ErrorProvider } from "@/components/error";
import { AppSidebar, Header, Footer } from "@/components/layout";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Трекер личных финансов",
  description: "Трекер личных финансов",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <ErrorProvider>
          <AppProvider>
            <AppSidebar />
            <div className="flex flex-col min-h-screen pl-14 md:pl-64">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AppProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}

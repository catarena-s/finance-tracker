import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "Трекер личных финансов",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

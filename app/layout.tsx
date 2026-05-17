import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "日本の税金シミュレーター 2025年度版",
  description: "年収・月収に対して所得税・住民税・社会保険料がどのように計算されるかシミュレーションできます。奨学金返済・家賃補助・ボーナスにも対応。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

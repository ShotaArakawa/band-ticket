import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "band-ticket | ライブ取り置き予約",
  description: "個人バンド・インディーズ向けのライブ取り置き・前売り予約サービス",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <Link href="/" className="logo">
            band-ticket
          </Link>
          <nav>
            <Link href="/">公演一覧</Link>
            <Link href="/dashboard">主催者メニュー</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

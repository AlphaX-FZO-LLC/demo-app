import type { Metadata } from "next";
import "./globals.css";
import { Hanken_Grotesk } from 'next/font/google'

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: [
    "100", "200", "300", "400", "500", "600", "700", "800", "900"
  ],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-hanken-grotesk"
})

export const metadata: Metadata = {
  title: "X Pass - AlphaX Secure Digital Identity",
  description: "Secure Digital Identity Authentication",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${hankenGrotesk.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

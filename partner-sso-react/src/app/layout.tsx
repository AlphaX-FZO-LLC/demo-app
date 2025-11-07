import type { Metadata } from 'next'
import './globals.css'
import { Hanken_Grotesk } from 'next/font/google'

export const metadata: Metadata = {
  title: 'Partner Demo - Pass SSO',
  description: 'Pass OAuth2 Integration Demo',
}

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: [
    "100", "200", "300", "400", "500", "600", "700", "800", "900"
  ],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-hanken-grotesk"
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={hankenGrotesk.className}>
      <body>{children}</body>
    </html>
  )
}
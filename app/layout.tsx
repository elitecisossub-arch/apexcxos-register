import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ApexCXOs Events',
  description: 'Event registration portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

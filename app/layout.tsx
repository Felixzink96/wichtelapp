import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Wichtel App - Familie Geschenke-Wichteln',
  description: 'Organisiere dein Familien-Wichteln online mit Spaß und Charme!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}

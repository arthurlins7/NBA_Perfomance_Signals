import type { Metadata } from 'next'
import './globals.css'
import Header from './components/Header'

export const metadata: Metadata = {
  title: 'NBA Performance Signals',
  description: 'Detecção de anomalias de performance na NBA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <div className="pt-12">{children}</div>
      </body>
    </html>
  )
}

// client/app/layout.tsx
import { AuthProvider } from '../components/AuthProvider'
import './globals.css'
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'UnfoldMatch',
  description: 'A progressive dating app that unfolds relationships gradually',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
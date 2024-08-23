import { AuthProvider } from '../components/AuthProvider'
import './globals.css'

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
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
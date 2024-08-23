// client/app/layout.tsx
import { AuthProvider } from '../components/AuthProvider'
import './globals.css'
import Navbar from '../components/Navbar';
import { Toaster } from "@/components/ui/toaster"

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
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
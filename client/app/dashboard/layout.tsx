// app/layout.tsx
'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import '@/styles/globals.css';
import Navbar from '@/components/shared/Navbar';
import { Toaster } from "@/components/ui/toaster"
import { useTheme } from '@/hooks/useTheme';
import { RootLayoutProps } from '@/types/layout';

export default function RootLayout({ children }: RootLayoutProps) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <html lang="en" className={isDarkMode ? 'dark' : ''}>
      <body className={`min-h-screen bg-background font-sans antialiased ${isDarkMode ? 'dark' : ''}`}>
        <AuthProvider>
          <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          <main className="">
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
// client/app/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { AuthProvider } from '../components/AuthProvider'
import './globals.css'
import Navbar from '../components/Navbar';
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Check for user preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // If no preference, check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

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
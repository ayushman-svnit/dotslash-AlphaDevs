import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import React from 'react'

export const metadata: Metadata = {
  title: 'ECO-ROUTE AI | Intelligence Platform',
  description: 'Intelligent Ecological Route Planning & Forest Monitoring',
  manifest: '/manifest.json',
}

export const viewport = {
  themeColor: "#1a2f23",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

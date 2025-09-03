import type { Metadata } from 'next'
import './globals.css'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { AppProvider } from '@/lib/app-context'

// Dynamically import the ToastContainer to reduce initial bundle size
const ToastContainer = dynamic(
  () => import('react-toastify').then((mod) => mod.ToastContainer),
 // Disable server-side rendering for the ToastContainer
)

// Import the CSS for toast once it's loaded
import 'react-toastify/dist/ReactToastify.css'

export const metadata: Metadata = {
  title: 'Dairy App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
          <Suspense fallback={null}>
            <ToastContainer position="top-right" autoClose={3000} />
          </Suspense>
        </AppProvider>
      </body>
    </html>
  )
}

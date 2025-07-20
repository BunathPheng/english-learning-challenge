import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css" // Assuming your global styles are here
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster" // Import Toaster

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "My 2-Month English Learning Challenge",
  description: "Track your daily English learning progress.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
          <Header />
          <main className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">{children}</main>
          <Footer />
        </div>
        <Toaster /> {/* Add Toaster component here */}
      </body>
    </html>
  )
}

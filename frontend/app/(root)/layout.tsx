import React from 'react'
import Navbar from "@/components/navigation/navbar";
import AuthGate from "@/components/AuthGate";
import { SidebarProvider } from "@/components/ui/sidebar";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SidebarProvider>
        <AuthGate>
          <Navbar />
          <main>
            {children}
          </main>
        </AuthGate>
      </SidebarProvider>
    </>
  )
}
export default RootLayout

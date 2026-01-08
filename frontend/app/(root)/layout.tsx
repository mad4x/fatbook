import React from 'react'
import Navbar from "@/components/navigation/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SidebarProvider>
        <Navbar />
        <main>
          {children}
        </main>
      </SidebarProvider>
    </>
  )
}
export default RootLayout

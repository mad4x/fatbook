"use client"

import React from 'react'
import {Button} from "@/components/ui/button";
import Link from "next/link";

const Home = () => {
  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-50 py-10 gap-10">
      
      {/* Il tuo banner di benvenuto originale */}
      <div className="flex flex-col shadow-2xl border bg-white gap-5 py-6 px-8 rounded-2xl items-center">
        <h1 className="text-2xl font-bold">Benvenuto in Fatbook</h1>
        <Link href="/dashboard" className="justify-center items-center">
          <Button className="text-lg px-8 py-5">Entra</Button>
        </Link>
      </div>
    </div>
  )
}
export default Home
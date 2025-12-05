import React from 'react'
import Link from "next/link";
import {Button} from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="flex flex-row justify-between py-5 px-8 bg-gray-800">
      <h1 className="text-xl font-bold text-white">Fat<span className="text-blue-400">Book</span></h1>
      <Link href="">
        <Button>Accedi</Button>
      </Link>
    </nav>
  )
}
export default Navbar

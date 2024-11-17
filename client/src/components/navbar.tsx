'use client'

import React from 'react'
import { Menu,} from 'lucide-react'
import { motion } from 'framer-motion'

import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button'



export default function Navbar() {

  const [isOpen, setIsOpen] = React.useState(false)

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/feature" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
    { name: "My projects", href: "project" },

  ]

 
  return (
    <header className="bg-background border-b overflow-hidden">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          DeployPro
        </Link>
        <div className="flex items-center space-x-4">
          <nav className="hidden md:block">
            <ul className="flex space-x-4">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm font-medium hover:text-primary transition-colors duration-200">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
    
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
              >
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-6">
                  <ul className="space-y-4">
                    {menuItems.map((item) => (
                      <motion.li
                        key={item.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          href={item.href}
                          className="text-sm font-medium hover:text-primary transition-colors duration-200"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </nav>
              </motion.div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
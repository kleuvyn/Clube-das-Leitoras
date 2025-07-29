"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Calendar, Heart, Menu, Gift, Coffee, Library, Vote, Lightbulb, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navigation = [
  { name: "Início", href: "/", icon: BookOpen },
  { name: "Encontros", href: "/encontros", icon: Calendar },
  { name: "Livro do Mês", href: "/livro-do-mes", icon: BookOpen },
  { name: "Votação", href: "/votacao", icon: Vote },
  { name: "Resenhas", href: "/resenhas", icon: Heart },
  { name: "Dicas da Gabi", href: "/dicas", icon: Lightbulb },
  { name: "Eventos", href: "/eventos", icon: Coffee },
  { name: "Sorteios", href: "/sorteios", icon: Gift },
  { name: "Biblioteca", href: "/biblioteca", icon: Library },
  { name: "Empreendedorismo", href: "/empreendedoras", icon: Camera }
]

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-end space-x-0.5">
              <img src="/logo.png" alt="Clube das Leitoras" className="h-10 w-auto" />
            </div>
            <span className="font-bold text-lg text-gray-800">Clube das Leitoras</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive ? "bg-rose-100 text-rose-600" : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-gray-600">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-gradient-to-br from-rose-50 to-purple-50">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <div className="flex items-end space-x-0.5">
                    <div className="h-6 w-1 bg-rose-300 rounded-sm"></div>
                    <div className="h-7 w-1 bg-purple-300 rounded-sm"></div>
                    <div className="h-6 w-1 bg-blue-300 rounded-sm"></div>
                  </div>
                  <span className="font-bold text-lg text-gray-800">Clube das Leitoras</span>
                </div>
              </div>

              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                        isActive ? "bg-white/70 text-rose-600 shadow-sm" : "text-gray-600 hover:bg-white/50"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}

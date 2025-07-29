import Link from "next/link"
import { Heart, BookOpen, Users } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-rose-100 via-purple-100 to-blue-100 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo e Descrição */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <div className="flex items-end space-x-0.5">
                 <img src="/logo.png" alt="Clube das Leitoras" className="h-10 w-auto" />
              </div>
              <span className="font-bold text-lg text-gray-800">Clube das Leitoras</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Uma comunidade apaixonada por livros, onde cada página vira uma nova amizade. 📚✨
            </p>
          </div>

          {/* Links Rápidos */}
          <div className="text-center">
            <h3 className="font-semibold text-gray-800 mb-4">Links Rápidos</h3>
            <div className="space-y-2">
              <Link href="/encontros" className="block text-gray-600 hover:text-rose-600 text-sm transition-colors">
                Próximos Encontros
              </Link>
              <Link
                href="/livro-do-mes"
                className="block text-gray-600 hover:text-purple-600 text-sm transition-colors"
              >
                Livro do Mês
              </Link>
              <Link href="/sorteios" className="block text-gray-600 hover:text-blue-600 text-sm transition-colors">
                Sorteios Ativos
              </Link>
              <Link href="/biblioteca" className="block text-gray-600 hover:text-green-600 text-sm transition-colors">
                Biblioteca Digital
              </Link>
            </div>
          </div>

          {/* Contato */}
          <div className="text-center md:text-right">
            <h3 className="font-semibold text-gray-800 mb-4">Conecte-se</h3>
            <div className="flex justify-center md:justify-end space-x-4 mb-4">
              <div className="w-10 h-10 bg-rose-200 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-rose-600" />
              </div>
              <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm">clubedasleitoras2025@email.com</p>
          </div>
        </div>

        <div className="border-t border-white/50 mt-8 pt-8 text-center">
          <p className="text-gray-600 text-sm">© 2025 Clube das Leitoras. Feito com 💕 para leitoras apaixonadas.</p>
        </div>
      </div>
    </footer>
  )
}

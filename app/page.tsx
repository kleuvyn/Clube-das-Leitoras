import { BookOpen, Calendar, Heart, Star, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="container mx-auto text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <img src="/logo.png" alt="Clube das Leitoras" className=" w-auto" />
              
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            Clube das <span className="text-rose-400">Leitoras</span>
          </h1>
          <p className="text-xl text-purple-600 mb-2">2025</p>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Bem-vindas ao nosso cantinho literário! 📚✨
            <br />
            Aqui celebramos o amor pelos livros, compartilhamos histórias e criamos memórias juntas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-rose-300 hover:bg-rose-400 text-white rounded-full px-8 py-3">
              <Link href="/encontros">
                <Calendar className="mr-2 h-5 w-5" />
                Próximos Encontros
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-purple-300 text-purple-600 hover:bg-purple-50 rounded-full px-8 py-3 bg-transparent"
            >
              <Link href="/livro-do-mes">
                <BookOpen className="mr-2 h-5 w-5" />
                Livro do Mês
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Livro do Mês Destaque */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Card className="max-w-4xl mx-auto bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-rose-100 to-purple-100 text-center py-8">
              <CardTitle className="text-3xl text-gray-800 mb-2">📖 Livro do Mês - Janeiro 2025</CardTitle>
              <CardDescription className="text-lg text-purple-600">
                Nossa escolha especial para começar o ano
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-center">
                  <div className="w-48 h-64 mx-auto bg-gradient-to-br from-blue-200 to-purple-200 rounded-2xl shadow-lg flex items-center justify-center mb-4">
                    <BookOpen className="h-16 w-16 text-white" />
                  </div>
                  <div className="flex justify-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-300 text-yellow-300" />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">"As Sete Maridas de Evelyn Hugo"</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Uma história envolvente sobre amor, ambição e os segredos de uma lenda de Hollywood. Perfeito para
                    começarmos 2025 com uma leitura que nos fará refletir sobre autenticidade e coragem.
                  </p>
                  <div className="flex items-center space-x-4 mb-6">
                    <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-sm">Romance</span>
                    <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm">Drama</span>
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">LGBTQ+</span>
                  </div>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-rose-300 to-purple-300 hover:from-rose-400 hover:to-purple-400 text-white rounded-full"
                  >
                    <Link href="/livro-do-mes">Ver Detalhes e Comentários</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Seções em Destaque */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Explore Nosso Clube ✨</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-200 to-rose-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-800">Encontros</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">Participe dos nossos encontros mensais, presenciais e virtuais</p>
                <Button
                  asChild
                  variant="outline"
                  className="border-rose-300 text-rose-600 hover:bg-rose-50 rounded-full bg-transparent"
                >
                  <Link href="/encontros">Ver Calendário</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-800">Resenhas</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">Compartilhe suas opiniões e descubra novas perspectivas</p>
                <Button
                  asChild
                  variant="outline"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50 rounded-full bg-transparent"
                >
                  <Link href="/resenhas">Ler Resenhas</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-800">Biblioteca</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">Acesse nossa coleção digital de livros e recomendações</p>
                <Button
                  asChild
                  variant="outline"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 rounded-full bg-transparent"
                >
                  <Link href="/biblioteca">Explorar</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-gradient-to-r from-rose-100 via-purple-100 to-blue-100 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Pronta para se juntar a nós? 💕</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Faça parte de uma comunidade apaixonada por livros, onde cada página vira uma nova amizade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-gradient-to-r from-rose-300 to-purple-300 hover:from-rose-400 hover:to-purple-400 text-white rounded-full px-8 py-3"
              >
                <Link href="/sorteios">🎁 Ver Sorteios</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50 rounded-full px-8 py-3 bg-transparent"
              >
                <Link href="/eventos">☕ Eventos Especiais</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

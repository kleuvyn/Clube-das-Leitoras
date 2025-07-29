import { Heart, Star, MessageCircle, Award, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

const resenhas = [
  {
    id: 1,
    nome: "Carolina Mendes",
    avatar: "CM",
    livro: "As Sete Maridas de Evelyn Hugo",
    autor: "Taylor Jenkins Reid",
    nota: 5,
    resenha:
      "Que livro incrível! A narrativa é envolvente do início ao fim. Evelyn é uma personagem complexa e fascinante, e a forma como a autora constrói os relacionamentos é magistral. Me emocionei várias vezes e não conseguia parar de ler. Recomendo demais! 💕",
    data: "2025-01-29",
    curtidas: 23,
    comentarios: 8,
    reacoes: {
      coracao: 15,
      choque: 3,
      risada: 2,
      lagrima: 12,
    },
    destaque: true,
  },
  {
    id: 2,
    nome: "Beatriz Santos",
    avatar: "BS",
    livro: "Circe",
    autor: "Madeline Miller",
    nota: 4,
    resenha:
      "Uma releitura linda da mitologia grega! Madeline Miller tem um talento especial para humanizar os deuses e criar conexões emocionais profundas. Circe é uma protagonista forte e inspiradora. Algumas partes ficaram um pouco lentas para mim, mas no geral foi uma leitura muito prazerosa.",
    data: "2025-01-27",
    curtidas: 18,
    comentarios: 5,
    reacoes: {
      coracao: 12,
      choque: 1,
      risada: 0,
      lagrima: 8,
    },
    destaque: false,
  },
  {
    id: 3,
    nome: "Ana Luiza",
    avatar: "AL",
    livro: "A Biblioteca da Meia-Noite",
    autor: "Matt Haig",
    nota: 5,
    resenha:
      "Este livro chegou na hora certa na minha vida! A premissa é fascinante e a mensagem sobre segundas chances e arrependimentos é muito tocante. Me fez refletir sobre minhas próprias escolhas. Uma leitura que fica na alma! 🌟",
    data: "2025-01-25",
    curtidas: 31,
    comentarios: 12,
    reacoes: {
      coracao: 20,
      choque: 4,
      risada: 1,
      lagrima: 15,
    },
    destaque: false,
  },
  {
    id: 4,
    nome: "Fernanda Costa",
    avatar: "FC",
    livro: "Torto Arado",
    autor: "Itamar Vieira Junior",
    nota: 4,
    resenha:
      "Uma obra poderosa sobre identidade, terra e resistência. A linguagem é poética e envolvente. Aprendi muito sobre a cultura afro-brasileira e me emocionei com a força das personagens femininas. Leitura essencial!",
    data: "2025-01-23",
    curtidas: 16,
    comentarios: 7,
    reacoes: {
      coracao: 11,
      choque: 2,
      risada: 0,
      lagrima: 9,
    },
    destaque: false,
  },
]

export default function ResenhasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">💕 Resenhas e Opiniões</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compartilhe suas impressões e descubra novas perspectivas sobre os livros que amamos.
          </p>
        </div>

        {/* Formulário para Nova Resenha */}
        <section className="mb-16">
          <Card className="max-w-4xl mx-auto bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800 mb-2">✍️ Escreva sua Resenha</CardTitle>
              <CardDescription className="text-gray-600">
                Conte para as outras leitoras o que você achou do livro!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título do Livro</label>
                  <Input
                    placeholder="Digite o título do livro"
                    className="rounded-2xl border-gray-200 focus:border-rose-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Autor(a)</label>
                  <Input
                    placeholder="Nome do autor ou autora"
                    className="rounded-2xl border-gray-200 focus:border-rose-300"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sua Avaliação</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} className="text-gray-300 hover:text-yellow-400 transition-colors">
                      <Star className="h-8 w-8 fill-current" />
                    </button>
                  ))}
                  <span className="ml-4 text-gray-600">Clique nas estrelas para avaliar</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sua Resenha</label>
                <Textarea
                  placeholder="Compartilhe suas impressões sobre o livro... O que mais gostou? O que chamou sua atenção? Recomendaria para outras leitoras?"
                  className="rounded-2xl border-gray-200 focus:border-rose-300"
                  rows={5}
                />
              </div>

              <div className="flex justify-center">
                <Button className="bg-gradient-to-r from-rose-300 to-purple-300 hover:from-rose-400 hover:to-purple-400 text-white rounded-full px-8">
                  Publicar Resenha
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Resenha da Semana */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
            <Award className="mr-3 h-6 w-6 text-yellow-400" />
            Resenha da Semana
          </h2>

          {resenhas
            .filter((r) => r.destaque)
            .map((resenha) => (
              <Card
                key={resenha.id}
                className="max-w-4xl mx-auto bg-gradient-to-r from-yellow-50 to-rose-50 border-2 border-yellow-200 shadow-lg rounded-3xl"
              >
                <CardContent className="p-8">
                  <div className="flex items-start space-x-6">
                    <Avatar className="bg-gradient-to-br from-yellow-200 to-rose-200 w-16 h-16">
                      <AvatarFallback className="text-white font-bold text-lg">{resenha.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="font-bold text-gray-800 text-lg">{resenha.nome}</h3>
                        <Badge className="bg-yellow-200 text-yellow-800 rounded-full">⭐ Resenha da Semana</Badge>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 text-lg">{resenha.livro}</h4>
                        <p className="text-gray-600">{resenha.autor}</p>
                        <div className="flex items-center space-x-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-5 w-5 ${star <= resenha.nota ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                          <span className="ml-2 text-gray-600 font-medium">{resenha.nota}/5</span>
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed mb-6">{resenha.resenha}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-1 text-rose-500 hover:text-rose-600">
                              <span className="text-lg">💧</span>
                              <span className="text-sm">{resenha.reacoes.lagrima}</span>
                            </button>
                            <button className="flex items-center space-x-1 text-blue-500 hover:text-blue-600">
                              <span className="text-lg">🤯</span>
                              <span className="text-sm">{resenha.reacoes.choque}</span>
                            </button>
                            <button className="flex items-center space-x-1 text-yellow-500 hover:text-yellow-600">
                              <span className="text-lg">😂</span>
                              <span className="text-sm">{resenha.reacoes.risada}</span>
                            </button>
                            <button className="flex items-center space-x-1 text-pink-500 hover:text-pink-600">
                              <span className="text-lg">💕</span>
                              <span className="text-sm">{resenha.reacoes.coracao}</span>
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-gray-500 text-sm">
                          <span className="flex items-center">
                            <ThumbsUp className="mr-1 h-4 w-4" />
                            {resenha.curtidas}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="mr-1 h-4 w-4" />
                            {resenha.comentarios}
                          </span>
                          <span>{new Date(resenha.data).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </section>

        {/* Todas as Resenhas */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
            <Heart className="mr-3 h-6 w-6 text-rose-400" />
            Todas as Resenhas
          </h2>

          <div className="space-y-6">
            {resenhas
              .filter((r) => !r.destaque)
              .map((resenha) => (
                <Card
                  key={resenha.id}
                  className="max-w-4xl mx-auto bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="bg-gradient-to-br from-rose-200 to-purple-200">
                        <AvatarFallback className="text-white font-semibold">{resenha.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-800">{resenha.nome}</h3>
                          <span className="text-sm text-gray-500">
                            {new Date(resenha.data).toLocaleDateString("pt-BR")}
                          </span>
                        </div>

                        <div className="mb-3">
                          <h4 className="font-medium text-gray-800">{resenha.livro}</h4>
                          <p className="text-gray-600 text-sm">{resenha.autor}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= resenha.nota ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                            <span className="ml-1 text-gray-600 text-sm">{resenha.nota}/5</span>
                          </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed mb-4">{resenha.resenha}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-1 text-rose-500 hover:text-rose-600 transition-colors">
                              <span className="text-sm">💧</span>
                              <span className="text-xs">{resenha.reacoes.lagrima}</span>
                            </button>
                            <button className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 transition-colors">
                              <span className="text-sm">🤯</span>
                              <span className="text-xs">{resenha.reacoes.choque}</span>
                            </button>
                            <button className="flex items-center space-x-1 text-yellow-500 hover:text-yellow-600 transition-colors">
                              <span className="text-sm">😂</span>
                              <span className="text-xs">{resenha.reacoes.risada}</span>
                            </button>
                            <button className="flex items-center space-x-1 text-pink-500 hover:text-pink-600 transition-colors">
                              <span className="text-sm">💕</span>
                              <span className="text-xs">{resenha.reacoes.coracao}</span>
                            </button>
                          </div>
                          <div className="flex items-center space-x-3 text-gray-500 text-sm">
                            <button className="flex items-center hover:text-rose-500 transition-colors">
                              <ThumbsUp className="mr-1 h-4 w-4" />
                              {resenha.curtidas}
                            </button>
                            <button className="flex items-center hover:text-purple-500 transition-colors">
                              <MessageCircle className="mr-1 h-4 w-4" />
                              {resenha.comentarios}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          <div className="text-center mt-8">
            <Button
              variant="outline"
              className="border-purple-300 text-purple-600 hover:bg-purple-50 rounded-full bg-transparent"
            >
              Carregar Mais Resenhas
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

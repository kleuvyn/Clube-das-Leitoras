import { BookOpen, Star, MessageCircle, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const comentarios = [
  {
    id: 1,
    nome: "Ana Clara",
    avatar: "AC",
    comentario:
      "Estou amando a narrativa! A Evelyn é uma personagem tão complexa e fascinante. Mal posso esperar para discutirmos sobre os relacionamentos dela.",
    data: "2025-01-28",
    curtidas: 12,
  },
  {
    id: 2,
    nome: "Mariana S.",
    avatar: "MS",
    comentario:
      "Já estou na metade e que reviravolta! Não esperava por essa revelação. Taylor Jenkins Reid realmente sabe como prender o leitor.",
    data: "2025-01-27",
    curtidas: 8,
  },
  {
    id: 3,
    nome: "Júlia Mendes",
    avatar: "JM",
    comentario:
      "Alguém mais está se emocionando com a história? Estou completamente envolvida com os personagens. Que escolha perfeita para janeiro! 💕",
    data: "2025-01-26",
    curtidas: 15,
  },
]

export default function LivroDoMesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">📖 Livro do Mês</h1>
          <p className="text-lg text-gray-600">Janeiro 2025</p>
        </div>

        {/* Livro Principal */}
        <div className="max-w-6xl mx-auto mb-16">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Capa do Livro */}
                <div className="text-center">
                  <div className="w-80 h-96 mx-auto bg-gradient-to-br from-blue-200 via-purple-200 to-rose-200 rounded-3xl shadow-2xl flex items-center justify-center mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-300/20 to-purple-300/20"></div>
                    <BookOpen className="h-24 w-24 text-white relative z-10" />
                  </div>

                  {/* Avaliação */}
                  <div className="flex justify-center items-center space-x-2 mb-4">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-6 w-6 fill-yellow-300 text-yellow-300" />
                      ))}
                    </div>
                    <span className="text-gray-600 font-medium">4.8/5</span>
                    <span className="text-gray-500">(47 avaliações)</span>
                  </div>
                </div>

                {/* Informações do Livro */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">As Sete Maridas de Evelyn Hugo</h2>
                  <p className="text-xl text-purple-600 mb-6">Taylor Jenkins Reid</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-sm">Romance</span>
                    <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm">Drama</span>
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">LGBTQ+</span>
                    <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm">Hollywood</span>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Sinopse</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Evelyn Hugo é uma lenda de Hollywood que finalmente decide contar sua história. Mas quando escolhe
                      uma jornalista desconhecida para escrever sua biografia, ninguém consegue entender os motivos.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      Ao longo de uma semana, Evelyn revela sua vida ambiciosa, repleta de amores proibidos, segredos
                      devastadores e uma amizade que definiu sua existência. Uma história sobre o preço da fama e o
                      poder da verdade.
                    </p>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Por que foi escolhido?</h3>
                    <div className="bg-gradient-to-r from-rose-100 to-purple-100 rounded-2xl p-6">
                      <p className="text-gray-700 leading-relaxed">
                        "Escolhemos este livro para começar 2025 porque ele nos convida a refletir sobre autenticidade,
                        coragem e o poder de sermos verdadeiras conosco mesmas. A narrativa envolvente e os temas
                        profundos prometem discussões ricas e significativas."
                        <br />
                        <br />
                        <span className="text-purple-600 font-medium">- Coordenação do Clube</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="bg-gradient-to-r from-rose-300 to-purple-300 hover:from-rose-400 hover:to-purple-400 text-white rounded-full flex-1">
                      📚 Baixar PDF
                    </Button>
                    <Button
                      variant="outline"
                      className="border-purple-300 text-purple-600 hover:bg-purple-50 rounded-full flex-1 bg-transparent"
                    >
                      📱 Baixar ePub
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Comentários */}
        <section className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
            <MessageCircle className="mr-3 h-6 w-6 text-rose-400" />
            Comentários das Leitoras
          </h2>

          {/* Formulário para Novo Comentário */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl mb-8">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Compartilhe sua opinião</CardTitle>
              <CardDescription>Como está sendo sua experiência com o livro?</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Escreva aqui seus pensamentos sobre o livro... (sem spoilers, por favor! 😊)"
                className="mb-4 rounded-2xl border-gray-200 focus:border-rose-300"
                rows={4}
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-600">Contém spoilers</span>
                  </label>
                </div>
                <Button className="bg-gradient-to-r from-rose-300 to-purple-300 hover:from-rose-400 hover:to-purple-400 text-white rounded-full">
                  Publicar Comentário
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Comentários */}
          <div className="space-y-6">
            {comentarios.map((comentario) => (
              <Card key={comentario.id} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="bg-gradient-to-br from-rose-200 to-purple-200">
                      <AvatarFallback className="text-white font-semibold">{comentario.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-800">{comentario.nome}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(comentario.data).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed mb-4">{comentario.comentario}</p>
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-2 text-gray-500 hover:text-rose-500 transition-colors">
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">{comentario.curtidas}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-500 hover:text-purple-500 transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm">Responder</span>
                        </button>
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
              Ver Mais Comentários
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

import { Lightbulb, BookOpen, Film, Tv, Coffee, Heart, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const dicasRecentes = [
  {
    id: 1,
    tipo: "livro",
    titulo: "Para quem amou Evelyn Hugo",
    conteudo:
      "Se você se emocionou com a história da Evelyn, recomendo muito 'Daisy Jones & The Six' da mesma autora! É sobre uma banda de rock dos anos 70 e tem a mesma pegada envolvente e personagens complexos. 🎸✨",
    categoria: "Recomendação Literária",
    data: "2025-01-30",
    curtidas: 34,
  },
  {
    id: 2,
    tipo: "habito",
    titulo: "Ritual de Leitura Matinal",
    conteudo:
      "Meninas, descobri que ler 15 minutinhos toda manhã com um chá quentinho mudou completamente meu dia! Comecei com esse hábito em janeiro e já li 2 livros a mais do que o normal. A dica é escolher um cantinho especial e deixar o livro sempre à vista. ☕📚",
    categoria: "Hábitos de Leitura",
    data: "2025-01-28",
    curtidas: 28,
  },
  {
    id: 3,
    tipo: "serie",
    titulo: "Adaptação Imperdível",
    conteudo:
      "Quem leu 'O Conto da Aia' precisa assistir a série! A adaptação é fiel ao livro e expande a história de forma brilhante. Elisabeth Moss está perfeita como June. Preparem os lencinhos! 📺💔",
    categoria: "Filme & Série",
    data: "2025-01-26",
    curtidas: 19,
  },
  {
    id: 4,
    tipo: "livro",
    titulo: "Leitura Leve para o Verão",
    conteudo:
      "Para quem quer algo mais descontraído neste calor, 'Beach Read' da Emily Henry é perfeito! Romance contemporâneo, divertido e com uma protagonista escritora que é muito cativante. Ideal para ler na praia ou na rede! 🏖️💕",
    categoria: "Recomendação Literária",
    data: "2025-01-24",
    curtidas: 42,
  },
  {
    id: 5,
    tipo: "dica",
    titulo: "Organizando a TBR",
    conteudo:
      "Dica de organização: criei uma planilha colorida com minha TBR (To Be Read) dividida por gêneros e humor. Verde para quando quero algo leve, azul para reflexivo, rosa para romance... Assim sempre sei o que ler dependendo do meu estado de espírito! 🌈",
    categoria: "Organização",
    data: "2025-01-22",
    curtidas: 31,
  },
  {
    id: 6,
    tipo: "filme",
    titulo: "Clássico Redescoberto",
    conteudo:
      "Assistam 'Pequenas Mulheres' (2019) da Greta Gerwig! A direção é sensível e a fotografia é de tirar o fôlego. Mesmo quem já conhece a história vai se emocionar. Saoirse Ronan como Jo é simplesmente perfeita! 🎬✨",
    categoria: "Filme & Série",
    data: "2025-01-20",
    curtidas: 25,
  },
]

const categorias = [
  { nome: "Recomendação Literária", cor: "bg-rose-100 text-rose-600", icon: BookOpen },
  { nome: "Hábitos de Leitura", cor: "bg-purple-100 text-purple-600", icon: Coffee },
  { nome: "Filme & Série", cor: "bg-blue-100 text-blue-600", icon: Film },
  { nome: "Organização", cor: "bg-green-100 text-green-600", icon: Sparkles },
]

function getIconForTipo(tipo: string) {
  switch (tipo) {
    case "livro":
      return BookOpen
    case "filme":
      return Film
    case "serie":
      return Tv
    case "habito":
      return Coffee
    case "dica":
      return Lightbulb
    default:
      return Heart
  }
}

export default function DicasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">💡 Dicas da Gabi</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Recomendações especiais, dicas de leitura e descobertas literárias para enriquecer nossa jornada juntas.
          </p>
        </div>

        {/* Perfil da Gabi */}
        <section className="mb-16">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-rose-100 via-purple-100 to-blue-100 border-0 shadow-lg rounded-3xl">
            <CardContent className="p-8">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-rose-300 to-purple-300 rounded-full flex items-center justify-center">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Olá, leitoras! 👋</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Sou a Mariana, fundadora do Clube das Leitoras! Aqui compartilho minhas descobertas literárias,
                    dicas de organização e tudo que pode tornar nossa experiência de leitura ainda mais especial. Sempre
                    com muito carinho para vocês! 💕
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Filtros por Categoria */}
        <section className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-full cursor-pointer">
              Todas as Dicas
            </Badge>
            {categorias.map((categoria) => {
              const Icon = categoria.icon
              return (
                <Badge
                  key={categoria.nome}
                  className={`${categoria.cor} hover:opacity-80 px-4 py-2 rounded-full cursor-pointer flex items-center space-x-2`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{categoria.nome}</span>
                </Badge>
              )
            })}
          </div>
        </section>

        {/* Dicas Recentes */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
            <Sparkles className="mr-3 h-6 w-6 text-yellow-400" />
            Dicas Recentes
          </h2>

          <div className="grid gap-8">
            {dicasRecentes.map((dica) => {
              const Icon = getIconForTipo(dica.tipo)
              const categoria = categorias.find((c) => c.nome === dica.categoria)

              return (
                <Card
                  key={dica.id}
                  className="max-w-4xl mx-auto bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-rose-200 to-purple-200 rounded-full flex items-center justify-center">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-gray-800 mb-2">{dica.titulo}</CardTitle>
                          <div className="flex items-center space-x-3">
                            {categoria && (
                              <Badge className={`${categoria.cor} rounded-full text-xs`}>{dica.categoria}</Badge>
                            )}
                            <span className="text-sm text-gray-500">
                              {new Date(dica.data).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Heart className="h-5 w-5" />
                        <span className="text-sm">{dica.curtidas}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed text-lg">{dica.conteudo}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-16">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-rose-100 to-purple-100 border-0 shadow-lg rounded-3xl">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Tem alguma sugestão? 💌</h3>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                Adoraria saber que tipo de dicas vocês gostariam de ver por aqui! Mandem suas sugestões e vou preparar
                conteúdos especiais para vocês.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="bg-white/70 rounded-2xl px-6 py-3 text-gray-700">📧 clubedasleitoras2025@email.com</div>
                <div className="bg-white/70 rounded-2xl px-6 py-3 text-gray-700">💬 Comentem nos posts!</div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

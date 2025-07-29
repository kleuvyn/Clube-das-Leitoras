import { Vote, TrendingUp, Clock, Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const votacaoAtual = {
  titulo: "Escolha do Livro de Março 2025",
  descricao: "Vote no próximo livro que leremos juntas em março!",
  dataLimite: "2025-02-28",
  totalVotos: 156,
  opcoes: [
    {
      id: 1,
      titulo: "Circe",
      autor: "Madeline Miller",
      votos: 67,
      porcentagem: 43,
      genero: "Mitologia/Fantasia",
    },
    {
      id: 2,
      titulo: "Klara e o Sol",
      autor: "Kazuo Ishiguro",
      votos: 45,
      porcentagem: 29,
      genero: "Ficção Científica",
    },
    {
      id: 3,
      titulo: "A Canção de Aquiles",
      autor: "Madeline Miller",
      votos: 32,
      porcentagem: 21,
      genero: "Mitologia/Romance",
    },
    {
      id: 4,
      titulo: "O Conto da Aia",
      autor: "Margaret Atwood",
      votos: 12,
      porcentagem: 7,
      genero: "Distopia",
    },
  ],
}

const historicoVotacoes = [
  {
    mes: "Fevereiro 2025",
    vencedor: "As Sete Maridas de Evelyn Hugo",
    autor: "Taylor Jenkins Reid",
    totalVotos: 142,
    porcentagemVencedor: 38,
  },
  {
    mes: "Janeiro 2025",
    vencedor: "Torto Arado",
    autor: "Itamar Vieira Junior",
    totalVotos: 128,
    porcentagemVencedor: 45,
  },
  {
    mes: "Dezembro 2024",
    vencedor: "A Biblioteca da Meia-Noite",
    autor: "Matt Haig",
    totalVotos: 134,
    porcentagemVencedor: 41,
  },
]

export default function VotacaoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🗳️ Votação do Clube</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sua voz importa! Participe da escolha dos próximos livros e ajude a moldar nossa jornada literária.
          </p>
        </div>

        {/* Votação Atual */}
        <section className="mb-16">
          <Card className="max-w-4xl mx-auto bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-rose-100 to-purple-100 text-center py-8">
              <CardTitle className="text-2xl text-gray-800 mb-2">{votacaoAtual.titulo}</CardTitle>
              <CardDescription className="text-lg text-purple-600 mb-4">{votacaoAtual.descricao}</CardDescription>
              <div className="flex justify-center items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Termina em {new Date(votacaoAtual.dataLimite).toLocaleDateString("pt-BR")}
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  {votacaoAtual.totalVotos} votos
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {votacaoAtual.opcoes.map((opcao) => (
                  <div
                    key={opcao.id}
                    className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{opcao.titulo}</h3>
                        <p className="text-gray-600">{opcao.autor}</p>
                        <span className="inline-block bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs mt-2">
                          {opcao.genero}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">{opcao.porcentagem}%</div>
                        <div className="text-sm text-gray-500">{opcao.votos} votos</div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <Progress value={opcao.porcentagem} className="h-3 rounded-full" />
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-rose-300 to-purple-300 hover:from-rose-400 hover:to-purple-400 text-white rounded-full"
                      variant={opcao.id === 1 ? "default" : "outline"}
                    >
                      {opcao.id === 1 ? "✓ Seu Voto" : "Votar neste Livro"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Formulário de Sugestão */}
        <section className="mb-16">
          <Card className="max-w-4xl mx-auto bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800 flex items-center justify-center">
                <Plus className="mr-3 h-6 w-6 text-rose-400" />
                Sugira um Livro
              </CardTitle>
              <CardDescription className="text-gray-600">
                Tem alguma sugestão para as próximas votações? Compartilhe conosco!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gênero</label>
                  <Input
                    placeholder="Ex: Romance, Fantasia, Ficção..."
                    className="rounded-2xl border-gray-200 focus:border-rose-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seu Nome</label>
                  <Input
                    placeholder="Como você gostaria de ser creditada?"
                    className="rounded-2xl border-gray-200 focus:border-rose-300"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Por que você recomenda este livro?
                </label>
                <Textarea
                  placeholder="Conte-nos por que este livro seria uma boa escolha para o clube..."
                  className="rounded-2xl border-gray-200 focus:border-rose-300"
                  rows={4}
                />
              </div>
              <div className="mt-6 text-center">
                <Button className="bg-gradient-to-r from-rose-300 to-purple-300 hover:from-rose-400 hover:to-purple-400 text-white rounded-full px-8">
                  Enviar Sugestão
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Histórico de Votações */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
            <TrendingUp className="mr-3 h-6 w-6 text-purple-400" />
            Histórico de Votações
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {historicoVotacoes.map((votacao, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg text-gray-800">{votacao.mes}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4">
                    <div className="w-16 h-20 bg-gradient-to-br from-blue-200 to-purple-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <Vote className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{votacao.vencedor}</h3>
                  <p className="text-gray-600 text-sm mb-3">{votacao.autor}</p>
                  <div className="text-sm text-gray-500">
                    <p>{votacao.porcentagemVencedor}% dos votos</p>
                    <p>{votacao.totalVotos} participantes</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

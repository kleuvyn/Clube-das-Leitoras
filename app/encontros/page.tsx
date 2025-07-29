import { Calendar, MapPin, Users, Video, Clock, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const encontros = [
  {
    id: 1,
    titulo: "Discussão: As Sete Maridas de Evelyn Hugo",
    data: "2025-02-15",
    hora: "19:00",
    tipo: "virtual",
    participantes: 24,
    status: "confirmado",
    descricao:
      "Vamos conversar sobre os temas principais do livro e compartilhar nossas impressões sobre a protagonista.",
  },
  {
    id: 2,
    titulo: "Café Literário - Encontro Presencial",
    data: "2025-02-22",
    hora: "15:00",
    tipo: "presencial",
    local: "Café da Esquina - Centro",
    participantes: 12,
    status: "vagas-limitadas",
    descricao: "Um encontro aconchegante para conversar sobre nossas leituras atuais em um ambiente descontraído.",
  },
  {
    id: 3,
    titulo: "Escolha do Livro de Março",
    data: "2025-02-28",
    hora: "20:00",
    tipo: "virtual",
    participantes: 18,
    status: "inscricoes-abertas",
    descricao: "Sessão especial para votarmos no próximo livro do mês e discutirmos as opções.",
  },
]

const encontrosPassados = [
  {
    titulo: "Discussão: Torto Arado",
    data: "2025-01-18",
    resumo: "Uma conversa profunda sobre identidade, terra e resistência. Participação de 28 leitoras.",
    destaques: [
      "Análise dos personagens principais",
      "Discussão sobre realismo mágico",
      "Conexões com a realidade brasileira",
    ],
  },
  {
    titulo: "Café Literário de Janeiro",
    data: "2025-01-25",
    resumo: "Primeiro encontro presencial do ano com muito café, doces e conversas literárias.",
    destaques: ["Troca de livros", "Metas de leitura 2025", "Planejamento dos encontros"],
  },
]

export default function EncontrosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">📅 Encontros do Clube</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Participe dos nossos encontros mensais, onde compartilhamos ideias, fazemos novas amizades e celebramos
            nossa paixão pela leitura.
          </p>
        </div>

        {/* Próximos Encontros */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
            <Calendar className="mr-3 h-6 w-6 text-rose-400" />
            Próximos Encontros
          </h2>

          <div className="grid gap-6">
            {encontros.map((encontro) => (
              <Card
                key={encontro.id}
                className="bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <CardHeader className="bg-gradient-to-r from-rose-100 to-purple-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-xl text-gray-800 mb-2">{encontro.titulo}</CardTitle>
                      <CardDescription className="text-gray-600">{encontro.descricao}</CardDescription>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <Badge
                        variant={
                          encontro.status === "confirmado"
                            ? "default"
                            : encontro.status === "vagas-limitadas"
                              ? "destructive"
                              : "secondary"
                        }
                        className="rounded-full"
                      >
                        {encontro.status === "confirmado" && "Confirmado"}
                        {encontro.status === "vagas-limitadas" && "Vagas Limitadas"}
                        {encontro.status === "inscricoes-abertas" && "Inscrições Abertas"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="mr-3 h-5 w-5 text-rose-400" />
                        <span>
                          {new Date(encontro.data).toLocaleDateString("pt-BR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="mr-3 h-5 w-5 text-purple-400" />
                        <span>{encontro.hora}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        {encontro.tipo === "virtual" ? (
                          <>
                            <Video className="mr-3 h-5 w-5 text-blue-400" />
                            <span>Encontro Virtual (Zoom)</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="mr-3 h-5 w-5 text-green-400" />
                            <span>{encontro.local}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="mr-3 h-5 w-5 text-yellow-400" />
                        <span>{encontro.participantes} participantes confirmadas</span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <Button className="bg-gradient-to-r from-rose-300 to-purple-300 hover:from-rose-400 hover:to-purple-400 text-white rounded-full mb-3">
                        {encontro.tipo === "virtual" ? "Entrar no Zoom" : "Confirmar Presença"}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-300 text-gray-600 hover:bg-gray-50 rounded-full bg-transparent"
                      >
                        Adicionar ao Calendário
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Arquivo de Encontros Passados */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
            <ChevronRight className="mr-3 h-6 w-6 text-purple-400" />
            Arquivo de Encontros
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {encontrosPassados.map((encontro, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">{encontro.titulo}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {new Date(encontro.data).toLocaleDateString("pt-BR")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{encontro.resumo}</p>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Destaques:</h4>
                    <ul className="space-y-1">
                      {encontro.destaques.map((destaque, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-rose-300 rounded-full mr-2"></span>
                          {destaque}
                        </li>
                      ))}
                    </ul>
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

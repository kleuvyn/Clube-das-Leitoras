import { Navigation } from "@/components/navigation"
import { Gift, History } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

export default function SorteiosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      <main className="flex-1 py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">🎁 Sorteios do Clube</h1>
            <p className="text-xl text-gray-600">Participe e concorra a prêmios literários incríveis!</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="bg-white rounded-xl shadow-lg border-none p-6">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Gift className="h-6 w-6 text-pastel-pink" /> Sorteio Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Concorra a um Kit de Leitura Premium!</h3>
                <p className="text-gray-700 text-base">
                  Prêmio: Um exemplar do livro do mês autografado, um marcador de página exclusivo e uma caneca temática
                  do clube.
                </p>
                <Image
                  src="/placeholder.svg?height=200&width=300"
                  width={300}
                  height={200}
                  alt="Kit de Leitura"
                  className="rounded-lg object-cover w-full h-auto shadow-sm my-4"
                />
                <p className="text-gray-600 text-sm">Regras:</p>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                  <li>Ser membro ativo do Clube das Leitoras.</li>
                  <li>Ter participado de pelo menos um encontro no último mês.</li>
                  <li>Preencher o formulário de inscrição abaixo até 28/02/2025.</li>
                </ul>
                <form className="space-y-3 mt-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-700">
                      Seu Nome Completo
                    </Label>
                    <Input
                      id="name"
                      placeholder="Nome Sobrenome"
                      className="rounded-lg border-pastel-lavender/50 focus:border-pastel-lavender focus:ring-pastel-lavender"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-700">
                      Seu E-mail
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      placeholder="seuemail@exemplo.com"
                      className="rounded-lg border-pastel-lavender/50 focus:border-pastel-lavender focus:ring-pastel-lavender"
                    />
                  </div>
                  <Button className="w-full bg-pastel-pink text-white hover:bg-pastel-pink/90 rounded-full shadow-md mt-4">
                    Inscrever-se no Sorteio
                  </Button>
                </form>
                <p className="text-gray-600 text-center mt-4">*A funcionalidade de inscrição será ativada em breve!*</p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-lg border-none p-6">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <History className="h-6 w-6 text-pastel-lavender" /> Histórico de Sorteios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-pastel-lavender/10 rounded-lg">
                  <h3 className="font-semibold text-gray-800">Dezembro 2024 - Vencedora: Clara S.</h3>
                  <p className="text-gray-700 text-sm mt-1">Prêmio: Box de livros de fantasia</p>
                </div>
                <div className="p-4 bg-pastel-lavender/10 rounded-lg">
                  <h3 className="font-semibold text-gray-800">Novembro 2024 - Vencedora: Fernanda L.</h3>
                  <p className="text-gray-700 text-sm mt-1">Prêmio: Vale-presente em livraria</p>
                </div>
                <p className="text-gray-600 text-center mt-4">
                  *Confira quem foram as sortudas dos sorteios anteriores!*
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

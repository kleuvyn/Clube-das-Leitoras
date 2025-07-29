import { HeartHandshake, Instagram, MessageCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function EmpreendedorasPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      <main className="flex-1 py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">🌸 Mulheres que Inspiram</h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Um espaço dedicado às empreendedoras do Clube das Leitoras. Conheça os projetos incríveis das nossas leitoras!
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Empreendedora 1 */}
            <Card className="bg-white rounded-xl shadow-lg border-none p-6">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <HeartHandshake className="h-6 w-6 text-purple-300" />
                  Marcadores Literários Personalizados
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row gap-4">
                <Image
                  src="/empreendedora1.jpg"
                  width={200}
                  height={200}
                  alt="Marcadores"
                  className="rounded-lg object-cover shadow-md"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-gray-700">
                      Produzidos artesanalmente com temas variados, perfeitos para presentear ou colecionar.
                    </p>
                    <p className="text-pink-500 font-semibold mt-2">R$ 8,00 a unidade</p>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" className="rounded-full border-pink-300 text-pink-500 hover:bg-pink-100/30" asChild>
                      <a
                        href="https://www.instagram.com/reel/DKaQgb7pYbu/?igsh=Mmc0cnpjcGhpaXYx"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver no Instagram"
                      >
                        <Instagram className="w-4 h-4 mr-1" /> Instagram
                      </a>
                    </Button>
                    <Button variant="outline" className="rounded-full border-purple-300 text-purple-500 hover:bg-purple-100/30" asChild>
                      <a
                        href="https://wa.me/5599999999999"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir no WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Empreendedora 2 */}
            <Card className="bg-white rounded-xl shadow-lg border-none p-6">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <HeartHandshake className="h-6 w-6 text-purple-300" />
                  Velas Aromáticas Literárias
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row gap-4">
                <Image
                  src="/empreendedora2.jpg"
                  width={200}
                  height={200}
                  alt="Velas Literárias"
                  className="rounded-lg object-cover shadow-md"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-gray-700">
                      Feitas com cera vegetal, cada vela vem com um aroma inspirado em personagens e livros famosos.
                    </p>
                    <p className="text-pink-500 font-semibold mt-2">R$ 35,00</p>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" className="rounded-full border-pink-300 text-pink-500 hover:bg-pink-100/30" asChild>
                      <a
                        href="https://www.instagram.com/reel/DKaQgb7pYbu/?igsh=Mmc0cnpjcGhpaXYx"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver no Instagram"
                      >
                        <Instagram className="w-4 h-4 mr-1" /> Instagram
                      </a>
                    </Button>
                    <Button variant="outline" className="rounded-full border-purple-300 text-purple-500 hover:bg-purple-100/30" asChild>
                      <a
                        href="https://wa.me/5598888888888"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir no WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

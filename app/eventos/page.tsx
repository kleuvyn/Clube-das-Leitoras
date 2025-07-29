import { Navigation } from "@/components/navigation"
import { CalendarCheck, Camera } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function EventosPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pastel-pink/10 to-pastel-lavender/10">
      <main className="flex-1 py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">✨ Eventos Especiais</h1>
            <p className="text-xl text-gray-600">Momentos únicos para celebrar nossa paixão pela leitura!</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="bg-white rounded-xl shadow-lg border-none p-6">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <CalendarCheck className="h-6 w-6 text-pastel-pink" /> Próximos Eventos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-pastel-pink/10 rounded-lg">
                  <h3 className="font-semibold text-gray-800">Café Literário de Outono</h3>
                  <p className="text-gray-700 text-sm mt-1">Data: 10 de Março de 2025 | Local: Cafeteria Aconchego</p>
                  <p className="text-gray-700 text-sm mt-1">Tema: Poesia e Chá</p>
                  <Button className="mt-3 bg-pastel-pink text-white hover:bg-pastel-pink/90 rounded-full shadow-md">
                    Confirmar Presença (RSVP)
                  </Button>
                </div>
                <div className="p-4 bg-pastel-pink/10 rounded-lg">
                  <h3 className="font-semibold text-gray-800">Noite de Contação de Histórias</h3>
                  <p className="text-gray-700 text-sm mt-1">Data: 22 de Abril de 2025 | Local: Online (Zoom)</p>
                  <p className="text-gray-700 text-sm mt-1">Tema: Contos de Mistério</p>
                  <Button className="mt-3 bg-pastel-pink text-white hover:bg-pastel-pink/90 rounded-full shadow-md">
                    Inscrever-se
                  </Button>
                </div>
                <p className="text-gray-600 text-center mt-4">*Fique atenta para mais eventos incríveis em breve!*</p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-lg border-none p-6">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Camera className="h-6 w-6 text-pastel-lavender" /> Galeria de Fotos
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Image
                  src="/placeholder.svg?height=150&width=150"
                  width={150}
                  height={150}
                  alt="Encontro do Clube"
                  className="rounded-lg object-cover w-full h-auto shadow-sm"
                />
                <Image
                  src="/placeholder.svg?height=150&width=150"
                  width={150}
                  height={150}
                  alt="Leitoras Juntas"
                  className="rounded-lg object-cover w-full h-auto shadow-sm"
                />
                <Image
                  src="/placeholder.svg?height=150&width=150"
                  width={150}
                  height={150}
                  alt="Café Literário"
                  className="rounded-lg object-cover w-full h-auto shadow-sm"
                />
                <Image
                  src="/placeholder.svg?height=150&width=150"
                  width={150}
                  height={150}
                  alt="Grupo de Discussão"
                  className="rounded-lg object-cover w-full h-auto shadow-sm"
                />
                <p className="text-gray-600 text-center col-span-full mt-4">
                  *Reviva os melhores momentos dos nossos eventos!*
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

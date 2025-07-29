import { List, Search, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function BibliotecaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      <main className="flex-1 py-12 md:py-24 lg:py-32" 
>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">📚 Biblioteca Digital do Clube</h1>
            <p className="text-xl text-gray-600">Explore nossa coleção de livros lidos e recomendados!</p>
          </div>

          <div className="space-y-8">
            <Card className="bg-gradient-to-r from-rose-100 via-purple-100 to-blue-100
">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Search className="h-6 w-6 text-pastel-pink" /> Buscar na Biblioteca
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="text"
                  placeholder="Buscar por título, autor ou tema..."
                  className="flex-1 rounded-lg border-pastel-lavender/50 focus:border-pastel-lavender focus:ring-pastel-lavender"
                />
                <Button className="bg-pastel-pink text-white hover:bg-pastel-pink/90 rounded-full shadow-md">
                  Buscar
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-lg border-none p-6">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <List className="h-6 w-6 text-pastel-lavender" /> Livros Lidos e Recomendados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">Janeiro 2025</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-pastel-lavender/10 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">As Sete Maridas de Evelyn Hugo</p>
                        <p className="text-gray-600 text-sm">Taylor Jenkins Reid</p>
                      </div>
                      <Link href="#" className="text-pastel-lavender hover:underline flex items-center gap-1">
                        <Download className="h-4 w-4" /> PDF
                      </Link>
                    </div>
                    <div className="p-4 bg-pastel-lavender/10 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">O Morro dos Ventos Uivantes</p>
                        <p className="text-gray-600 text-sm">Emily Brontë</p>
                      </div>
                      <Link href="#" className="text-pastel-lavender hover:underline flex items-center gap-1">
                        <Download className="h-4 w-4" /> ePub
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">Clássicos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-pastel-lavender/10 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Orgulho e Preconceito</p>
                        <p className="text-gray-600 text-sm">Jane Austen</p>
                      </div>
                      <Link href="#" className="text-pastel-lavender hover:underline flex items-center gap-1">
                        <Download className="h-4 w-4" /> PDF
                      </Link>
                    </div>
                    <div className="p-4 bg-pastel-lavender/10 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">1984</p>
                        <p className="text-gray-600 text-sm">George Orwell</p>
                      </div>
                      <Link href="#" className="text-pastel-lavender hover:underline flex items-center gap-1">
                        <Download className="h-4 w-4" /> ePub
                      </Link>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-center mt-4">
                  *A funcionalidade de download e busca será ativada em breve!*
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, FileText, GraduationCap, PlayCircle } from 'lucide-react'
import { NavigationBar } from '@/components/tecnico/NavigationBar'
import { Badge } from '@/components/ui/badge'

const resources = [
  {
    title: 'Troubleshooting Wallbox',
    description: 'Soluciones para diferentes problemas',
    href: '/Troubleshooting.pdf',
    type: 'Presentación',
    icon: FileText,
    isLocal: false,
  },
  {
    title: 'Reseteo placa Wallbox Pulsar Plus',
    description: 'Guía paso a paso para resetear la placa',
    href: 'https://www.youtube.com/watch?v=xOJwIMOkecI',
    type: 'Vídeo',
    icon: PlayCircle,
    isLocal: false,
  },
  {
    title: 'Reseteo placa Wallbox Pulsar Max',
    description: 'Guía paso a paso para resetear la placa',
    href: 'https://www.youtube.com/watch?v=xAZv4dQp3y0',
    type: 'Vídeo',
    icon: PlayCircle,
    isLocal: false,
  },
  {
    title: 'Conceptos básicos',
    description: 'Conocimiento sobre el ecosistema Wallbox',
    href: '/Conceptos básicos.pdf',
    type: 'Presentación',
    icon: FileText,
    isLocal: false,
  },
  {
    title: 'GDP',
    description: 'Guía de instalación y reparación del GDP',
    href: '/Manual medidor de consumo.pdf',
    type: 'Manual',
    icon: FileText,
    isLocal: false,
  },
  {
    title: 'Commander 2',
    description: 'Información completa sobre el Commander 2',
    href: '/commander-2.pdf',
    type: 'Manual',
    icon: FileText,
    isLocal: false,
  },
  {
    title: 'Cupra Charger 2',
    description: 'Información completa sobre el Cupra Charger 2',
    href: '/cupra-charger-2.pdf',
    type: 'Manual',
    icon: FileText,
    isLocal: false,
  },
]

export default function FormacionPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null)

  const filteredResources = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    let filtered = resources

    // Filtro de búsqueda
    if (term) {
      filtered = filtered.filter((resource) =>
        resource.title.toLowerCase().includes(term) ||
        resource.type.toLowerCase().includes(term)
      )
    }

    // Filtro por tipo
    if (filtroTipo) {
      filtered = filtered.filter((resource) => resource.type === filtroTipo)
    }

    return filtered
  }, [searchTerm, filtroTipo])

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0 lg:pt-16">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Título minimalista */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Formación</h1>

        {/* Barra de búsqueda estilo WhatsApp */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar formación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-4 pr-4 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008606] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Botones de filtro minimalistas */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroTipo(filtroTipo === 'Presentación' ? null : 'Presentación')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filtroTipo === 'Presentación'
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Presentaciones
          </button>
          <button
            onClick={() => setFiltroTipo(filtroTipo === 'Vídeo' ? null : 'Vídeo')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filtroTipo === 'Vídeo'
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Vídeos
          </button>
          <button
            onClick={() => setFiltroTipo(filtroTipo === 'Manual' ? null : 'Manual')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filtroTipo === 'Manual'
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Manuales
          </button>
        </div>

        {/* Grid de recursos minimalista */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredResources.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No hay resultados para tu búsqueda</p>
              </div>
            ) : (
              filteredResources.map((resource) => {
                return (
                  <Link
                    key={resource.href}
                    href={resource.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-[#008606] hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm flex-1 line-clamp-2">
                        {resource.title}
                      </h3>
                      <Badge className="bg-[#008606] text-[10px] px-2 py-0.5">
                        {resource.type}
                      </Badge>
                    </div>
                    
                    {resource.description && (
                      <div className="text-xs text-gray-600 line-clamp-2">
                        {resource.description}
                      </div>
                    )}
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>

      <NavigationBar activePage="formacion" />
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, GraduationCap, MessageCircle, Phone, LogOut } from 'lucide-react'

interface NavigationBarProps {
  onLogout?: () => void
  activePage?: 'inicio' | 'formacion'
}

export function NavigationBar({ onLogout, activePage = 'inicio' }: NavigationBarProps) {
  const router = useRouter()

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout()
    } else {
      // Si no hay onLogout, redirigir a la página principal
      router.push('/')
    }
  }

  return (
    <>
      {/* Barra de navegación inferior estilo app móvil */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50">
        <div className="grid grid-cols-5 h-16">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activePage === 'inicio' ? 'text-[#008606] bg-gray-50' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Inicio</span>
          </Link>
          
          <Link
            href="/formacion"
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activePage === 'formacion' ? 'text-[#008606] bg-gray-50' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-xs font-medium">Formación</span>
          </Link>
          
          <a
            href="https://wa.me/34611563835"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-medium">WhatsApp</span>
          </a>
          
          <a
            href="tel:+34611563835"
            className="flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Phone className="w-5 h-5" />
            <span className="text-xs font-medium">Llamar</span>
          </a>
          
          <button
            onClick={handleLogoutClick}
            className="flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-medium">Salir</span>
          </button>
        </div>
      </div>

      {/* Versión desktop - barra superior */}
      <div className="hidden lg:flex fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-6 py-3 z-50">
        <div className="max-w-5xl mx-auto w-full flex items-center gap-4">
          <Link
            href="/"
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              activePage === 'inicio' ? 'text-[#008606] bg-gray-50' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Inicio</span>
          </Link>
          
          <Link
            href="/formacion"
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              activePage === 'formacion' ? 'text-[#008606] bg-gray-50' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Formación</span>
          </Link>
          
          <a
            href="https://wa.me/34611563835"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-full transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>
          
          <a
            href="tel:+34611563835"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-full transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Llamar</span>
          </a>
          
          {onLogout && (
            <div className="ml-auto">
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-full transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

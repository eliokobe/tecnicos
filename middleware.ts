import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

/**
 * FASE 3: PROTECCIÓN DE RUTAS CON MIDDLEWARE
 * 
 * Este middleware actúa como guardián de las rutas protegidas:
 * 1. Intercepta cada petición
 * 2. Verifica la sesión en cookies HttpOnly
 * 3. Redirige al login si no hay sesión válida
 * 4. Refresca la sesión automáticamente
 */

// Rutas que requieren autenticación
const PROTECTED_ROUTES = [
  '/parte',
  '/api/tecnico/servicios',
  '/api/repairs',
]

// Rutas públicas (no requieren autenticación)
const PUBLIC_ROUTES = [
  '/',
  '/cita',
  '/formacion',
  '/api/bookings',
  '/api/disponibilidad',
]

// Rutas de autenticación
const AUTH_ROUTES = [
  '/api/tecnico/auth',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('🛡️ Middleware:', pathname)

  // Actualizar sesión de Supabase
  let response = await updateSession(request)

  // Si es una ruta pública, permitir acceso
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    console.log('✅ Ruta pública, acceso permitido')
    return response
  }

  // Si es una ruta de autenticación, permitir acceso
  if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    console.log('✅ Ruta de autenticación, acceso permitido')
    return response
  }

  // Para rutas protegidas, verificar autenticación
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    console.log('🔒 Ruta protegida, verificando sesión...')

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({ name, value, ...options })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            request.cookies.set({ name, value: '', ...options })
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.log('❌ Sin sesión válida, redirigiendo al login')
      
      // Si es una API, devolver 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'No autenticado' },
          { status: 401 }
        )
      }

      // Si es una página, redirigir al login
      const loginUrl = new URL('/', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verificar que es un técnico
    const rol = user.user_metadata?.rol
    if (rol !== 'tecnico') {
      console.log('❌ Usuario no es técnico')
      
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 403 }
        )
      }

      return NextResponse.redirect(new URL('/', request.url))
    }

    console.log('✅ Sesión válida, usuario:', user.id)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

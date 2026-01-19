import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * FASE 3: GESTIÓN DE SESIÓN
 * 
 * Obtiene la información de la sesión actual del técnico
 * La sesión está almacenada en cookies HttpOnly (seguras)
 */
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      // Devolvemos 200 para evitar errores en consola, pero indicando que no hay sesión
      return NextResponse.json({
        success: false,
        error: 'No hay sesión activa'
      }, { status: 200 })
    }

    // Extraer información del técnico
    const tecnico = {
      id: user.id,
      nombre: user.user_metadata?.nombre || 'Técnico',
      email: user.email,
      telefono: user.phone || user.user_metadata?.telefono,
      airtableId: user.user_metadata?.airtable_id,
      rol: user.user_metadata?.rol || 'tecnico',
    }

    return NextResponse.json({
      success: true,
      data: { tecnico },
    })

  } catch (err: any) {
    console.error('❌ Error al obtener sesión:', err)
    return NextResponse.json(
      { error: 'Error al obtener sesión' },
      { status: 500 }
    )
  }
}

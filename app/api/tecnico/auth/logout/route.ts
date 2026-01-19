import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * FASE 3: CERRAR SESIÓN
 * 
 * Elimina la sesión del técnico de forma segura
 * Las cookies HttpOnly se eliminan automáticamente
 */
export async function POST() {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('❌ Error al cerrar sesión:', error)
      return NextResponse.json(
        { error: 'Error al cerrar sesión' },
        { status: 500 }
      )
    }

    console.log('✅ Sesión cerrada correctamente')

    return NextResponse.json({
      success: true,
      message: 'Sesión cerrada correctamente',
    })

  } catch (err: any) {
    console.error('❌ Error al cerrar sesión:', err)
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    )
  }
}

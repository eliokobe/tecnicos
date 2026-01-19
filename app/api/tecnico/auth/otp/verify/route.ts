import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * FASE 2: VERIFICACIÓN DE OTP
 * 
 * Este endpoint verifica el código OTP y genera una sesión segura
 * La sesión se almacena en cookies HttpOnly
 */
export async function POST(request: NextRequest) {
  try {
    const { authMethod, authValue, otp } = await request.json()

    console.log('=== FASE 2: VERIFICACIÓN DE OTP ===')
    console.log('Método:', authMethod, 'OTP:', otp ? '****' : 'no proporcionado')

    // Validación
    if (!authMethod || !authValue || !otp) {
      return NextResponse.json(
        { error: 'Datos de verificación incompletos' },
        { status: 400 }
      )
    }

    if (!['email', 'phone'].includes(authMethod)) {
      return NextResponse.json(
        { error: 'Método de autenticación no válido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar OTP según el método
    let result
    if (authMethod === 'email') {
      console.log('📧 Verificando OTP de email...')
      result = await supabase.auth.verifyOtp({
        email: authValue,
        token: otp,
        type: 'magiclink',
      })
    } else {
      console.log('📱 Verificando OTP de SMS...')
      result = await supabase.auth.verifyOtp({
        phone: authValue,
        token: otp,
        type: 'sms',
      })
    }

    const { data, error } = result

    if (error) {
      console.error('❌ Error al verificar OTP:', error)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error status:', error.status)
      
      // Mensajes de error específicos
      if (error.message.includes('expired')) {
        return NextResponse.json(
          { error: 'El código ha expirado. Solicita uno nuevo.' },
          { status: 401 }
        )
      }
      
      if (error.message.includes('invalid') || error.message.includes('Token')) {
        return NextResponse.json(
          { error: 'Código incorrecto. Verifica e intenta de nuevo.' },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { error: `Error al verificar código: ${error.message}` },
        { status: 401 }
      )
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'No se pudo crear la sesión' },
        { status: 500 }
      )
    }

    console.log('✅ OTP verificado correctamente')
    console.log('👤 Usuario autenticado:', data.user.id)
    console.log('🔐 Sesión creada (almacenada en cookies HttpOnly)')

    // La sesión se almacena automáticamente en cookies HttpOnly por el SDK
    // Extraer información del técnico
    const tecnico = {
      id: data.user.id,
      nombre: data.user.user_metadata?.nombre || 'Técnico',
      email: data.user.email,
      telefono: data.user.phone,
      airtableId: data.user.user_metadata?.airtable_id,
      rol: data.user.user_metadata?.rol || 'tecnico',
    }

    return NextResponse.json({
      success: true,
      message: 'Autenticación exitosa',
      data: {
        tecnico,
        session: {
          expiresAt: data.session.expires_at,
          expiresIn: data.session.expires_in,
        },
      },
    })

  } catch (err: any) {
    console.error('❌ Error al verificar OTP:', err)
    return NextResponse.json(
      { error: err.message || 'Error al verificar código' },
      { status: 500 }
    )
  }
}

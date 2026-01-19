import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * FASE 2: AUTENTICACIÓN ROBUSTA CON OTP
 * 
 * Este endpoint envía un código OTP al técnico validado
 * El código expira en 1 hora y se envía por SMS o email
 */
export async function POST(request: NextRequest) {
  try {
    const { authMethod, authValue } = await request.json()

    console.log('=== FASE 2: ENVÍO DE OTP ===')
    console.log('Método:', authMethod, 'Valor:', authValue)

    // Validación
    if (!authMethod || !authValue) {
      return NextResponse.json(
        { error: 'Datos de autenticación requeridos' },
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

    // Enviar OTP según el método
    let result
    if (authMethod === 'email') {
      console.log('📧 Enviando OTP por email...')
      result = await supabase.auth.signInWithOtp({
        email: authValue,
        options: {
          shouldCreateUser: false, // Ya lo creamos en el paso anterior
        },
      })
    } else {
      console.log('📱 Enviando OTP por SMS...')
      result = await supabase.auth.signInWithOtp({
        phone: authValue,
        options: {
          shouldCreateUser: false,
        },
      })
    }

    const { error } = result

    if (error) {
      console.error('❌ Error al enviar OTP:', error)
      return NextResponse.json(
        { error: 'Error al enviar código de verificación' },
        { status: 500 }
      )
    }

    console.log('✅ OTP enviado correctamente')

    return NextResponse.json({
      success: true,
      message: authMethod === 'email' 
        ? 'Código enviado a tu email' 
        : 'Código enviado por SMS',
      data: {
        authMethod,
        expiresIn: 3600, // 1 hora en segundos
      },
    })

  } catch (err: any) {
    console.error('❌ Error al enviar OTP:', err)
    return NextResponse.json(
      { error: err.message || 'Error al enviar código' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TABLE_TECNICOS = 'Técnicos'

/**
 * FASE 1: SINCRONIZACIÓN JUST-IN-TIME (Airtable ↔ Supabase)
 * 
 * Este endpoint realiza:
 * 1. Validación del técnico en Airtable (fuente de verdad)
 * 2. Sincronización automática a Supabase Auth si no existe
 * 3. Envío de código OTP para autenticación segura
 */
export async function POST(request: NextRequest) {
  try {
    const { telefono, email } = await request.json()

    console.log('=== FASE 1: SINCRONIZACIÓN JUST-IN-TIME ===')
    console.log('Contacto recibido:', { telefono, email })

    // Validación de entrada
    if (!telefono && !email) {
      return NextResponse.json(
        { error: 'Teléfono o email requerido' },
        { status: 400 }
      )
    }

    // Verificar configuración
    if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
      console.error('❌ Missing Airtable credentials')
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      )
    }

    // PASO 1: Validar en Airtable (fuente de verdad)
    console.log('📋 PASO 1: Validando técnico en Airtable...')
    const tecnicoAirtable = await buscarTecnicoEnAirtable(telefono, email)

    if (!tecnicoAirtable) {
      console.log('❌ Técnico no encontrado en Airtable')
      return NextResponse.json(
        { error: 'Credenciales no válidas. Contacta con soporte si eres un técnico autorizado.' },
        { status: 404 }
      )
    }

    // Verificar que el técnico está activo
    if (!tecnicoAirtable.activo) {
      console.log('❌ Técnico inactivo en Airtable')
      return NextResponse.json(
        { error: 'Tu cuenta está desactivada. Contacta con soporte.' },
        { status: 403 }
      )
    }

    console.log('✅ Técnico validado en Airtable:', tecnicoAirtable.nombre)

    // PASO 2: Sincronizar con Supabase Auth (Just-In-Time)
    console.log('🔄 PASO 2: Sincronizando con Supabase Auth...')
    const supabase = await createAdminClient()
    
    // Determinar el método de autenticación (email tiene prioridad)
    const authMethod = tecnicoAirtable.email ? 'email' : 'phone'
    const authValue = tecnicoAirtable.email || tecnicoAirtable.telefono

    console.log(`Método de autenticación: ${authMethod}`)

    // Verificar si el usuario ya existe en Supabase
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    
    let usuarioSupabase = existingUsers?.users.find(u => {
      if (authMethod === 'email') {
        return u.email === tecnicoAirtable.email
      } else {
        return u.phone === tecnicoAirtable.telefono
      }
    })

    if (!usuarioSupabase) {
      console.log('👤 Usuario no existe en Supabase, creando...')
      
      // Crear usuario en Supabase usando el service_role
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: tecnicoAirtable.email,
        phone: tecnicoAirtable.telefono,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          nombre: tecnicoAirtable.nombre,
          airtable_id: tecnicoAirtable.id,
          rol: 'tecnico',
          sincronizado_desde: 'airtable',
          sincronizado_en: new Date().toISOString(),
        },
      })

      if (createError) {
        console.error('❌ Error al crear usuario en Supabase:', createError)
        return NextResponse.json(
          { error: 'Error al sincronizar usuario' },
          { status: 500 }
        )
      }

      usuarioSupabase = newUser.user
      console.log('✅ Usuario creado en Supabase:', usuarioSupabase?.id)
    } else {
      console.log('✅ Usuario ya existe en Supabase:', usuarioSupabase.id)
      
      // Actualizar metadatos si es necesario
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        usuarioSupabase.id,
        {
          user_metadata: {
            nombre: tecnicoAirtable.nombre,
            airtable_id: tecnicoAirtable.id,
            rol: 'tecnico',
            ultima_sincronizacion: new Date().toISOString(),
          },
        }
      )

      if (updateError) {
        console.warn('⚠️ Error al actualizar metadatos:', updateError)
      }
    }

    console.log('=== SINCRONIZACIÓN COMPLETADA ===')
    
    // Devolver información para el siguiente paso (solicitar OTP)
    return NextResponse.json({
      success: true,
      message: 'Usuario validado correctamente',
      data: {
        authMethod,
        authValue,
        nombre: tecnicoAirtable.nombre,
        needsOTP: true,
      },
    })

  } catch (err: any) {
    console.error('❌ Error en sincronización:', err)
    return NextResponse.json(
      { error: err.message || 'Error al validar técnico' },
      { status: 500 }
    )
  }
}

/**
 * Busca un técnico en Airtable por teléfono o email
 */
async function buscarTecnicoEnAirtable(telefono?: string, email?: string) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_TECNICOS)}`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Airtable API error:', response.status, errorText)
    throw new Error(`Error al buscar técnico en Airtable (${response.status})`)
  }

  const data = await response.json()
  
  if (!data.records || data.records.length === 0) {
    return null
  }

  // Normalizar teléfono para búsqueda
  const normalizeTelefono = (tel: string) => tel.replace(/[\s\-()]/g, '')
  const telefonoNormalizado = telefono ? normalizeTelefono(telefono) : null

  // Buscar por email o teléfono
  const tecnico = data.records.find((record: any) => {
    const fields = record.fields
    
    // Buscar por email si se proporcionó
    if (email && fields['Email']) {
      if (fields['Email'].toLowerCase() === email.toLowerCase()) {
        return true
      }
    }
    
    // Buscar por teléfono si se proporcionó
    if (telefono && fields['Teléfono']) {
      const tecnicoTel = normalizeTelefono(String(fields['Teléfono']))
      if (tecnicoTel === telefonoNormalizado) {
        return true
      }
    }
    
    return false
  })

  if (!tecnico) {
    return null
  }

  const fields = tecnico.fields
  
  return {
    id: tecnico.id,
    nombre: fields['Nombre'] || fields['nombre'] || 'Sin nombre',
    telefono: fields['Teléfono'] || fields['telefono'],
    email: fields['Email'] || fields['email'],
    activo: fields['Activo'] !== false, // Por defecto true si no está el campo
  }
}

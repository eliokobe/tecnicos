# 📡 Ejemplos de Uso de la Nueva API de Autenticación

## 🔐 Flujo de Autenticación Completo

### 1. Validar y Sincronizar Técnico

**Endpoint:** `POST /api/tecnico/auth/validate`

**Descripción:** Valida que el técnico existe en Airtable y lo sincroniza con Supabase.

```typescript
// Ejemplo de uso
const response = await fetch('/api/tecnico/auth/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    telefono: '612345678', // Opcional
    email: 'tecnico@ritest.com', // Opcional (pero uno de los dos es requerido)
  }),
})

const data = await response.json()

// Respuesta exitosa
{
  "success": true,
  "message": "Usuario validado correctamente",
  "data": {
    "authMethod": "email", // o "phone"
    "authValue": "tecnico@ritest.com", // o el teléfono
    "nombre": "Juan Pérez",
    "needsOTP": true
  }
}

// Errores posibles
{
  "error": "Teléfono o email requerido" // 400
}
{
  "error": "Credenciales no válidas. Contacta con soporte..." // 404
}
{
  "error": "Tu cuenta está desactivada. Contacta con soporte." // 403
}
```

---

### 2. Solicitar Código OTP

**Endpoint:** `POST /api/tecnico/auth/otp/send`

**Descripción:** Envía un código OTP al email o teléfono del técnico.

```typescript
const response = await fetch('/api/tecnico/auth/otp/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    authMethod: 'email', // o 'phone'
    authValue: 'tecnico@ritest.com', // o teléfono
  }),
})

const data = await response.json()

// Respuesta exitosa
{
  "success": true,
  "message": "Código enviado a tu email", // o "Código enviado por SMS"
  "data": {
    "authMethod": "email",
    "expiresIn": 3600 // 1 hora en segundos
  }
}

// Errores posibles
{
  "error": "Datos de autenticación requeridos" // 400
}
{
  "error": "Método de autenticación no válido" // 400
}
{
  "error": "Error al enviar código de verificación" // 500
}
```

---

### 3. Verificar Código OTP

**Endpoint:** `POST /api/tecnico/auth/otp/verify`

**Descripción:** Verifica el código OTP y crea una sesión segura.

```typescript
const response = await fetch('/api/tecnico/auth/otp/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    authMethod: 'email',
    authValue: 'tecnico@ritest.com',
    otp: '123456',
  }),
})

const data = await response.json()

// Respuesta exitosa
{
  "success": true,
  "message": "Autenticación exitosa",
  "data": {
    "tecnico": {
      "id": "uuid-del-usuario",
      "nombre": "Juan Pérez",
      "email": "tecnico@ritest.com",
      "telefono": "612345678",
      "airtableId": "recXXXXXXX",
      "rol": "tecnico"
    },
    "session": {
      "expiresAt": 1234567890,
      "expiresIn": 3600
    }
  }
}

// Errores posibles
{
  "error": "Datos de verificación incompletos" // 400
}
{
  "error": "El código ha expirado. Solicita uno nuevo." // 401
}
{
  "error": "Código incorrecto. Verifica e intenta de nuevo." // 401
}
{
  "error": "No se pudo crear la sesión" // 500
}
```

**IMPORTANTE:** La sesión se almacena automáticamente en cookies HttpOnly. No necesitas guardar nada en localStorage.

---

### 4. Obtener Sesión Actual

**Endpoint:** `GET /api/tecnico/auth/session`

**Descripción:** Obtiene la información del técnico autenticado actualmente.

```typescript
const response = await fetch('/api/tecnico/auth/session')
const data = await response.json()

// Respuesta exitosa
{
  "success": true,
  "data": {
    "tecnico": {
      "id": "uuid-del-usuario",
      "nombre": "Juan Pérez",
      "email": "tecnico@ritest.com",
      "telefono": "612345678",
      "airtableId": "recXXXXXXX",
      "rol": "tecnico"
    }
  }
}

// Error
{
  "error": "No hay sesión activa" // 401
}
```

---

### 5. Cerrar Sesión

**Endpoint:** `POST /api/tecnico/auth/logout`

**Descripción:** Cierra la sesión del técnico y elimina las cookies.

```typescript
const response = await fetch('/api/tecnico/auth/logout', {
  method: 'POST',
})

const data = await response.json()

// Respuesta exitosa
{
  "success": true,
  "message": "Sesión cerrada correctamente"
}

// Error
{
  "error": "Error al cerrar sesión" // 500
}
```

---

### 6. Obtener Servicios del Técnico (Protegido)

**Endpoint:** `GET /api/tecnico/servicios`

**Descripción:** Obtiene las reparaciones asignadas al técnico autenticado.

**IMPORTANTE:** Esta ruta está protegida. Solo funciona si hay una sesión activa.

```typescript
// YA NO necesitas enviar el teléfono
// El sistema lo obtiene automáticamente de la sesión
const response = await fetch('/api/tecnico/servicios')
const data = await response.json()

// Respuesta exitosa
{
  "success": true,
  "servicios": [
    {
      "id": "recXXXXX",
      "createdTime": "2024-01-01T10:00:00.000Z",
      "fields": {
        "Cliente": ["Juan García"],
        "Dirección": "Calle Mayor 123",
        "Estado": "Asignado",
        "Teléfono": "612345678",
        "Email": "cliente@email.com",
        // Solo campos necesarios, sin datos internos
      }
    }
  ]
}

// Error si no hay sesión
{
  "error": "No autenticado" // 401
}
```

---

## 🎨 Ejemplo de Componente React

### Hook Personalizado para Autenticación

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Tecnico {
  id: string
  nombre: string
  email?: string
  telefono?: string
  rol: string
}

export function useAuth() {
  const [tecnico, setTecnico] = useState<Tecnico | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/tecnico/auth/session')
      if (response.ok) {
        const data = await response.json()
        setTecnico(data.data.tecnico)
      } else {
        setTecnico(null)
      }
    } catch (error) {
      setTecnico(null)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await fetch('/api/tecnico/auth/logout', { method: 'POST' })
    setTecnico(null)
    router.push('/')
  }

  return {
    tecnico,
    isLoading,
    isAuthenticated: !!tecnico,
    logout,
    refresh: checkAuth,
  }
}
```

### Uso en Componentes

```typescript
// components/ProtectedPage.tsx
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { tecnico, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div>
      <header>
        <h1>Bienvenido, {tecnico?.nombre}</h1>
      </header>
      {children}
    </div>
  )
}
```

---

## 🔄 Flujo Completo en un Componente

```typescript
'use client'

import { useState } from 'react'

export function LoginExample() {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [authData, setAuthData] = useState({ method: '', value: '' })
  const [otp, setOtp] = useState('')

  // PASO 1: Validar credenciales
  const handleSubmitCredentials = async (telefono: string, email: string) => {
    try {
      // Validar y sincronizar
      const validateRes = await fetch('/api/tecnico/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefono, email }),
      })
      
      if (!validateRes.ok) throw new Error('Error al validar')
      
      const validateData = await validateRes.json()
      
      // Guardar método y valor para el siguiente paso
      setAuthData({
        method: validateData.data.authMethod,
        value: validateData.data.authValue,
      })
      
      // Solicitar OTP
      const otpRes = await fetch('/api/tecnico/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authMethod: validateData.data.authMethod,
          authValue: validateData.data.authValue,
        }),
      })
      
      if (!otpRes.ok) throw new Error('Error al enviar OTP')
      
      // Pasar al siguiente paso
      setStep('otp')
      
    } catch (error) {
      console.error(error)
      alert('Error al iniciar sesión')
    }
  }

  // PASO 2: Verificar OTP
  const handleSubmitOTP = async () => {
    try {
      const response = await fetch('/api/tecnico/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authMethod: authData.method,
          authValue: authData.value,
          otp,
        }),
      })
      
      if (!response.ok) throw new Error('Código incorrecto')
      
      const data = await response.json()
      
      // ¡Éxito! La sesión ya está creada en las cookies
      console.log('Bienvenido', data.data.tecnico.nombre)
      
      // Redirigir al portal
      window.location.href = '/parte'
      
    } catch (error) {
      console.error(error)
      alert('Error al verificar código')
    }
  }

  return (
    <div>
      {step === 'credentials' ? (
        <form onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          handleSubmitCredentials(
            formData.get('telefono') as string,
            formData.get('email') as string
          )
        }}>
          <input name="telefono" placeholder="Teléfono" />
          <input name="email" type="email" placeholder="Email" />
          <button type="submit">Continuar</button>
        </form>
      ) : (
        <form onSubmit={(e) => {
          e.preventDefault()
          handleSubmitOTP()
        }}>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Código OTP"
            maxLength={6}
          />
          <button type="submit">Verificar</button>
        </form>
      )}
    </div>
  )
}
```

---

## 🛡️ Middleware: Protección Automática

El middleware ya está configurado para proteger automáticamente:

### Rutas Protegidas (requieren autenticación)

```typescript
✅ /parte
✅ /api/tecnico/servicios
✅ /api/repairs
```

Si intentas acceder sin sesión:
- **Páginas:** Redirige a `/` (home)
- **APIs:** Devuelve `401 Unauthorized`

### Rutas Públicas (no requieren autenticación)

```typescript
✅ / (Home)
✅ /cita
✅ /formacion
✅ /api/bookings
✅ /api/disponibilidad
✅ /api/tecnico/auth/* (todas las rutas de autenticación)
```

---

## 🧪 Testing

### Probar Autenticación

```bash
# 1. Validar técnico
curl -X POST http://localhost:3000/api/tecnico/auth/validate \
  -H "Content-Type: application/json" \
  -d '{"telefono":"612345678"}'

# 2. Enviar OTP
curl -X POST http://localhost:3000/api/tecnico/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"authMethod":"phone","authValue":"612345678"}'

# 3. Verificar OTP (necesitas el código real del SMS/Email)
curl -X POST http://localhost:3000/api/tecnico/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"authMethod":"phone","authValue":"612345678","otp":"123456"}'

# 4. Obtener sesión (incluye las cookies de la respuesta anterior)
curl http://localhost:3000/api/tecnico/auth/session \
  -H "Cookie: sb-xxxxx-auth-token=..."

# 5. Logout
curl -X POST http://localhost:3000/api/tecnico/auth/logout \
  -H "Cookie: sb-xxxxx-auth-token=..."
```

---

## ⚠️ Errores Comunes

### "No autenticado" al llamar a APIs protegidas

**Causa:** Las cookies no se están enviando.

**Solución:**
```typescript
// En fetch, asegúrate de incluir credentials
fetch('/api/tecnico/servicios', {
  credentials: 'include' // Importante para enviar cookies
})
```

### "Código incorrecto" al verificar OTP

**Causa:** El código expiró o es incorrecto.

**Solución:**
- Verificar que el código es el correcto
- Solicitar un nuevo código si pasó más de 1 hora
- Verificar que el proveedor de SMS/Email está bien configurado

### CORS errors

**Causa:** El dominio no está autorizado en Supabase.

**Solución:**
1. Ve a Supabase Dashboard > Settings > API
2. Añade tu dominio en "Additional Redirect URLs"

---

## 📱 Ejemplo Completo: Portal de Técnico

```typescript
// app/parte/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PartePage() {
  const [tecnico, setTecnico] = useState<any>(null)
  const [servicios, setServicios] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      // Verificar sesión
      const sessionRes = await fetch('/api/tecnico/auth/session')
      
      if (!sessionRes.ok) {
        // No autenticado, redirigir al login
        router.push('/')
        return
      }

      const sessionData = await sessionRes.json()
      setTecnico(sessionData.data.tecnico)

      // Cargar servicios (ya no necesitas enviar el teléfono)
      const serviciosRes = await fetch('/api/tecnico/servicios')
      const serviciosData = await serviciosRes.json()
      
      setServicios(serviciosData.servicios)

    } catch (error) {
      console.error('Error:', error)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/tecnico/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (isLoading) {
    return <div>Cargando...</div>
  }

  return (
    <div>
      <header>
        <h1>Bienvenido, {tecnico?.nombre}</h1>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </header>

      <main>
        <h2>Mis Servicios</h2>
        {servicios.map((servicio: any) => (
          <div key={servicio.id}>
            <h3>{servicio.fields.Cliente}</h3>
            <p>{servicio.fields.Dirección}</p>
            <p>Estado: {servicio.fields.Estado}</p>
          </div>
        ))}
      </main>
    </div>
  )
}
```

---

¿Necesitas más ejemplos? Consulta la documentación completa en [SECURITY.md](./SECURITY.md)

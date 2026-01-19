# 🔐 Guía de Configuración de Seguridad

## ✅ Implementación Completada

Se han implementado todas las 4 fases de seguridad propuestas:

### **Fase 1: Sincronización Just-In-Time (Airtable ↔ Supabase)**
- ✅ Validación en Airtable como fuente de verdad
- ✅ Creación automática de usuarios en Supabase Auth
- ✅ Actualización de metadatos al iniciar sesión

### **Fase 2: Autenticación Robusta con OTP**
- ✅ Envío de códigos OTP por email/SMS
- ✅ Verificación de códigos con expiración de 1 hora
- ✅ Generación de JWT firmado por Supabase

### **Fase 3: Protección de Rutas y Almacenamiento**
- ✅ Middleware para proteger rutas del técnico
- ✅ Sesiones en cookies HttpOnly (no localStorage)
- ✅ Protección contra XSS y CSRF

### **Fase 4: Seguridad de la Capa de Datos**
- ✅ Proxy API para Airtable (API Keys privadas)
- ✅ Filtrado de respuestas (solo datos necesarios)
- ✅ Content Security Policy (CSP) headers

---

## 🚀 Configuración de Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Rellena los datos:
   - **Name:** Portal Técnicos
   - **Database Password:** (genera uno seguro)
   - **Region:** Europe West (Ireland) - para mejor latencia en España
5. Espera 2-3 minutos mientras se crea el proyecto

### 2. Configurar Autenticación

#### A. Habilitar Email Provider

1. En el panel de Supabase, ve a **Authentication > Providers**
2. Busca **Email** y actívalo
3. Configuración recomendada:
   - ✅ Enable Email provider
   - ✅ Confirm email (mantener activado)
   - ✅ Secure email change
   - **Email OTP expiration:** 3600 segundos (1 hora)

#### B. Habilitar Phone Provider (SMS/WhatsApp)

1. En **Authentication > Providers**, busca **Phone**
2. Actívalo y configura un proveedor de SMS:

**Opción 1: Twilio (Recomendado)**
```bash
# Necesitarás crear una cuenta en Twilio:
# https://www.twilio.com/try-twilio

# En Supabase, configura:
Twilio Account SID: tu_account_sid
Twilio Auth Token: tu_auth_token
Twilio Phone Number: +34XXXXXXXXX
```

**Opción 2: MessageBird**
```bash
# https://messagebird.com

MessageBird API Key: tu_api_key
MessageBird Originator: Ritest
```

3. Configuración de Phone Auth:
   - **SMS OTP expiration:** 3600 segundos (1 hora)
   - **SMS template:** (personaliza el mensaje si quieres)

### 3. Obtener Credenciales

1. Ve a **Settings > API**
2. Copia las siguientes credenciales:

```env
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co

# Anon/Public Key (para el cliente)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (PRIVADA - solo servidor)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE:** El `service_role_key` tiene acceso total. NUNCA lo expongas en el cliente.

### 4. Actualizar Variables de Entorno

Edita el archivo `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

### 5. Configurar Email Templates (Opcional)

1. Ve a **Authentication > Email Templates**
2. Personaliza el template "Magic Link":

```html
<h2>Tu código de acceso</h2>
<p>Hola,</p>
<p>Tu código de verificación para el Portal de Técnicos es:</p>
<h1 style="font-size: 32px; letter-spacing: 5px;">{{ .Token }}</h1>
<p>Este código expirará en 1 hora.</p>
<p>Si no solicitaste este código, ignora este email.</p>
```

### 6. Configurar Row Level Security (RLS)

Supabase crea automáticamente una tabla `auth.users`. Para mayor seguridad:

1. Ve a **Database > Tables**
2. Si quieres crear una tabla personalizada para técnicos:

```sql
-- Crear tabla de técnicos (opcional)
CREATE TABLE public.tecnicos (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  airtable_id TEXT,
  nombre TEXT,
  telefono TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.tecnicos ENABLE ROW LEVEL SECURITY;

-- Política: Los técnicos solo pueden ver sus propios datos
CREATE POLICY "Técnicos pueden ver sus datos"
ON public.tecnicos
FOR SELECT
USING (auth.uid() = id);
```

---

## 🧪 Probar la Configuración

### 1. Reiniciar el Servidor de Desarrollo

```bash
npm run dev
```

### 2. Flujo de Prueba

1. **Ir a la página de login** del portal
2. **Introducir teléfono o email** de un técnico existente en Airtable
3. **Verificar que se envía el OTP** (revisa email/SMS)
4. **Introducir el código OTP**
5. **Verificar que se crea la sesión** (cookies HttpOnly)
6. **Comprobar que puedes acceder a /parte**
7. **Cerrar sesión** y verificar que te redirige al login

### 3. Verificar en Supabase

1. Ve a **Authentication > Users**
2. Deberías ver el técnico creado automáticamente
3. Verifica que los metadatos incluyen:
   - `nombre`
   - `airtable_id`
   - `rol: tecnico`

---

## 🔍 Verificación de Seguridad

### ✅ Checklist de Seguridad Implementada

| Medida | Estado | Descripción |
|--------|--------|-------------|
| OTP Authentication | ✅ | Código único de 6 dígitos |
| HttpOnly Cookies | ✅ | Sesión protegida contra XSS |
| SameSite=Lax | ✅ | Protección CSRF |
| Middleware Auth | ✅ | Rutas protegidas en servidor |
| API Proxy | ✅ | Airtable API Keys privadas |
| CSP Headers | ✅ | Bloqueo de scripts no autorizados |
| Data Filtering | ✅ | Solo datos necesarios al cliente |
| JWT Signed | ✅ | Tokens firmados por Supabase |
| Sync Just-In-Time | ✅ | Validación en Airtable primero |

### 🛡️ Pruebas de Penetración

```bash
# 1. Intentar acceder a /parte sin autenticación
# Debe redirigir al login

# 2. Intentar acceder con un token manipulado
# Debe rechazar la sesión

# 3. Inspeccionar cookies en DevTools
# Deben ser HttpOnly (no accesibles desde JavaScript)

# 4. Revisar Network en DevTools
# Las API Keys de Airtable NO deben aparecer
```

---

## 📊 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────┐
│ 1. USUARIO INTRODUCE TELÉFONO/EMAIL                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 2. VALIDACIÓN EN AIRTABLE (Fuente de Verdad)           │
│    - Verificar que existe                                │
│    - Verificar que está activo                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 3. SINCRONIZACIÓN JUST-IN-TIME                          │
│    - Buscar en Supabase Auth                            │
│    - Crear si no existe (con service_role)              │
│    - Actualizar metadatos si existe                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 4. ENVÍO DE OTP                                         │
│    - Generar código de 6 dígitos                        │
│    - Enviar por Email o SMS                             │
│    - Expiración: 1 hora                                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 5. USUARIO INTRODUCE CÓDIGO OTP                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 6. VERIFICACIÓN DE OTP                                  │
│    - Validar código                                     │
│    - Generar JWT firmado                                │
│    - Crear sesión en cookies HttpOnly                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 7. ACCESO AL PORTAL                                     │
│    - Middleware verifica sesión en cada petición        │
│    - API Proxy filtra datos de Airtable                 │
│    - CSP protege contra XSS                             │
└─────────────────────────────────────────────────────────┘
```

---

## 🚨 Resolución de Problemas

### Error: "No autenticado"

**Causa:** Las cookies no se están enviando correctamente.

**Solución:**
```typescript
// Verificar en next.config.mjs que está configurado:
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Access-Control-Allow-Credentials',
          value: 'true'
        }
      ]
    }
  ]
}
```

### Error: "Error al enviar OTP"

**Causa:** Proveedor de SMS/Email no configurado.

**Solución:**
1. Verificar que Twilio/MessageBird está configurado en Supabase
2. Verificar que las credenciales son correctas
3. Para desarrollo, puedes usar solo email (Gmail SMTP gratis)

### Error: "Usuario no encontrado en Airtable"

**Causa:** El técnico no existe o el campo de búsqueda es incorrecto.

**Solución:**
1. Verificar que el técnico existe en la tabla "Técnicos" de Airtable
2. Verificar que el campo se llama "Teléfono" o "Email" exactamente
3. Añadir el campo "Activo" (tipo Checkbox) en Airtable

---

## 📝 Notas Importantes

### Producción

Para desplegar en producción:

1. **Variables de Entorno en Vercel:**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Configurar Dominios en Supabase:**
   - Ve a **Authentication > URL Configuration**
   - Añade: `https://tecnicos.ritest.es`

3. **CORS en Supabase:**
   - Ve a **Settings > API**
   - Añade tu dominio a "Additional Redirect URLs"

### Costes

- **Supabase Free Tier:**
  - 50,000 usuarios activos mensuales
  - 500 MB de base de datos
  - Ilimitadas peticiones de API
  - **Perfecto para empezar**

- **Twilio:**
  - $15 USD de crédito inicial
  - ~$0.0075 por SMS a España
  - **Suficiente para ~2000 SMS**

### Monitoreo

Monitorea la seguridad en:
- **Supabase Dashboard > Logs**
- **Vercel Dashboard > Analytics**
- **Airtable > History** (para auditoría)

---

¿Tienes dudas? Contacta: soporte@ritest.com

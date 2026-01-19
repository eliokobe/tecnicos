# 🔧 Portal de Técnicos - Ritest

Portal web seguro para gestión de servicios técnicos con autenticación OTP y sincronización Airtable.

## 🔐 Sistema de Seguridad Implementado

✅ **Autenticación OTP** (Email/SMS)  
✅ **Sesiones HttpOnly** (protección XSS/CSRF)  
✅ **Middleware de rutas**  
✅ **Proxy API seguro**  
✅ **Sincronización Airtable ↔ Supabase**  

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.local` y añade tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

**📖 Ver [SECURITY.md](./SECURITY.md) para guía completa de configuración**

### 3. Ejecutar servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📚 Documentación

- **[SECURITY.md](./SECURITY.md)** - Guía de configuración de Supabase
- **[IMPLEMENTACION.md](./IMPLEMENTACION.md)** - Resumen de implementación
- **[API_EXAMPLES.md](./API_EXAMPLES.md)** - Ejemplos de uso de la API

## 🏗️ Estructura

```
/app
  /api
    /tecnico/auth       # Autenticación OTP
    /tecnico/servicios  # API protegida
  /parte               # Portal técnicos (protegido)
/lib
  /supabase           # Configuración Supabase
/middleware.ts        # Protección de rutas
```

## 🛡️ Características de Seguridad

| Característica | Estado |
|---------------|--------|
| OTP 2FA | ✅ |
| HttpOnly Cookies | ✅ |
| CSP Headers | ✅ |
| CSRF Protection | ✅ |
| API Proxy | ✅ |
| Route Protection | ✅ |

## 📦 Stack Tecnológico

- **Framework:** Next.js 14
- **Auth:** Supabase Auth
- **Database:** Airtable
- **UI:** Tailwind CSS + Radix UI
- **Forms:** React Hook Form

## 🔧 Desarrollo

```bash
npm run dev      # Servidor desarrollo
npm run build    # Build producción
npm run start    # Servidor producción
```

## 📞 Soporte

soporte@ritest.com

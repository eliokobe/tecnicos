# Guía de Despliegue - tecnicos.ritest.es

## 📋 Requisitos Previos

- Cuenta en Vercel, Netlify o similar
- Acceso al DNS de ritest.es
- Variables de entorno configuradas

## 🚀 Pasos para Desplegar

### 1. Preparar el Proyecto

```bash
npm run build
```

### 2. Configurar Variables de Entorno en Producción

En tu plataforma de hosting (Vercel/Netlify), configura estas variables:

```env
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://tecnicos.ritest.es

AIRTABLE_TOKEN=tu_token_aqui
AIRTABLE_BASE_ID=tu_base_id_aqui
AIRTABLE_TABLE_REPARACIONES=Reparaciones
AIRTABLE_TABLE_FORMULARIO=Formularios
AIRTABLE_TABLE_NAME=Servicios
AIRTABLE_TABLE_CLIENTES=Servicios
AIRTABLE_TABLE_SERVICIOS=Servicios
AIRTABLE_TABLE_ENVIOS=Envíos
AIRTABLE_TABLE_TECNICOS=Técnicos
```

### 3. Configurar DNS

Añade un registro CNAME en tu DNS:

```
Tipo: CNAME
Nombre: tecnicos
Valor: [tu-deployment-url] (ej: cname.vercel-dns.com)
TTL: Auto
```

### 4. Configurar Dominio Personalizado

#### En Vercel:
1. Ve a Project Settings → Domains
2. Añade `tecnicos.ritest.es`
3. Vercel te dará las instrucciones DNS específicas
4. Espera a que se genere el certificado SSL (automático)

#### En Netlify:
1. Ve a Site Settings → Domain Management
2. Añade custom domain `tecnicos.ritest.es`
3. Sigue las instrucciones DNS
4. SSL se configura automáticamente

### 5. Verificar el Despliegue

Una vez configurado, visita:
- https://tecnicos.ritest.es

Deberías ver:
- ✅ Certificado SSL válido (candado verde)
- ✅ Página de login funcional
- ✅ Sin errores de CORS
- ✅ API funcionando correctamente

## 🔧 Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción local
npm run start

# Lint
npm run lint
```

## 📝 Notas Importantes

- **Nunca** subas el archivo `.env.local` a Git
- Las variables de entorno deben configurarse en la plataforma de hosting
- Asegúrate de que SSL esté habilitado
- Verifica que todas las API keys sean las de producción

## 🐛 Solución de Problemas

### Error 404 en rutas
- Verifica que `vercel.json` esté configurado correctamente
- Asegúrate de que el build se completó sin errores

### Errores de API
- Verifica que todas las variables de entorno estén configuradas
- Comprueba los logs del servidor

### SSL no funciona
- Espera unos minutos después de configurar el dominio
- Verifica que el DNS esté propagado correctamente (usa https://dnschecker.org)

## 📞 Soporte

Si tienes problemas, revisa:
- Logs de Vercel/Netlify
- Console del navegador (F12)
- Network tab para ver requests fallidos

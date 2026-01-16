export interface Servicio {
  id: string
  fields: {
    'Nombre del Cliente'?: string
    'Cliente'?: string | string[]
    'Teléfono'?: string
    'Email'?: string
    'Tipo de Servicio'?: string
    'Dirección'?: string
    'Población'?: string
    'Población del cliente'?: string | string[]
    'Código postal'?: string | string[]
    'Provincia'?: string | string[]
    'Estado'?: string
    'Motivo'?: string
    'Fecha estado'?: string
    'Cita'?: string
    'Fecha de Servicio'?: string
    'Descripción'?: string
    'Notas Técnico'?: string
    'Enlace Cita'?: string
    'Cita técnico'?: string
    'ID Cliente'?: string
    'Reparaciones'?: string | string[]
    'Factura'?: string | string[]
  }
}

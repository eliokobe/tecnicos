import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Calendar, FileText, Phone, Clock, User, MapPin, Navigation, ClipboardList, MessageSquare, Send } from 'lucide-react'
import { Servicio } from '@/lib/tecnico-types'
import { getEstadoBadgeColor, getPasosResolucion } from '@/lib/tecnico-utils'

interface ServiceDialogProps {
  servicio: Servicio | null
  onClose: () => void
  onLoadServicios: () => void
  onShowSuccess: (message: string, type: 'accepted' | 'rejected', servicioId?: string) => void
}

export function ServiceDialog({ servicio, onClose, onLoadServicios, onShowSuccess }: ServiceDialogProps) {
  const [actionLoading, setActionLoading] = useState(false)
  const [modeloCargador, setModeloCargador] = useState<string>('')
  const [nuevoComentario, setNuevoComentario] = useState<string>('')
  const [enviandoComentario, setEnviandoComentario] = useState(false)

  if (!servicio) return null

  const handleAceptarServicio = async (servicioId: string) => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/tecnico/servicios', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          servicioId,
          estado: 'Aceptado',
        }),
      })

      if (!response.ok) {
        throw new Error('Error al aceptar servicio')
      }

      await onLoadServicios()
      onClose()
      onShowSuccess('Servicio aceptado correctamente', 'accepted', servicioId)
    } catch (err: any) {
      alert('Error al aceptar servicio: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRechazarServicio = async (servicioId: string) => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/tecnico/servicios', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          servicioId,
          estado: 'Rechazado',
        }),
      })

      if (!response.ok) {
        throw new Error('Error al rechazar servicio')
      }

      await onLoadServicios()
      onClose()
      onShowSuccess('Servicio rechazado correctamente', 'rejected')
    } catch (err: any) {
      alert('Error al rechazar servicio: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAgregarComentario = async () => {
    if (!nuevoComentario.trim()) return

    setEnviandoComentario(true)
    try {
      const comentariosActuales = servicio.fields['Comentarios técnico'] || ''
      const now = new Date()
      const timestamp = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      const nuevoComentarioConFecha = `${timestamp} ${nuevoComentario}`
      const comentariosActualizados = comentariosActuales 
        ? `${comentariosActuales}\n${nuevoComentarioConFecha}`
        : nuevoComentarioConFecha

      const response = await fetch('/api/tecnico/servicios', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          servicioId: servicio.id,
          comentarios: comentariosActualizados,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error del servidor:', errorData)
        throw new Error(errorData.error || 'Error al agregar comentario')
      }

      setNuevoComentario('')
      await onLoadServicios()
    } catch (err: any) {
      console.error('Error completo:', err)
      alert('Error al agregar comentario: ' + err.message)
    } finally {
      setEnviandoComentario(false)
    }
  }

  const navigateToCita = (reparacionId: string) => {
    window.location.href = `/cita?id=${reparacionId}`
  }

  const openParte = (reparacionId: string) => {
    window.open(`/parte?id=${reparacionId}`, '_blank')
  }

  const getReparacionId = () => {
    return servicio.fields.Reparaciones 
      ? (Array.isArray(servicio.fields.Reparaciones) 
          ? servicio.fields.Reparaciones[0] 
          : servicio.fields.Reparaciones)
      : servicio.id
  }

  return (
    <Dialog open={!!servicio} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onClose}
              className="hover:bg-gray-100 p-2 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex-1">
              <DialogTitle className="text-xl">
                {(Array.isArray(servicio.fields.Cliente) ? servicio.fields.Cliente[0] : servicio.fields.Cliente) || 'Cliente sin nombre'}
              </DialogTitle>
              <Badge className={getEstadoBadgeColor(servicio)}>
                {servicio.fields.Estado || 'Sin estado'}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="accion" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="accion">Acción</TabsTrigger>
            <TabsTrigger value="comentarios">
              Comentarios
            </TabsTrigger>
            <TabsTrigger value="pasos">
              Pasos
            </TabsTrigger>
            <TabsTrigger value="ubicacion">
              Ubicación
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accion" className="space-y-4 mt-4">
            {servicio.fields.Estado?.toLowerCase() === 'asignado' ? (
              <>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">
                    Información del Cliente
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-[#008606] mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600">Cliente</p>
                        <p className="text-sm font-medium text-gray-900">
                          {(Array.isArray(servicio.fields.Cliente) ? servicio.fields.Cliente[0] : servicio.fields.Cliente) || 'No especificado'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-[#008606] mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600">Teléfono</p>
                        <p className="text-sm font-medium text-gray-900">
                          {servicio.fields['Teléfono'] || 'No especificado'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-[#008606] mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600">Fecha creación</p>
                        <p className="text-sm font-medium text-gray-900">
                          {servicio.fields['Fecha creación']
                            ? new Date(servicio.fields['Fecha creación'] as string).toLocaleString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'No especificada'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAceptarServicio(servicio.id)}
                    disabled={actionLoading}
                    className="flex-1 bg-[#008606] hover:bg-[#008606]/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => handleRechazarServicio(servicio.id)}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-base font-semibold text-gray-900 mb-3">
                  Información del Cliente
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-[#008606] mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Teléfono</p>
                      <p className="text-sm font-medium text-gray-900">
                        {servicio.fields['Teléfono'] || 'No especificado'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-[#008606] mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Cita</p>
                      <p className="text-sm font-medium text-gray-900">
                        {servicio.fields['Cita técnico'] || servicio.fields['Cita']
                          ? new Date((servicio.fields['Cita técnico'] || servicio.fields['Cita']) as string).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'No especificada'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-[#008606] mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Fecha creación</p>
                      <p className="text-sm font-medium text-gray-900">
                        {servicio.fields['Fecha creación']
                          ? new Date(servicio.fields['Fecha creación'] as string).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'No especificada'}
                      </p>
                    </div>
                  </div>
                  
                  {servicio.fields['Descripción'] && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Descripción</p>
                      <p className="text-sm font-medium text-gray-900">{servicio.fields['Descripción']}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {servicio.fields.Estado?.toLowerCase() === 'aceptado' && (
              <button
                onClick={() => navigateToCita(getReparacionId())}
                className="w-full bg-[#008606] hover:bg-[#008606]/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Programar Cita
              </button>
            )}
            
            {servicio.fields.Estado?.toLowerCase() === 'citado' && (
              <>
                {servicio.fields['Cita técnico'] && (
                  <Alert className="border-green-200 bg-green-50 mb-3">
                    <FileText className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-sm text-green-800">
                      Cita programada: {servicio.fields['Cita técnico']}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-3">
                  <button
                    onClick={() => openParte(getReparacionId())}
                    className="w-full bg-[#008606] hover:bg-[#008606]/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Abrir Parte de Trabajo
                  </button>
                  <button
                    onClick={() => navigateToCita(getReparacionId())}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Reprogramar Cita
                  </button>
                </div>
              </>
            )}

            {(servicio.fields.Estado?.toLowerCase() === 'reparado' || servicio.fields.Estado?.toLowerCase() === 'no reparado') && (
              <>
                {servicio.fields.Factura && Array.isArray(servicio.fields.Factura) && servicio.fields.Factura.length > 0 ? (
                  <Alert className="border-green-200 bg-green-50 mb-3">
                    <FileText className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-sm text-green-800">
                      Ya hay una factura subida
                    </AlertDescription>
                  </Alert>
                ) : null}
                <button
                  onClick={() => openParte(getReparacionId())}
                  className="w-full bg-[#008606] hover:bg-[#008606]/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Adjuntar Factura
                </button>
              </>
            )}
          </TabsContent>

          <TabsContent value="ubicacion" className="space-y-4 mt-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-base font-semibold text-gray-900 mb-3">
                Ubicación
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-[#008606] mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Dirección</p>
                    <p className="text-sm font-medium text-gray-900">
                      {servicio.fields['Dirección'] || 'No especificada'}
                    </p>
                  </div>
                </div>

                {(servicio.fields['Código postal'] || (Array.isArray(servicio.fields['Código postal']) && servicio.fields['Código postal'].length > 0)) && (
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-1">Código Postal</p>
                      <p className="text-sm font-medium text-gray-900">
                        {Array.isArray(servicio.fields['Código postal']) 
                          ? servicio.fields['Código postal'][0] 
                          : servicio.fields['Código postal']}
                      </p>
                    </div>
                  </div>
                )}

                {(servicio.fields['Población'] || servicio.fields['Población del cliente']) && (
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-1">Población</p>
                      <p className="text-sm font-medium text-gray-900">
                        {Array.isArray(servicio.fields['Población del cliente']) 
                          ? servicio.fields['Población del cliente'][0] 
                          : servicio.fields['Población del cliente'] || servicio.fields['Población']}
                      </p>
                    </div>
                  </div>
                )}

                {(servicio.fields['Provincia'] || (Array.isArray(servicio.fields['Provincia']) && servicio.fields['Provincia'].length > 0)) && (
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-1">Provincia</p>
                      <p className="text-sm font-medium text-gray-900">
                        {Array.isArray(servicio.fields['Provincia']) 
                          ? servicio.fields['Provincia'][0] 
                          : servicio.fields['Provincia']}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {servicio.fields['Dirección'] && (
              <button
                onClick={() => {
                  const direccion = servicio.fields['Dirección']
                  const codigoPostal = Array.isArray(servicio.fields['Código postal']) 
                    ? servicio.fields['Código postal'][0] 
                    : servicio.fields['Código postal'] || ''
                  const direccionCompleta = `${direccion} ${codigoPostal}`.trim()
                  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta)}`
                  window.open(url, '_blank', 'noopener,noreferrer')
                }}
                className="w-full bg-[#008606] hover:bg-[#008606]/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Abrir en maps
              </button>
            )}
          </TabsContent>

          <TabsContent value="pasos" className="space-y-4 mt-4">
            {servicio.fields['Motivo'] ? (() => {
              const motivoTecnico = servicio.fields['Motivo']
              const { pasos, requiereModelo } = getPasosResolucion(motivoTecnico, modeloCargador)
              
              return (
                <>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-base font-semibold text-gray-900 mb-3">
                      Pasos de Resolución
                    </h4>
                    
                    {requiereModelo && (
                      <div className="mb-4">
                        <Label className="text-sm font-medium text-gray-700 mb-3 block">
                          Selecciona el modelo del cargador:
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setModeloCargador('Pulsar Max')}
                            className={`p-4 border-2 rounded-lg font-semibold text-sm transition-all ${
                              modeloCargador === 'Pulsar Max'
                                ? 'border-[#008606] bg-[#008606] text-white'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            Pulsar Max
                          </button>
                          <button
                            onClick={() => setModeloCargador('Pulsar Plus')}
                            className={`p-4 border-2 rounded-lg font-semibold text-sm transition-all ${
                              modeloCargador === 'Pulsar Plus'
                                ? 'border-[#008606] bg-[#008606] text-white'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            Pulsar Plus
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {(!requiereModelo || modeloCargador) && (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-600 mb-2">
                          Motivo técnico: <span className="font-medium text-gray-900">{motivoTecnico}</span>
                        </p>
                        <ol className="space-y-3">
                          {pasos.map((paso, index) => (
                            <li key={index} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-[#008606] text-white rounded-full flex items-center justify-center text-xs font-semibold">
                                {index + 1}
                              </span>
                              <span className="text-sm text-gray-800 flex-1 pt-0.5">
                                {paso}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </>
              )
            })() : (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <p className="text-sm text-gray-600">No hay motivo técnico especificado para este servicio</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comentarios" className="space-y-4 mt-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comentarios
              </h4>
              
              {/* Comentarios anteriores */}
              <div className="mb-4 space-y-2 max-h-[400px] overflow-y-auto">
                {servicio.fields['Comentarios técnico'] ? (
                  servicio.fields['Comentarios técnico'].split('\n').map((comentario, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-800">{comentario}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No hay comentarios aún</p>
                )}
              </div>
              
              {/* Nuevo comentario */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Escribe un comentario..."
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
                <button
                  onClick={handleAgregarComentario}
                  disabled={enviandoComentario || !nuevoComentario.trim()}
                  className="w-full bg-[#008606] hover:bg-[#008606]/90 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {enviandoComentario ? 'Enviando...' : 'Agregar comentario'}
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

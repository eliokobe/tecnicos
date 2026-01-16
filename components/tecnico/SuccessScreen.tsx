import { CheckCircle } from 'lucide-react'
import { Servicio } from '@/lib/tecnico-types'

interface SuccessScreenProps {
  successMessage: string
  successType: 'accepted' | 'rejected'
  acceptedServicioId: string | null
  servicios: Servicio[]
  onBack: () => void
}

export function SuccessScreen({ 
  successMessage, 
  successType, 
  acceptedServicioId,
  servicios,
  onBack 
}: SuccessScreenProps) {
  const handleAgendarCita = () => {
    // Buscar el servicio aceptado para obtener el ID de la reparación
    const servicio = servicios.find(s => s.id === acceptedServicioId)
    const reparacionId = servicio?.fields?.Reparaciones 
      ? (Array.isArray(servicio.fields.Reparaciones) 
          ? servicio.fields.Reparaciones[0] 
          : servicio.fields.Reparaciones)
      : acceptedServicioId
    window.location.href = `/cita?id=${reparacionId}`
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white text-center max-w-md mx-auto w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {successType === 'accepted' ? 'Servicio Aceptado' : '¡Éxito!'}
        </h2>
        <p className="text-gray-600 mb-6">
          {successMessage}
        </p>
        {successType === 'accepted' && acceptedServicioId ? (
          <>
            <p className="text-gray-700 font-medium mb-6">
              ¿Quieres continuar para agendar la cita?
            </p>
            <div className="space-y-3">
              <button
                onClick={handleAgendarCita}
                className="w-full bg-[#008606] hover:bg-[#008606]/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sí, agendar cita
              </button>
              <button
                onClick={onBack}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                No, volver al portal
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={onBack}
            className="w-full bg-[#008606] hover:bg-[#008606]/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Volver al Portal
          </button>
        )}
      </div>
    </div>
  )
}

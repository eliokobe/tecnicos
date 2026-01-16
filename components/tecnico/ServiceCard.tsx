import { Badge } from '@/components/ui/badge'
import { Servicio } from '@/lib/tecnico-types'
import { getEstadoBadgeColor } from '@/lib/tecnico-utils'

interface ServiceCardProps {
  servicio: Servicio
  onClick: (servicio: Servicio) => void
}

export function ServiceCard({ servicio, onClick }: ServiceCardProps) {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-[#008606] hover:shadow-sm transition-all duration-200"
      onClick={() => onClick(servicio)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 text-sm flex-1 line-clamp-2">
          {(Array.isArray(servicio.fields.Cliente) ? servicio.fields.Cliente[0] : servicio.fields.Cliente) || 'Cliente sin nombre'}
        </h3>
        <Badge className={`${getEstadoBadgeColor(servicio)} text-[10px] px-2 py-0.5`}>
          {servicio.fields.Estado || 'Sin estado'}
        </Badge>
      </div>
      
      {servicio.fields['Motivo'] && (
        <div className="text-xs text-gray-600 line-clamp-2">
          <span className="font-medium">Motivo: </span>
          <span>{servicio.fields['Motivo']}</span>
        </div>
      )}
    </div>
  )
}

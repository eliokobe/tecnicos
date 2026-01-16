import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { X } from 'lucide-react'

interface Resource {
  title: string
  href: string
  type: string
  isLocal?: boolean
}

interface ResourceDialogProps {
  resource: Resource | null
  onClose: () => void
}

export function ResourceDialog({ resource, onClose }: ResourceDialogProps) {
  if (!resource) return null

  return (
    <Dialog open={!!resource} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[95vh] p-0 gap-0">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {resource.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {resource.type}
            </DialogDescription>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden" style={{ height: 'calc(95vh - 80px)' }}>
          {resource.isLocal ? (
            <iframe
              src={resource.href}
              className="w-full h-full border-0"
              title={resource.title}
              style={{ minHeight: '600px' }}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Este recurso se abrirá en una nueva pestaña</p>
                <a
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#008606] text-white rounded-lg hover:bg-[#007405] transition-colors"
                >
                  Abrir recurso
                </a>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

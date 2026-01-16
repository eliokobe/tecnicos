'use client'

import { useState, useEffect } from 'react'
import { Clock, FileText } from 'lucide-react'
import { Servicio } from '@/lib/tecnico-types'
import { LoginForm } from '@/components/tecnico/LoginForm'
import { SuccessScreen } from '@/components/tecnico/SuccessScreen'
import { ServiceCard } from '@/components/tecnico/ServiceCard'
import { ServiceDialog } from '@/components/tecnico/ServiceDialog'
import { NavigationBar } from '@/components/tecnico/NavigationBar'

export default function TecnicoPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [tecnicoData, setTecnicoData] = useState<any>(null)
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loadingServicios, setLoadingServicios] = useState(false)
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null)
  const [ocultarFinalizados, setOcultarFinalizados] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [acceptedServicioId, setAcceptedServicioId] = useState<string | null>(null)
  const [successType, setSuccessType] = useState<'accepted' | 'rejected'>('accepted')

  // Cargar sesión guardada al montar el componente
  useEffect(() => {
    const savedTecnico = localStorage.getItem('tecnicoData')
    if (savedTecnico) {
      try {
        const data = JSON.parse(savedTecnico)
        setTecnicoData(data)
        setIsAuthenticated(true)
        loadServicios(data.id, data.fields?.Teléfono)
      } catch (err) {
        console.error('Error al cargar sesión guardada:', err)
        localStorage.removeItem('tecnicoData')
      }
    }
  }, [])

  const handleLoginSuccess = async (data: any) => {
    setTecnicoData(data)
    setIsAuthenticated(true)
    await loadServicios(data.id, data.fields?.Teléfono)
  }

  const loadServicios = async (tecnicoId?: string, tecnicoTelefono?: string) => {
    const id = tecnicoId || tecnicoData?.id
    const telefono = tecnicoTelefono || tecnicoData?.fields?.Teléfono
    if (!id || !telefono) return

    setLoadingServicios(true)
    try {
      const response = await fetch(`/api/tecnico/servicios?telefono=${encodeURIComponent(telefono)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar servicios')
      }

      setServicios(data.servicios || [])
    } catch (err: any) {
      console.error('Error al cargar servicios:', err)
    } finally {
      setLoadingServicios(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('tecnicoData')
    setIsAuthenticated(false)
    setTecnicoData(null)
    setServicios([])
  }

  const handleShowSuccess = (message: string, type: 'accepted' | 'rejected', servicioId?: string) => {
    setSuccessMessage(message)
    setSuccessType(type)
    if (servicioId) setAcceptedServicioId(servicioId)
    setShowSuccess(true)
  }

  const handleBackFromSuccess = () => {
    setShowSuccess(false)
    setSuccessMessage('')
    setAcceptedServicioId(null)
    loadServicios()
  }

  const filterServicios = (servicio: Servicio) => {
    const estado = servicio.fields.Estado?.toLowerCase()
    const cliente = Array.isArray(servicio.fields.Cliente) ? servicio.fields.Cliente[0] : servicio.fields.Cliente || ''
    const motivo = servicio.fields.Motivo || ''
    
    // Filtro de búsqueda
    const matchesSearch = searchTerm === '' || 
      cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof motivo === 'string' && motivo.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (!matchesSearch) return false
    
    if (ocultarFinalizados) {
      // Mostrar solo: Asignado, Aceptado, Citado (ocultar Reparado y No reparado)
      return estado === 'asignado' || 
             estado === 'aceptado' || 
             estado === 'citado'
    }
    // Mostrar todos
    return true
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }

  if (showSuccess) {
    return (
      <SuccessScreen
        successMessage={successMessage}
        successType={successType}
        acceptedServicioId={acceptedServicioId}
        servicios={servicios}
        onBack={handleBackFromSuccess}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Servicios</h1>
        
        {/* Barra de búsqueda estilo WhatsApp */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-4 pr-4 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008606] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Botón filtro */}
        <div className="mb-6">
          <button
            onClick={() => setOcultarFinalizados(!ocultarFinalizados)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              ocultarFinalizados 
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Ocultar finalizados
          </button>
        </div>
        
        {/* Grid de servicios */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {loadingServicios ? (
              <div className="col-span-full text-center py-16">
                <Clock className="w-8 h-8 text-[#008606] animate-spin mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Cargando servicios...</p>
              </div>
            ) : servicios.filter(filterServicios).length === 0 ? (
              <div className="col-span-full text-center py-16">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No tienes servicios asignados</p>
              </div>
            ) : (
              servicios.filter(filterServicios).map((servicio) => (
                <ServiceCard
                  key={servicio.id}
                  servicio={servicio}
                  onClick={setSelectedServicio}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <ServiceDialog
        servicio={selectedServicio}
        onClose={() => setSelectedServicio(null)}
        onLoadServicios={loadServicios}
        onShowSuccess={handleShowSuccess}
      />

      <NavigationBar onLogout={handleLogout} />
    </div>
  )
}

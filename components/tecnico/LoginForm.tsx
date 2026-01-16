import { useState } from 'react'
import { Phone } from 'lucide-react'

interface LoginFormProps {
  onLoginSuccess: (tecnicoData: any) => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [telefono, setTelefono] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/tecnico/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telefono: telefono.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al autenticar')
      }

      // Guardar datos del técnico en localStorage
      localStorage.setItem('tecnicoData', JSON.stringify(data.tecnico))
      
      onLoginSuccess(data.tecnico)
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(120% 120% at 100% 0%, #008606 0%, #ffffff 55%), radial-gradient(120% 120% at 0% 100%, #008606 0%, #ffffff 60%)'
      }}
    >
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <img src="/Logo.png" alt="Ritest" className="mx-auto mb-4 h-16 w-auto" />
          <p className="text-gray-600 mt-2">Portal de Técnicos</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="telefono"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#008606] focus:border-transparent"
                placeholder="612345678"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#008606] text-white py-3 px-4 rounded-full font-medium hover:bg-[#008606]/90 focus:ring-2 focus:ring-[#008606] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            ¿Necesitas ayuda?{' '}
            <a href="mailto:soporte@ritest.com" className="text-[#008606] hover:underline">
              Contacta soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Mail, Lock } from 'lucide-react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

interface LoginFormProps {
  onLoginSuccess: (tecnicoData: any) => void
}

/**
 * NUEVO FLUJO DE AUTENTICACIÓN SEGURA
 * 
 * Fase 1: Validación en Airtable
 * Fase 2: Sincronización con Supabase
 * Fase 3: Envío de OTP
 * Fase 4: Verificación y creación de sesión segura
 */

type AuthStep = 'credentials' | 'otp'
type AuthMethod = 'email' | 'phone' | null

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [step, setStep] = useState<AuthStep>('credentials')
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [authValue, setAuthValue] = useState('')
  const [nombreTecnico, setNombreTecnico] = useState('')

  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // PASO 1 y 2: Validar y Sincronizar (Just-In-Time)
      const response = await fetch('/api/tecnico/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al validar técnico')
      }

      console.log('✅ Técnico validado:', data.data.nombre)
      
      // Guardar información para el siguiente paso
      setAuthMethod(data.data.authMethod)
      setAuthValue(data.data.authValue)
      setNombreTecnico(data.data.nombre)

      // PASO 3: Solicitar envío de OTP
      const otpResponse = await fetch('/api/tecnico/auth/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authMethod: data.data.authMethod,
          authValue: data.data.authValue,
        }),
      })

      const otpData = await otpResponse.json()

      if (!otpResponse.ok) {
        throw new Error(otpData.error || 'Error al enviar código')
      }

      console.log('✅ OTP enviado')
      
      // Pasar al paso de verificación OTP
      setStep('otp')

    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      setError('El código debe tener 6 dígitos')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // PASO 4: Verificar OTP y crear sesión
      const response = await fetch('/api/tecnico/auth/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authMethod,
          authValue,
          otp,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al verificar código')
      }

      console.log('✅ Autenticación exitosa')
      console.log('🔐 Sesión creada en cookies HttpOnly')
      
      // La sesión ya está en las cookies, no guardamos nada en localStorage
      onLoginSuccess(data.data.tecnico)

    } catch (err: any) {
      setError(err.message || 'Error al verificar código')
      setOtp('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/tecnico/auth/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authMethod,
          authValue,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al reenviar código')
      }

      setOtp('')
      alert('Código reenviado correctamente')

    } catch (err: any) {
      setError(err.message || 'Error al reenviar código')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setStep('credentials')
    setOtp('')
    setError('')
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

        {step === 'credentials' ? (
          <form onSubmit={handleSubmitCredentials} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#008606] focus:border-transparent"
                  placeholder="email@ritest.es"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full bg-[#008606] text-white py-3 px-4 rounded-full font-medium hover:bg-[#008606]/90 focus:ring-2 focus:ring-[#008606] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Verificando...' : 'Continuar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitOTP} className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Lock className="h-8 w-8 text-[#008606]" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">Código de verificación</h2>
              <p className="text-sm text-gray-500 mt-1">
                Hola {nombreTecnico}
              </p>
              <p className="text-sm text-gray-500">
                Hemos enviado un código de 6 dígitos a tu {authMethod === 'email' ? 'email' : 'teléfono'}
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-[#008606] text-white py-3 px-4 rounded-full font-medium hover:bg-[#008606]/90 focus:ring-2 focus:ring-[#008606] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Verificando...' : 'Verificar Código'}
            </button>

            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-800"
                disabled={isLoading}
              >
                ← Volver
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-[#008606] hover:underline"
                disabled={isLoading}
              >
                Reenviar código
              </button>
            </div>
          </form>
        )}

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

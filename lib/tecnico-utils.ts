import { Servicio } from './tecnico-types'

export function getEstadoBadgeColor(servicio: Servicio): string {
  const estado = servicio.fields.Estado?.toLowerCase()
  const fechaEstado = servicio.fields['Fecha estado']
  const fechaCita = servicio.fields['Cita']
  
  // Excepciones: No aplicar naranja en estos casos
  if (estado === 'no reparado' || estado === 'finalizado') {
    return 'bg-[#008606]'
  }
  
  // Si está citado y la fecha de cita no ha llegado, no aplicar naranja
  if (estado === 'citado' && fechaCita) {
    const citaDate = new Date(fechaCita)
    const now = new Date()
    if (citaDate > now) {
      return 'bg-[#008606]'
    }
  }
  
  // Verificar si han pasado 24 horas desde fecha estado
  if (fechaEstado) {
    const fechaEstadoDate = new Date(fechaEstado)
    const now = new Date()
    const diffHours = (now.getTime() - fechaEstadoDate.getTime()) / (1000 * 60 * 60)
    
    if (diffHours >= 24) {
      return 'bg-orange-500'
    }
  }
  
  return 'bg-[#008606]'
}

export function getPasosResolucion(motivo: string | string[] | undefined, modeloCargador?: string): { pasos: string[], requiereModelo: boolean } {
  // Convertir a string si es un array o manejar undefined/null
  const motivoStr = Array.isArray(motivo) ? motivo[0] : (motivo || '')
  const motivoLower = typeof motivoStr === 'string' ? motivoStr.toLowerCase() : ''
  
  // Sustituir cargador
  if (motivoLower.includes('sustituir cargador')) {
    return {
      pasos: [
        'Retirar el equipo antiguo',
        'Instalar el nuevo',
        'Vincular el cargador a la app',
        'Configurar la app del cargador (potencia, horarios, GDP y Carga solar si aplica…)',
        'Completar el parte de trabajo'
      ],
      requiereModelo: false
    }
  }
  
  // Sustituir protecciones
  if (motivoLower.includes('sustituir protecciones')) {
    return {
      pasos: [
        'Retirar el componente antiguo',
        'Instalar el nuevo',
        'Hacer comprobaciones de correcto funcionamiento',
        'Completar el parte de trabajo'
      ],
      requiereModelo: false
    }
  }
  
  // Sustituir GDP
  if (motivoLower.includes('sustituir gdp')) {
    return {
      pasos: [
        'Retirar el GDO antiguo',
        'Instalar el nuevo',
        'Hacer comprobaciones de correcto funcionamiento',
        'Completar el parte de trabajo'
      ],
      requiereModelo: false
    }
  }
  
  // Sustituir borna doble
  if (motivoLower.includes('sustituir borna doble')) {
    return {
      pasos: [
        'Comprar la borna doble',
        'Retirar la borna antigua',
        'Instalar la nueva',
        'Hacer comprobaciones de correcto funcionamiento',
        'Completar el parte de trabajo'
      ],
      requiereModelo: false
    }
  }
  
  // Diferencial monofásico averiado
  if (motivoLower.includes('diferencial monofásico averiado')) {
    return {
      pasos: [
        'Comprobar tensión de entrada y salida con el multímetro',
        'Pulsar botón de test para confirmar el fallo mecánico',
        'Retirar el componente averiado e instalar el nuevo',
        'Verificar el correcto apriete de los bornes',
        'Completar el parte de trabajo'
      ],
      requiereModelo: false
    }
  }
  
  // Diferencial trifásico averiado
  if (motivoLower.includes('diferencial trifásico averiado')) {
    return {
      pasos: [
        'Comprobar tensión de entrada y salida con el multímetro',
        'Pulsar botón de test para confirmar el fallo mecánico',
        'Retirar el componente averiado e instalar el nuevo',
        'Verificar el correcto apriete de los bornes',
        'Completar el parte de trabajo'
      ],
      requiereModelo: false
    }
  }
  
  // Sobretensiones monofásico averiado
  if (motivoLower.includes('sobretensiones monofásico averiado')) {
    return {
      pasos: [
        'Comprobar si el indicador visual de la protección está en rojo (fallo)',
        'Medir tensión de entrada para descartar anomalías en la red',
        'Retirar el componente averiado e instalar el nuevo',
        'Verificar la correcta conexión de la toma de tierra',
        'Completar el parte de trabajo'
      ],
      requiereModelo: false
    }
  }
  
  // Sobretensiones trifásico averiado
  if (motivoLower.includes('sobretensiones trifásico averiado')) {
    return {
      pasos: [
        'Comprobar si el indicador visual de la protección está en rojo (fallo)',
        'Medir tensión de entrada para descartar anomalías en la red',
        'Retirar el componente averiado e instalar el nuevo',
        'Verificar la correcta conexión de la toma de tierra',
        'Completar el parte de trabajo'
      ],
      requiereModelo: false
    }
  }
  
  // Cargador apagado
  if (motivoLower.includes('cargador apagado')) {
    return {
      pasos: [
        'Comprobar tensión en los bornes de entrada del cargador',
        'Revisar el estado de las conexiones internas y fusibles de la placa',
        'Realizar un rearme eléctrico completo desde el cuadro general',
        'Si tras el rearme no enciende, proceder a la sustitución del equipo',
        'Completar el parte de trabajo'
      ],
      requiereModelo: false
    }
  }
  
  // Carga a menor potencia
  if (motivoLower.includes('carga a menor potencia')) {
    return {
      pasos: [
        'Revisar la configuración de potencia del cargador tanto en la página principal cómo en la sección "Gestión de la carga"',
        'Revisar que no tenga activada ninguna opción de "Carga solar"',
        'Revisar si existe alguna limitación en el coche',
        'Restaurar el equipo por la placa electrónica',
        'Completar el parte de trabajo'
      ],
      requiereModelo: false
    }
  }
  
  // Carga en espera
  if (motivoLower.includes('carga en espera')) {
    return {
      pasos: [
        'Comprobar que el coche no esté lleno',
        'Revisar la programación del cargador',
        'Revisar la programación del coche',
        'Restaurar el equipo por la placa electrónica',
        'Completar el parte de trabajo'
      ],
      requiereModelo: false
    }
  }
  
  // Salta la luz del contador - requiere modelo
  if (motivoLower.includes('salta la luz del contador')) {
    if (modeloCargador?.toLowerCase().includes('max')) {
      return {
        pasos: [
          'Comprobar que el GDP esté correctamente configurado en la app',
          'Comprobar que la pinza amperimétrica esté correctamente instalada y que sólo mida el consumo de la vivienda',
          'Comprobar que tiene la resistencia el GDP',
          'Pon el interruptor PWR BOOS de la placa electrónica en la posición T',
          'Completar el parte de trabajo'
        ],
        requiereModelo: false
      }
    } else if (modeloCargador?.toLowerCase().includes('plus')) {
      return {
        pasos: [
          'Comprobar que el GDP esté correctamente configurado en la app',
          'Comprobar que la pinza amperimétrica esté correctamente instalada y que sólo mida el consumo de la vivienda',
          'Comprobar que tiene la resistencia el GDP',
          'Pon el interruptor RS485 de la placa electrónica en la posición T',
          'Completar el parte de trabajo'
        ],
        requiereModelo: false
      }
    }
    return {
      pasos: ['Especificar si es Pulsar Max o Pulsar Plus'],
      requiereModelo: true
    }
  }
  
  // Instalación GDP - requiere modelo
  if (motivoLower.includes('instalación gdp')) {
    if (modeloCargador?.toLowerCase().includes('max')) {
      return {
        pasos: [
          'Instalar el cableado del GDP',
          'Instalar el GDP poniendo las pinzas en correcto orden',
          'Pon el interruptor PWR BOOS de la placa electrónica en la posición T',
          'Poner la resistencia del GDP',
          'Completar el parte de trabajo'
        ],
        requiereModelo: false
      }
    } else if (modeloCargador?.toLowerCase().includes('plus')) {
      return {
        pasos: [
          'Instalar el cableado del GDP',
          'Instalar el GDP poniendo las pinzas en correcto orden',
          'Pon el interruptor RS485 de la placa electrónica en la posición T',
          'Poner la resistencia del GDP',
          'Completar el parte de trabajo'
        ],
        requiereModelo: false
      }
    }
    return {
      pasos: ['Especificar si es Pulsar Max o Pulsar Plus'],
      requiereModelo: true
    }
  }
  
  // No se conecta por bluetooth
  if (motivoLower.includes('no se conecta por bluetooth')) {
    return {
      pasos: [
        'Hacer una restauración de placa electrónica',
        'Mientras se restaura hay que borrar el dispositivo que empieza por WB- en el Bluetooth del móvil',
        'Una vez restaurado se debe vincular el cargador a la app Wallbox',
        'Si esto no funciona se debe probar a hacer el mismo procedimiento pero con otro móvil'
      ],
      requiereModelo: false
    }
  }
  
  // No reconoce el GDP
  if (motivoLower.includes('no reconoce el gdp')) {
    return {
      pasos: [
        'Comprobar posición cables según diagrama',
        'Medir 12v en las conexiones inferiores del N1CT',
        'Si hay 12v, el N1CT debe mostrar un led rojo',
        'Una vez resuelta cualquier irregularidad, el cargador wallbox se reinicia desde el cuadro eléctrico para que detecte los cambios'
      ],
      requiereModelo: false
    }
  }
  
  // Otros
  return {
    pasos: [
      'Revisar Motivo técnico y si tienes dudas consultar con el número de soporte para técnicos que es el 633 177 456'
    ],
    requiereModelo: false
  }
}

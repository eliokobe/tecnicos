import { NextRequest, NextResponse } from 'next/server';
import { getRecordById, updateServicioRecord } from '@/lib/airtable';

// POST - Actualizar estado del servicio según el resultado de la reparación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repairRecordId, resultado } = body;

    if (!repairRecordId) {
      return NextResponse.json(
        { error: 'Se requiere repairRecordId' },
        { status: 400 }
      );
    }

    // 1. Leer el registro de Reparaciones
    const repairRecord = await getRecordById('Formularios', repairRecordId);
    
    if (!repairRecord || !repairRecord.fields) {
      return NextResponse.json(
        { error: 'Registro de reparación no encontrado' },
        { status: 404 }
      );
    }

    // 2. Extraer el campo Servicios (linked record - es un array)
    const serviciosIds = repairRecord.fields['Servicios'];
    
    if (!serviciosIds || !Array.isArray(serviciosIds) || serviciosIds.length === 0) {
      return NextResponse.json(
        { error: 'No se encontró un servicio vinculado' },
        { status: 404 }
      );
    }

    // 3. Tomar el primer ID
    const servicioId = serviciosIds[0];

    // 4. Determinar los valores según el resultado
    const nuevoEstado = resultado === 'Reparado' ? 'Finalizado' : 'Pendiente revisión';
    const resolucionVisita = resultado === 'Reparado' ? 'Presencial' : undefined;

    // 5. Actualizar ese registro en tabla Servicios
    const updateData: Record<string, any> = {
      Estado: nuevoEstado
    };

    // Solo agregar Resolución visita si es Reparado
    if (resolucionVisita) {
      updateData['Resolución visita'] = resolucionVisita;
    }

    await updateServicioRecord(servicioId, updateData);

    return NextResponse.json({ 
      success: true, 
      servicioId,
      nuevoEstado,
      resolucionVisita: resolucionVisita || 'sin cambios',
      message: `Servicio actualizado a ${nuevoEstado}${resolucionVisita ? ' con Resolución visita: ' + resolucionVisita : ''}` 
    });

  } catch (error: any) {
    console.error('Error en POST /api/repairs/finalize:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el servicio', details: error.message },
      { status: 500 }
    );
  }
}

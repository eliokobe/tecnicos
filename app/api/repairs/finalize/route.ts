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

    // 4. Determinar el estado según el resultado
    const nuevoEstado = resultado === 'Reparado' ? 'Finalizado' : 'Pendiente revisión';

    // 5. Actualizar ese registro en tabla Servicios
    await updateServicioRecord(servicioId, {
      Estado: nuevoEstado
    });

    return NextResponse.json({ 
      success: true, 
      servicioId,
      nuevoEstado,
      message: `Servicio actualizado a ${nuevoEstado}` 
    });

  } catch (error: any) {
    console.error('Error en POST /api/repairs/finalize:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el servicio', details: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getRecordById, updateServicioRecord, getServicioById, createEnvio } from '@/lib/airtable';

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

    // 6. Si resultado es "Reparado", acción es "Sustitución" y material es "Cargador", crear registro en Envíos
    let envioCreado = null;
    const accion = repairRecord.fields['¿Qué acción se ha realizado?'] || repairRecord.fields['Reparación'];
    const material = repairRecord.fields['Material'];
    
    if (resultado === 'Reparado' && accion === 'Sustitución' && material === 'Cargador') {
      try {
        // Obtener los datos completos del servicio
        const servicioData = await getServicioById(servicioId);
        
        if (servicioData && servicioData.fields) {
          const fields = servicioData.fields;
          
          // Crear el registro en Envíos
          const envioResult = await createEnvio({
            'Cliente': fields['Cliente'],
            'Dirección': fields['Dirección'],
            'Población': fields['Población'],
            'Código postal': fields['Código postal'],
            'Provincia': fields['Provincia'],
            'Teléfono': fields['Teléfono'],
            'Transporte': 'Inbound Logística',
            'Estado': 'Pendiente recogida',
            'Servicio': [servicioId]
          });
          
          envioCreado = envioResult.id;
          console.log('✅ Envío creado:', envioCreado);
        }
      } catch (error) {
        console.error('Error al crear envío:', error);
        // No lanzamos el error para no interrumpir el flujo principal
      }
    }

    return NextResponse.json({ 
      success: true, 
      servicioId,
      nuevoEstado,
      envioCreado,
      message: `Servicio actualizado a ${nuevoEstado}${envioCreado ? ' y envío creado' : ''}` 
    });

  } catch (error: any) {
    console.error('Error en POST /api/repairs/finalize:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el servicio', details: error.message },
      { status: 500 }
    );
  }
}

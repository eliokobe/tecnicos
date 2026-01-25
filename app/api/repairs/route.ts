import { NextRequest, NextResponse } from 'next/server';
import {
  getRepairById,
  findRepairByExpediente,
  updateRepairRecord,
  createRepair,
  getFormularioById,
  findFormularioByExpediente,
  updateFormulario,
  createFormulario
} from '@/lib/airtable';

// GET - Obtener reparación por ID, expediente o record
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const expediente = searchParams.get('expediente');
    const record = searchParams.get('record');

    if (!id && !expediente && !record) {
      return NextResponse.json(
        { error: 'Se requiere id, expediente o record' },
        { status: 400 }
      );
    }

    let repairData;

    // Buscar por ID directo
    if (id) {
      try {
        // Primero intentar buscar en tabla de Reparaciones
        repairData = await getRepairById(id);
      } catch (error) {
        // Si falla, intentar en tabla de Formularios
        try {
          repairData = await getFormularioById(id);
        } catch (formError) {
          return NextResponse.json(
            { error: 'Reparación no encontrada' },
            { status: 404 }
          );
        }
      }
    }

    // Buscar por expediente
    if (expediente && !repairData) {
      try {
        const repairs = await findRepairByExpediente(expediente);
        if (repairs && repairs.length > 0) {
          repairData = repairs[0];
        }
      } catch (error) {
        // Intentar en tabla de Formularios
        const forms = await findFormularioByExpediente(expediente);
        if (forms && forms.length > 0) {
          repairData = forms[0];
        }
      }
    }

    // Buscar por record
    if (record && !repairData) {
      try {
        repairData = await getRepairById(record);
      } catch (error) {
        try {
          repairData = await getFormularioById(record);
        } catch (formError) {
          return NextResponse.json(
            { error: 'Registro no encontrado' },
            { status: 404 }
          );
        }
      }
    }

    if (!repairData) {
      return NextResponse.json(
        { error: 'Reparación no encontrada' },
        { status: 404 }
      );
    }

    // Transformar los datos de Airtable al formato esperado
    const fields = repairData.fields || {};
    
    return NextResponse.json({
      id: repairData.id,
      cliente: fields['Nombre del Cliente'] || fields['Cliente'] || fields['cliente'] || '',
      direccion: fields['Dirección'] || fields['direccion'] || '',
      telefono: fields['Teléfono'] || fields['telefono'] || '',
      resultado: fields['Resultado'] || fields['resultado'] || fields['Estado'] || '',
      reparacion: fields['Reparación'] || fields['reparacion'] || '',
      material: fields['Material'] || fields['material'] || fields['Cuadro eléctrico'] || '',
      diferencialModelo: fields['Diferencial Modelo'] || '',
      sobretensionesModelo: fields['Sobretensiones Modelo'] || '',
      gdpModelo: fields['GDP Modelo'] || '',
      detalles: fields['Detalles'] || fields['detalles'] || fields['Problema'] || '',
      numeroSerie: fields['Número de serie nuevo'] || fields['Número de serie'] || fields['numeroSerie'] || '',
      numeroSerieAntiguo: fields['Número de serie antiguo'] || fields['numeroSerieAntiguo'] || '',
      factura: fields['Factura'] || [],
      foto: fields['Foto'] || [],
      fotoEtiqueta: fields['Foto de etiqueta'] || fields['Foto de la etiqueta'] || fields['fotoEtiqueta'] || [],
      fotoEtiquetaAntigua: fields['Foto de la etiqueta antigua'] || fields['fotoEtiquetaAntigua'] || [],
      isFidelizado: Array.isArray(fields['Fidelizado']) 
        ? (fields['Fidelizado'].length > 0 && fields['Fidelizado'][0] === true)
        : (fields['Fidelizado'] === true),
      expediente: fields['Expediente'] || fields['expediente'] || '',
      fecha: fields['Fecha'] || fields['fecha'] || '',
      // Campos adicionales para CitaForm
      Cita: fields['Cita'] || fields['cita'] || '',
      'Cita técnico': fields['Cita técnico'] || fields['citaTecnico'] || '',
      Estado: fields['Estado'] || fields['estado'] || '',
      Motivo: fields['Motivo'] || fields['motivo'] || '',
      'Tipo de Servicio': fields['Tipo de Servicio'] || fields['tipoServicio'] || '',
    });
  } catch (error: any) {
    console.error('Error en GET /api/repairs:', error);
    return NextResponse.json(
      { error: 'Error al obtener la reparación', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nueva reparación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Determinar qué tabla usar basándose en los campos
    const isFormulario = body.expediente || body['Expediente'];
    
    let result;
    if (isFormulario) {
      result = await createFormulario(body);
    } else {
      result = await createRepair(body);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error en POST /api/repairs:', error);
    return NextResponse.json(
      { error: 'Error al crear la reparación', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar reparación existente
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const searchParams = request.nextUrl.searchParams;
    const urlId = searchParams.get('id');
    const urlRecord = searchParams.get('record');
    const urlExpediente = searchParams.get('expediente');
    
    // Separar attachments del resto de los datos
    const { id, recordId, Foto, Factura, 'Foto de la etiqueta': FotoEtiqueta, 'Foto de la etiqueta antigua': FotoEtiquetaAntigua, ...updateData } = body;
    const targetId = urlId || urlRecord || urlExpediente || id || recordId;

    if (!targetId) {
      return NextResponse.json(
        { error: 'Se requiere id, record o recordId' },
        { status: 400 }
      );
    }

    let result;
    let lastError: any = null;
    let finalRecordId = targetId;
    
    try {
      // Si viene expediente, buscar primero el record ID
      if (urlExpediente && !urlId && !urlRecord) {
        const repairs = await findRepairByExpediente(urlExpediente);
        if (repairs && repairs.length > 0) {
          finalRecordId = repairs[0].id;
          result = await updateRepairRecord(finalRecordId, updateData);
        } else {
          const forms = await findFormularioByExpediente(urlExpediente);
          if (forms && forms.length > 0) {
            finalRecordId = forms[0].id;
            result = await updateFormulario(finalRecordId, updateData);
          } else {
            return NextResponse.json(
              { error: 'No se encontró el registro con ese expediente' },
              { status: 404 }
            );
          }
        }
      } else {
        // Intentar actualizar en tabla de Reparaciones
        try {
          const repairUpdateData = { ...updateData };
          delete repairUpdateData['Diferencial Modelo'];
          delete repairUpdateData['Sobretensiones Modelo'];
          delete repairUpdateData['GDP Modelo'];

          result = await updateRepairRecord(finalRecordId, repairUpdateData);
        } catch (repairError: any) {
          lastError = repairError;
          // Si falla, intentar en tabla de Formularios
          result = await updateFormulario(finalRecordId, updateData);
        }
      }

      // Ahora subir los attachments usando el Content API
      const uploadImageToAirtable = (await import('@/lib/airtable')).uploadImageToAirtable;
      
      if (Foto && Array.isArray(Foto) && Foto.length > 0) {
        console.log(`📤 Subiendo ${Foto.length} foto(s)...`);
        for (const foto of Foto) {
          await uploadImageToAirtable(finalRecordId, 'Foto', foto);
        }
      }

      if (Factura && Array.isArray(Factura) && Factura.length > 0) {
        console.log(`📤 Subiendo ${Factura.length} factura(s)...`);
        for (const factura of Factura) {
          await uploadImageToAirtable(finalRecordId, 'Factura', factura);
        }
      }

      if (FotoEtiqueta && Array.isArray(FotoEtiqueta) && FotoEtiqueta.length > 0) {
        console.log(`📤 Subiendo ${FotoEtiqueta.length} foto(s) de etiqueta...`);
        for (const fotoEtiqueta of FotoEtiqueta) {
          await uploadImageToAirtable(finalRecordId, 'Foto de la etiqueta', fotoEtiqueta);
        }
      }

      if (FotoEtiquetaAntigua && Array.isArray(FotoEtiquetaAntigua) && FotoEtiquetaAntigua.length > 0) {
        console.log(`📤 Subiendo ${FotoEtiquetaAntigua.length} foto(s) de etiqueta antigua...`);
        for (const fotoEtiquetaAntigua of FotoEtiquetaAntigua) {
          await uploadImageToAirtable(finalRecordId, 'Foto de la etiqueta antigua', fotoEtiquetaAntigua);
        }
      }

    } catch (error: any) {
      console.error('Error en PATCH /api/repairs:', error);
      
      // Determinar el código de error apropiado
      let statusCode = 500;
      let errorMessage = 'No se pudo actualizar el registro';
      
      if (error.message?.includes('422') || lastError?.message?.includes('422')) {
        statusCode = 422;
        errorMessage = 'Error al procesar los archivos adjuntos.';
      } else if (error.message?.includes('404') || error.message?.includes('not found')) {
        statusCode = 404;
        errorMessage = 'No se encontró el registro';
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: error.message || lastError?.message 
        },
        { status: statusCode }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error en PATCH /api/repairs:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la reparación', details: error.message },
      { status: 500 }
    );
  }
}

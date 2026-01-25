import { NextRequest, NextResponse } from 'next/server';
import { getRecordById, getServicioById } from '@/lib/airtable';

// GET - Obtener datos del servicio vinculado a una reparación
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const repairId = searchParams.get('repairId');

    if (!repairId) {
      return NextResponse.json(
        { error: 'Se requiere repairId' },
        { status: 400 }
      );
    }

    // 1. Obtener el registro de reparación
    const repairRecord = await getRecordById('Formularios', repairId);
    
    if (!repairRecord || !repairRecord.fields) {
      return NextResponse.json(
        { error: 'Registro de reparación no encontrado' },
        { status: 404 }
      );
    }

    // 2. Extraer el campo Servicios (linked record - es un array)
    const serviciosIds = repairRecord.fields['Servicios'];
    
    if (!serviciosIds || !Array.isArray(serviciosIds) || serviciosIds.length === 0) {
      console.warn('No se encontró servicio vinculado para la reparación:', repairId);
      return NextResponse.json({
        tecnico: '',
        cliente: '',
        direccion: '',
        telefono: '',
        codigoPostal: '',
        poblacion: '',
        provincia: '',
        isFidelizado: false
      });
    }

    // 3. Obtener los datos completos del servicio
    const servicioId = serviciosIds[0];
    const servicioData = await getServicioById(servicioId);
    
    if (!servicioData || !servicioData.fields) {
      console.warn('No se pudieron obtener los datos del servicio:', servicioId);
      return NextResponse.json({
        tecnico: '',
        cliente: '',
        direccion: '',
        telefono: '',
        codigoPostal: '',
        poblacion: '',
        provincia: '',
        isFidelizado: false
      });
    }

    const fields = servicioData.fields;

    // Función auxiliar para normalizar campos que pueden ser arrays
    const normalizeField = (field: any): string => {
      if (!field) return '';
      if (Array.isArray(field)) {
        return field.length > 0 ? String(field[0]) : '';
      }
      return String(field);
    };

    // 3.5. Obtener información del técnico si existe
    let isFidelizado = false;
    const tecnicosIds = fields['Técnicos'];
    if (tecnicosIds && Array.isArray(tecnicosIds) && tecnicosIds.length > 0) {
      const tecnicoId = tecnicosIds[0];
      try {
        // Llamar a Airtable para obtener el técnico completo
        const tecnicoRecord = await getRecordById('Técnicos', tecnicoId);
        if (tecnicoRecord?.fields?.['Fidelizado']) {
          isFidelizado = true;
        }
        console.log('✅ Información del técnico obtenida, isFidelizado:', isFidelizado);
      } catch (error) {
        console.warn('⚠️ No se pudo obtener información del técnico:', error);
      }
    }

    // 4. Construir la respuesta con los datos normalizados
    const responseData = {
      tecnico: normalizeField(fields['Técnico']),
      cliente: normalizeField(fields['Cliente']),
      direccion: normalizeField(fields['Dirección']),
      telefono: normalizeField(fields['Teléfono']),
      codigoPostal: normalizeField(fields['Código postal']),
      poblacion: normalizeField(fields['Población del cliente'] || fields['Población']),
      provincia: normalizeField(fields['Provincia']),
      isFidelizado
    };
    
    console.log('📊 Datos del servicio obtenidos:', JSON.stringify(responseData, null, 2));
    
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Error en GET /api/repairs/service-data:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos del servicio', details: error.message },
      { status: 500 }
    );
  }
}

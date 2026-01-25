import { NextRequest, NextResponse } from 'next/server';

// POST - Enviar datos de cargador instalado al webhook de Make
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('📤 Enviando datos al webhook de Make:', JSON.stringify(body, null, 2));

    // Realizar la petición al webhook de Make desde el servidor (evita problemas de CORS)
    const webhookResponse = await fetch('https://automation.makegic.com/webhook/material-installed', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('❌ Error del webhook de Make:', webhookResponse.status, errorText);
      return NextResponse.json(
        { 
          error: 'Error al enviar al webhook',
          status: webhookResponse.status,
          details: errorText
        },
        { status: webhookResponse.status }
      );
    }

    const responseData = await webhookResponse.text();
    console.log('✅ Webhook enviado correctamente a Make');
    console.log('📥 Respuesta de Make:', responseData);

    return NextResponse.json({ 
      success: true,
      message: 'Datos enviados correctamente al webhook',
      response: responseData
    });

  } catch (error: any) {
    console.error('❌ Error al procesar webhook:', error);
    return NextResponse.json(
      { 
        error: 'Error al procesar la solicitud',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

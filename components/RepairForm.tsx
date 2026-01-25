"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FileUpload } from '@/components/ui/file-upload';
import { uploadFiles } from '@/lib/upload';
import { 
  Loader2, 
  User, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle
} from 'lucide-react';
import { serviciosOptions, cuadroElectricoOptions, diferencialMonofasicoModelos, diferencialTrifasicoModelos, sobretensionesMonofasicoModelos, sobretensionesTrifasicoModelos, gdpModelos } from '@/lib/repair-options';

const steps = [
  { id: 1, title: 'Datos Generales' },
  { id: 2, title: 'Reparación' },
  { id: 3, title: 'Confirmación' },
  { id: 4, title: 'Documentación' },
];

interface RepairFormProps {
  onRepairComplete: () => void;
  onRepairError: (error: string) => void;
}

export function RepairForm({ 
  onRepairComplete,
  onRepairError
}: RepairFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recordId, setRecordId] = useState<string>('');
  const [expediente, setExpediente] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingAttachments, setExistingAttachments] = useState({
    factura: [] as any[],
    foto: [] as any[],
    fotoEtiqueta: [] as any[],
    fotoEtiquetaAntigua: [] as any[],
  });
  
  const [tecnicoInfo, setTecnicoInfo] = useState<{
    isFidelizado: boolean;
  }>({ isFidelizado: false });

  const [confirmacionCargador, setConfirmacionCargador] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Datos Generales
    cliente: '',
    direccion: '',
    telefono: '',

    // Step 2: Reparación
    resultado: '',
    reparacion: '', // Single option
    material: '', // Material utilizado (antes cuadroElectrico)
    diferencialModelo: '',
    sobretensionesModelo: '',
    gdpModelo: '',
    detalles: '', // Campo que siempre aparece
    numeroSerie: '', // Número de serie nuevo cuando se sustituye el punto de recarga
    numeroSerieAntiguo: '', // Número de serie antiguo cuando se sustituye el punto de recarga
  });
  
  const [files, setFiles] = useState({
    factura: [] as File[],
    foto: [] as File[],
    fotoEtiqueta: [] as File[],
    fotoEtiquetaAntigua: [] as File[],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recordParam = params.get('id') || params.get('record');
    const expedienteParam = params.get('expediente');

    if (recordParam) {
      setRecordId(recordParam);
      setIsLoading(true);
      loadRecordData(recordParam);
    } else if (expedienteParam) {
      setExpediente(expedienteParam);
      setIsLoading(true);
      loadExpedienteData(expedienteParam);
    }
  }, []);

  const loadRecordData = async (record: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/repairs?record=${encodeURIComponent(record)}`);

      if (response.ok) {
        const data = await response.json();
        setIsEditMode(true);
        setFormData(prev => ({
          ...prev,
          cliente: data.cliente || '',
          direccion: data.direccion || '',
          telefono: data.telefono || '',
          resultado: data.resultado || '',
          reparacion: data.reparacion || '',
          material: data.material || '',
          diferencialModelo: data.diferencialModelo || '',
          sobretensionesModelo: data.sobretensionesModelo || '',
          gdpModelo: data.gdpModelo || '',
          detalles: data.detalles || '',
          numeroSerie: data.numeroSerie ? String(data.numeroSerie) : '',
          numeroSerieAntiguo: data.numeroSerieAntiguo ? String(data.numeroSerieAntiguo) : '',
        }));
        setExistingAttachments({
          factura: Array.isArray(data.factura) ? data.factura : [],
          foto: Array.isArray(data.foto) ? data.foto : [],
          fotoEtiqueta: Array.isArray(data.fotoEtiqueta) ? data.fotoEtiqueta : [],
          fotoEtiquetaAntigua: Array.isArray(data.fotoEtiquetaAntigua) ? data.fotoEtiquetaAntigua : [],
        });
        
        // Cargar información del técnico directamente desde el lookup field
        console.log('🔍 Campo Fidelizado desde Airtable (loadRecordData):', data.isFidelizado, 'tipo:', typeof data.isFidelizado);
        setTecnicoInfo({ isFidelizado: data.isFidelizado || false });
      } else if (response.status === 404) {
        onRepairError(`Registro ${record} no encontrado`);
      } else {
        onRepairError('No se pudo cargar la información de la reparación');
      }
    } catch (error) {
      console.error('Error cargando registro:', error);
      onRepairError('Error al cargar los datos del registro');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExpedienteData = async (expedienteId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/repairs?expediente=${encodeURIComponent(expedienteId)}`);

      if (response.ok) {
        const data = await response.json();
        setIsEditMode(true);
        setRecordId(data.id);
        setFormData(prev => ({
          ...prev,
          cliente: data.cliente || '',
          direccion: data.direccion || '',
          telefono: data.telefono || '',
          resultado: data.resultado || '',
          reparacion: data.reparacion || '',
          material: data.material || '',
          diferencialModelo: data.diferencialModelo || '',
          sobretensionesModelo: data.sobretensionesModelo || '',
          gdpModelo: data.gdpModelo || '',
          detalles: data.detalles || '',
          numeroSerie: data.numeroSerie ? String(data.numeroSerie) : '',
          numeroSerieAntiguo: data.numeroSerieAntiguo ? String(data.numeroSerieAntiguo) : '',
        }));
        setExistingAttachments({
          factura: Array.isArray(data.factura) ? data.factura : [],
          foto: Array.isArray(data.foto) ? data.foto : [],
          fotoEtiqueta: Array.isArray(data.fotoEtiqueta) ? data.fotoEtiqueta : [],
          fotoEtiquetaAntigua: Array.isArray(data.fotoEtiquetaAntigua) ? data.fotoEtiquetaAntigua : [],
        });
        
        // Cargar información del técnico directamente desde el lookup field
        setTecnicoInfo({ isFidelizado: data.isFidelizado || false });
      } else if (response.status === 404) {
        onRepairError(`Expediente ${expedienteId} no encontrado`);
      } else {
        onRepairError('No se pudo cargar la información de la reparación');
      }
    } catch (error) {
      console.error('Error cargando expediente:', error);
      onRepairError('Error al cargar los datos del expediente');
    } finally {
      setIsLoading(false);
    }
  };

  // Función auxiliar para normalizar campos que pueden ser arrays
  const normalizeField = (field: any): string => {
    if (!field) return '';
    if (Array.isArray(field)) {
      return field.length > 0 ? String(field[0]) : '';
    }
    return String(field);
  };

  // Función auxiliar para obtener datos del servicio vinculado
  const getServiceData = async (repairRecordId: string) => {
    try {
      const response = await fetch(`/api/repairs/service-data?repairId=${encodeURIComponent(repairRecordId)}`);
      if (!response.ok) {
        console.warn('No se pudo obtener datos del servicio vinculado');
        return null;
      }
      
      const serviceData = await response.json();
      return serviceData;
    } catch (error) {
      console.error('Error obteniendo datos del servicio:', error);
      return null;
    }
  };

  // Función para determinar el número total de steps
  const getTotalSteps = () => {
    // Si material es Cargador, hay 4 pasos, sino 3
    return formData.material === 'Cargador' ? 4 : 3;
  };

  const getCurrentStepTitle = () => {
    if (formData.material !== 'Cargador' && currentStep >= 3) {
      // Saltar el step 3 de confirmación
      return steps[currentStep].title;
    }
    return steps[currentStep - 1]?.title || '';
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.cliente.trim()) {
          newErrors.cliente = 'El nombre del cliente es requerido';
        }
        if (!formData.direccion.trim()) {
          newErrors.direccion = 'La dirección es requerida';
        }
        break;
        
      case 2:
        if (!formData.resultado.trim()) {
          newErrors.resultado = 'Indica si se ha conseguido reparar';
        }
        if (formData.resultado === 'Reparado') {
          if (!formData.reparacion.trim()) {
            newErrors.reparacion = 'Selecciona el tipo de reparación';
          }
          if ((formData.reparacion === 'Reparar el cuadro eléctrico' || formData.reparacion === 'Sustitución') && !formData.material.trim()) {
            newErrors.material = 'Selecciona el material utilizado';
          }
          if ((formData.material === 'Diferencial monofásico' || formData.material === 'Diferencial trifásico') && !formData.diferencialModelo) {
            newErrors.diferencialModelo = 'Selecciona el modelo de diferencial';
          }
          if ((formData.material === 'Sobretensiones monofásico' || formData.material === 'Sobretensiones trifásico') && !formData.sobretensionesModelo) {
            newErrors.sobretensionesModelo = 'Selecciona el modelo de sobretensiones';
          }
          if (formData.material === 'Gestor de potencia' && !formData.gdpModelo) {
            newErrors.gdpModelo = 'Selecciona el modelo de GDP';
          }
        }
        // El campo detalles ahora es siempre requerido
        if (!formData.detalles.trim()) {
          newErrors.detalles = 'Describe los detalles de la reparación';
        }
        // Validar números de serie si se sustituye el punto de recarga
        if (formData.reparacion === 'Sustitución' && formData.material === 'Cargador') {
          const numeroSerieStr = String(formData.numeroSerie || '').trim();
          if (!numeroSerieStr) {
            newErrors.numeroSerie = 'El número de serie nuevo es requerido en sustitución';
          }
          const numeroSerieAntiguoStr = String(formData.numeroSerieAntiguo || '').trim();
          if (!numeroSerieAntiguoStr) {
            newErrors.numeroSerieAntiguo = 'El número de serie antiguo es requerido en sustitución';
          }
        }
        break;
        
      case 3:
        // Solo validar si el material es Cargador
        if (formData.material === 'Cargador') {
          if (!confirmacionCargador) {
            newErrors.confirmacionCargador = 'Debes confirmar que has empaquetado el cargador antiguo';
          }
        }
        break;
        
      case 4:
        // Si estamos en modo edición y ya hay un estado (Reparado o No reparado),
        // permitir que el usuario solo adjunte la factura sin necesidad de fotos
        const soloAdjuntandoFactura = isEditMode && formData.resultado && 
                                      (files.factura.length > 0 || existingAttachments.factura.length > 0);
        
        if (!soloAdjuntandoFactura) {
          if (files.foto.length === 0 && existingAttachments.foto.length === 0) {
            newErrors.foto = 'Adjunta al menos una foto del punto de recarga después de la intervención';
          }
          // Si se seleccionó "Sustitución" y el material es "Cargador", la foto de la etiqueta es obligatoria
          if (formData.reparacion === 'Sustitución' && formData.material === 'Cargador') {
            if (files.fotoEtiqueta.length === 0 && existingAttachments.fotoEtiqueta.length === 0) {
              newErrors.fotoEtiqueta = 'La foto de la etiqueta del nuevo equipo es obligatoria';
            }
          }
          // Si el material es "Cargador", la foto de la etiqueta antigua es obligatoria
          if (formData.material === 'Cargador') {
            if (files.fotoEtiquetaAntigua.length === 0 && existingAttachments.fotoEtiquetaAntigua.length === 0) {
              newErrors.fotoEtiquetaAntigua = 'La foto de la etiqueta del equipo antiguo es obligatoria';
            }
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      const totalSteps = getTotalSteps();
      let nextStepNumber = currentStep + 1;
      
      // Si NO es Cargador y estamos en Step 2, saltar al Step 4 (Documentación)
      if (formData.material !== 'Cargador' && currentStep === 2) {
        nextStepNumber = 4;
      }
      
      setCurrentStep(Math.min(nextStepNumber, totalSteps + 1));
    }
  };

  const prevStep = () => {
    let prevStepNumber = currentStep - 1;
    
    // Si NO es Cargador y estamos en Step 4, volver al Step 2 (saltar el Step 3)
    if (formData.material !== 'Cargador' && currentStep === 4) {
      prevStepNumber = 2;
    }
    
    setCurrentStep(Math.max(prevStepNumber, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // Upload files if any
      let facturaUploads: any[] = [];
      let fotoUploads: any[] = [];
      let fotoEtiquetaUploads: any[] = [];
      let fotoEtiquetaAntiguaUploads: any[] = [];
      
      try {
        if (files.factura.length > 0) {
          facturaUploads = await uploadFiles(files.factura);
        }
        if (files.foto.length > 0) {
          fotoUploads = await uploadFiles(files.foto);
        }
        if (files.fotoEtiqueta.length > 0) {
          fotoEtiquetaUploads = await uploadFiles(files.fotoEtiqueta);
        }
        if (files.fotoEtiquetaAntigua.length > 0) {
          fotoEtiquetaAntiguaUploads = await uploadFiles(files.fotoEtiquetaAntigua);
        }
      } catch (uploadError: any) {
        // Show specific error message from upload
        const errorMsg = typeof uploadError?.message === 'string' 
          ? uploadError.message 
          : 'Error al procesar los archivos. Verifica que sean válidos.';
        onRepairError(errorMsg);
        setIsSubmitting(false);
        return;
      }

      const isRepaired = formData.resultado === 'Reparado';
      
      // Transformar los uploads al formato que Airtable espera: solo {url: "..."}
      const transformUploads = (uploads: any[]) => uploads.map(u => ({ url: u.url }));
      
      const repairData: Record<string, any> = {
        Estado: formData.resultado,
        Reparación: isRepaired ? formData.reparacion : undefined,
        "Material": isRepaired && (formData.reparacion === 'Reparar el cuadro eléctrico' || formData.reparacion === 'Sustitución')
          ? formData.material || undefined
          : undefined,
        Detalles: formData.detalles, // Siempre enviamos los detalles
        "Número de serie nuevo": formData.numeroSerie ? parseFloat(formData.numeroSerie) : undefined,
        "Número de serie antiguo": formData.numeroSerieAntiguo ? parseFloat(formData.numeroSerieAntiguo) : undefined,
        Cliente: formData.cliente,
        Dirección: formData.direccion,
        "Diferencial Modelo": formData.diferencialModelo || undefined,
        "Sobretensiones Modelo": formData.sobretensionesModelo || undefined,
        "GDP Modelo": formData.gdpModelo || undefined,
        Factura: facturaUploads.length > 0 ? transformUploads(facturaUploads) : undefined,
        Foto: fotoUploads.length > 0 ? transformUploads(fotoUploads) : undefined,
      };

      // Solo enviar foto de etiqueta si se subieron archivos Y si corresponde (Sustitución + Cargador)
      if (fotoEtiquetaUploads.length > 0 && formData.reparacion === 'Sustitución' && formData.material === 'Cargador') {
        repairData["Foto de la etiqueta"] = transformUploads(fotoEtiquetaUploads);
      }

      // Enviar foto de etiqueta antigua si se subieron archivos Y el material es Cargador
      if (fotoEtiquetaAntiguaUploads.length > 0 && formData.material === 'Cargador') {
        repairData["Foto de la etiqueta antigua"] = transformUploads(fotoEtiquetaAntiguaUploads);
      }

      // When editing, clear fields that don't apply based on result
      // Use null instead of empty string for select fields to avoid Airtable errors
      if (!isRepaired && isEditMode) {
        repairData['Reparación'] = null;
        repairData['Material'] = null;
        repairData['Diferencial Modelo'] = null;
        repairData['Sobretensiones Modelo'] = null;
        repairData['GDP Modelo'] = null;
      }

      if (isRepaired && isEditMode) {
        // Ya no necesitamos limpiar el campo problema, porque ahora usamos detalles siempre
        if (formData.reparacion !== 'Reparar el cuadro eléctrico' && formData.reparacion !== 'Sustitución') {
          repairData['Material'] = null;
          repairData['Diferencial Modelo'] = null;
          repairData['Sobretensiones Modelo'] = null;
          repairData['GDP Modelo'] = null;
        } else {
          // Si el material no es diferencial o sobretensiones, limpiar los modelos
          if (formData.material !== 'Diferencial monofásico' && formData.material !== 'Diferencial trifásico') {
            repairData['Diferencial Modelo'] = null;
          }
          if (formData.material !== 'Sobretensiones monofásico' && formData.material !== 'Sobretensiones trifásico') {
            repairData['Sobretensiones Modelo'] = null;
          }
          if (formData.material !== 'Gestor de potencia') {
            repairData['GDP Modelo'] = null;
          }
        }
      }

      const isUpdate = isEditMode && (Boolean(recordId) || Boolean(expediente));
      if (!isUpdate && expediente) {
        (repairData as any).Expediente = expediente;
      }
      
      // Priorizar record ID sobre expediente
      const endpoint = isUpdate
        ? recordId 
          ? `/api/repairs?record=${encodeURIComponent(recordId)}`
          : `/api/repairs?expediente=${encodeURIComponent(expediente)}`
        : '/api/repairs';

      const response = await fetch(endpoint, {
        method: isUpdate ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(repairData),
      });

      if (!response.ok) {
        try {
          const data = await response.json();
          onRepairError(typeof data?.error === 'string' ? data.error : 'Error al crear la reparación');
        } catch {
          onRepairError('Error al crear la reparación');
        }
        return;
      }

      const result = await response.json();
      
      // Actualizar estado del servicio según el resultado
      if (result?.id) {
        try {
          await fetch('/api/repairs/finalize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              repairRecordId: result.id,
              resultado: formData.resultado
            }),
          });
        } catch (finalizeError) {
          console.error('Error al actualizar servicio:', finalizeError);
          // No mostramos error al usuario, continuamos con el flujo normal
        }

        // Enviar webhook si es sustitución de cargador O si se han instalado protecciones
        const isCargadorSustitucion = formData.reparacion === 'Sustitución' && formData.material === 'Cargador';
        const isProteccionesInstaladas = ((formData.material === 'Diferencial monofásico' || formData.material === 'Diferencial trifásico') && formData.diferencialModelo) || 
                                         ((formData.material === 'Sobretensiones monofásico' || formData.material === 'Sobretensiones trifásico') && formData.sobretensionesModelo) ||
                                         (formData.material === 'Gestor de potencia' && formData.gdpModelo);

        console.log('🔍 Verificando condiciones para webhook:', {
          reparacion: formData.reparacion,
          material: formData.material,
          isCargadorSustitucion,
          isProteccionesInstaladas
        });
        
        if (isCargadorSustitucion || isProteccionesInstaladas) {
          console.log('✅ Condiciones cumplidas - Iniciando proceso de webhook');
          
          try {
            // Para cargador, validar que tenemos los datos necesarios
            if (!isCargadorSustitucion || (formData.numeroSerie && formData.numeroSerieAntiguo)) {
              console.log('📞 Obteniendo datos del servicio vinculado...');
              const serviceData = await getServiceData(result.id);
              console.log('📊 Datos del servicio recibidos:', serviceData);
              
              const webhookPayload = {
                sn_instalado: isCargadorSustitucion ? String(formData.numeroSerie) : null,
                sn_retirado: isCargadorSustitucion ? String(formData.numeroSerieAntiguo) : null,
                modelo_componente: formData.diferencialModelo || formData.sobretensionesModelo || formData.gdpModelo || null,
                tecnico: serviceData?.tecnico || '',
                cliente: {
                  nombre: formData.cliente,
                  direccion: formData.direccion,
                  ciudad: serviceData?.poblacion || '',
                  cp: serviceData?.codigoPostal || '',
                  provincia: serviceData?.provincia || '',
                  telefono: formData.telefono || serviceData?.telefono || ''
                },
                id_reparacion: result.id
              };

              console.log('📤 Enviando datos al webhook:', JSON.stringify(webhookPayload, null, 2));

              const webhookResponse = await fetch('/api/webhooks/charger-installed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(webhookPayload),
              });

              if (webhookResponse.ok) {
                const responseData = await webhookResponse.json();
                console.log('✅ Webhook enviado correctamente');
                console.log('📥 Respuesta del webhook:', responseData);
              } else {
                const errorData = await webhookResponse.json().catch(() => ({ error: 'Error desconocido' }));
                console.warn('⚠️ El webhook respondió con error:', webhookResponse.status);
                console.warn('⚠️ Detalles del error:', errorData);
              }
            } else {
              console.warn('⚠️ Faltan números de serie para enviar al webhook de cargador');
            }
          } catch (webhookError) {
            console.error('❌ Error al enviar webhook:', webhookError);
          }
        } else {
          console.log('ℹ️ No se envía webhook - condiciones no cumplidas');
        }
      }

      onRepairComplete();
    } catch (error: any) {
      const msg = typeof error?.message === 'string' ? error.message : 'Algo salió mal. Inténtalo de nuevo.';
      onRepairError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleResultadoChange = (resultado: 'Reparado' | 'No reparado') => {
    setFormData(prev => ({
      ...prev,
      resultado,
      // Ya no limpiamos los detalles, se mantienen siempre
      reparacion: resultado === 'No reparado' ? '' : prev.reparacion,
      material: resultado === 'No reparado' ? '' : prev.material,
      diferencialModelo: resultado === 'No reparado' ? '' : prev.diferencialModelo,
      sobretensionesModelo: resultado === 'No reparado' ? '' : prev.sobretensionesModelo,
      gdpModelo: resultado === 'No reparado' ? '' : prev.gdpModelo,
      numeroSerie: resultado === 'No reparado' ? '' : prev.numeroSerie,
    }));

    setErrors(prev => ({
      ...prev,
      resultado: '',
      ...(resultado === 'Reparado'
        ? { detalles: '' }
        : { reparacion: '', material: '' }),
    }));
  };

  const handleReparacionChange = (reparacion: string) => {
    setFormData(prev => ({
      ...prev,
      reparacion,
      // Auto-rellenar material con "Cargador" cuando se selecciona "Sustitución"
      material: reparacion === 'Sustitución' 
        ? 'Cargador' 
        : (reparacion === 'Reparar el cuadro eléctrico' ? prev.material : ''),
      diferencialModelo: reparacion === 'Sustitución' ? '' : prev.diferencialModelo,
      sobretensionesModelo: reparacion === 'Sustitución' ? '' : prev.sobretensionesModelo,
      gdpModelo: reparacion === 'Sustitución' ? '' : prev.gdpModelo,
      // Si no es "Sustitución", limpiar los números de serie
      numeroSerie: reparacion === 'Sustitución' ? prev.numeroSerie : '',
      numeroSerieAntiguo: reparacion === 'Sustitución' ? prev.numeroSerieAntiguo : ''
    }));
    
    if (errors.reparacion) {
      setErrors(prev => ({ ...prev, reparacion: '' }));
    }
    if (errors.material && reparacion !== 'Reparar el cuadro eléctrico' && reparacion !== 'Sustitución') {
      setErrors(prev => ({ ...prev, material: '' }));
    }
  };

  const handleMaterialChange = (opcion: string) => {
    setFormData(prev => ({
      ...prev,
      material: opcion,
      diferencialModelo: (opcion === 'Diferencial monofásico' || opcion === 'Diferencial trifásico') ? prev.diferencialModelo : '',
      sobretensionesModelo: (opcion === 'Sobretensiones monofásico' || opcion === 'Sobretensiones trifásico') ? prev.sobretensionesModelo : '',
      gdpModelo: opcion === 'Gestor de potencia' ? prev.gdpModelo : ''
    }));

    if (errors.material) {
      setErrors(prev => ({ ...prev, material: '' }));
    }
    if (errors.diferencialModelo && opcion !== 'Diferencial monofásico' && opcion !== 'Diferencial trifásico') {
      setErrors(prev => ({ ...prev, diferencialModelo: '' }));
    }
    if (errors.sobretensionesModelo && opcion !== 'Sobretensiones monofásico' && opcion !== 'Sobretensiones trifásico') {
      setErrors(prev => ({ ...prev, sobretensionesModelo: '' }));
    }
    if (errors.gdpModelo && opcion !== 'Gestor de potencia') {
      setErrors(prev => ({ ...prev, gdpModelo: '' }));
    }
  };

  const handleFileChange = (field: 'foto' | 'factura' | 'fotoEtiqueta' | 'fotoEtiquetaAntigua', selectedFiles: File[]) => {
    setFiles(prev => ({ ...prev, [field]: selectedFiles }));
    setExistingAttachments(prev => ({
      ...prev,
      [field]: selectedFiles.length > 0 ? [] : prev[field],
    }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6 flex items-center justify-center">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#008606]" />
          <span className="ml-3 text-sm text-gray-600">Cargando información del expediente...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">
        {/* Form Content */}
        <div>
        <AnimatePresence mode="wait">
          {/* Step 1: Datos Generales */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                Datos Generales
              </h2>

              <div>
                <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    id="cliente"
                    value={formData.cliente}
                    onChange={(e) => handleInputChange('cliente', e.target.value)}
                    readOnly={isEditMode}
                    className={cn(
                      "w-full pl-10 pr-4 py-4 text-base rounded-xl border transition-all duration-200 focus:shadow-md focus:ring-2 touch-manipulation",
                      isEditMode
                        ? "bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed focus:ring-0 focus:border-gray-200"
                        : errors.cliente 
                          ? "border-red-300 focus:ring-red-200 focus:border-red-400" 
                          : "border-gray-300 focus:ring-green-200 focus:border-green-400"
                    )}
                    placeholder="Nombre del cliente"
                  />
                </div>
                {errors.cliente && (
                  <p className="text-red-600 text-sm mt-1">{errors.cliente}</p>
                )}
              </div>

              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    readOnly={isEditMode}
                    className={cn(
                      "w-full pl-10 pr-4 py-4 text-base rounded-xl border transition-all duration-200 focus:shadow-md focus:ring-2",
                      isEditMode
                        ? "bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed focus:ring-0 focus:border-gray-200"
                        : errors.direccion 
                          ? "border-red-300 focus:ring-red-200 focus:border-red-400" 
                          : "border-gray-300 focus:ring-green-200 focus:border-green-400"
                    )}
                    placeholder="Dirección del cliente"
                  />
                </div>
                {errors.direccion && (
                  <p className="text-red-600 text-sm mt-1">{errors.direccion}</p>
                )}
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="telefono"
                    value={formData.telefono}
                    readOnly
                    className="w-full px-4 py-4 text-base rounded-xl border bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed focus:ring-0 focus:border-gray-200"
                    placeholder="Se carga automáticamente del cliente"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Reparación */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                Reparación
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ¿Se ha conseguido reparar el punto de recarga? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Reparado', 'No reparado'].map((opcion) => (
                    <label
                      key={opcion}
                      className={cn(
                        "flex items-center p-4 sm:p-5 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 touch-manipulation",
                        formData.resultado === opcion
                          ? "border-[#008606] bg-[#008606]/10"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                    >
                      <input
                        type="radio"
                        name="resultado"
                        value={opcion}
                        checked={formData.resultado === opcion}
                        onChange={() => handleResultadoChange(opcion as 'Reparado' | 'No reparado')}
                        className="w-5 h-5 text-[#008606] border-gray-300 focus:ring-[#008606]"
                      />
                      <span className="ml-3 text-sm sm:text-base font-medium text-gray-700">{opcion}</span>
                    </label>
                  ))}
                </div>
                {errors.resultado && (
                  <p className="text-red-600 text-sm mt-2">{errors.resultado}</p>
                )}
              </div>

              {formData.resultado === 'Reparado' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      ¿Qué has tenido que reparar? *
                    </label>
                    <div className="space-y-3">
                      {serviciosOptions.map((servicio) => (
                        <label
                          key={servicio}
                          className={cn(
                            "flex items-center p-4 sm:p-5 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 touch-manipulation",
                            formData.reparacion === servicio
                              ? "border-[#008606] bg-[#008606]/10"
                              : "border-gray-300 hover:border-gray-400"
                          )}
                        >
                          <input
                            type="radio"
                            name="reparacion"
                            value={servicio}
                            checked={formData.reparacion === servicio}
                            onChange={() => handleReparacionChange(servicio)}
                            className="w-5 h-5 text-[#008606] border-gray-300 focus:ring-[#008606]"
                          />
                          <span className="ml-3 text-sm sm:text-base font-medium text-gray-700">{servicio}</span>
                        </label>
                      ))}
                    </div>
                    {errors.reparacion && (
                      <p className="text-red-600 text-sm mt-2">{errors.reparacion}</p>
                    )}
                  </div>

                  {formData.reparacion === 'Reparar el cuadro eléctrico' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Material *
                      </label>
                      <div className="space-y-3">
                        {cuadroElectricoOptions.map((opcion) => (
                          <label
                            key={opcion}
                            className={cn(
                              "flex items-center p-4 sm:p-5 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 touch-manipulation",
                              formData.material === opcion
                                ? "border-[#008606] bg-[#008606]/10"
                                : "border-gray-300 hover:border-gray-400"
                            )}
                          >
                            <input
                              type="radio"
                              name="material"
                              value={opcion}
                              checked={formData.material === opcion}
                              onChange={() => handleMaterialChange(opcion)}
                              className="w-5 h-5 text-[#008606] border-gray-300 focus:ring-[#008606]"
                            />
                            <span className="ml-3 text-sm sm:text-base text-gray-700">{opcion}</span>
                          </label>
                        ))}
                      </div>
                      {errors.material && (
                        <p className="text-red-600 text-sm mt-2">{errors.material}</p>
                      )}

                      {/* Selector condicional para Diferencial monofásico */}
                      {formData.material === 'Diferencial monofásico' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4"
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Modelo de Diferencial *
                          </label>
                          <div className="space-y-3">
                            {diferencialMonofasicoModelos.map((modelo) => (
                              <label
                                key={modelo}
                                className={cn(
                                  "flex items-center p-4 sm:p-5 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 touch-manipulation",
                                  formData.diferencialModelo === modelo
                                    ? "border-[#008606] bg-[#008606]/10"
                                    : "border-gray-300 hover:border-gray-400"
                                )}
                              >
                                <input
                                  type="radio"
                                  name="diferencialModelo"
                                  value={modelo}
                                  checked={formData.diferencialModelo === modelo}
                                  onChange={() => handleInputChange('diferencialModelo', modelo)}
                                  className="w-5 h-5 text-[#008606] border-gray-300 focus:ring-[#008606]"
                                />
                                <span className="ml-3 text-sm sm:text-base text-gray-700">{modelo}</span>
                              </label>
                            ))}
                          </div>
                          {errors.diferencialModelo && (
                            <p className="text-red-600 text-sm mt-1">{errors.diferencialModelo}</p>
                          )}
                        </motion.div>
                      )}

                      {/* Selector condicional para Diferencial trifásico */}
                      {formData.material === 'Diferencial trifásico' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4"
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Modelo de Diferencial *
                          </label>
                          <div className="space-y-3">
                            {diferencialTrifasicoModelos.map((modelo) => (
                              <label
                                key={modelo}
                                className={cn(
                                  "flex items-center p-4 sm:p-5 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 touch-manipulation",
                                  formData.diferencialModelo === modelo
                                    ? "border-[#008606] bg-[#008606]/10"
                                    : "border-gray-300 hover:border-gray-400"
                                )}
                              >
                                <input
                                  type="radio"
                                  name="diferencialModelo"
                                  value={modelo}
                                  checked={formData.diferencialModelo === modelo}
                                  onChange={() => handleInputChange('diferencialModelo', modelo)}
                                  className="w-5 h-5 text-[#008606] border-gray-300 focus:ring-[#008606]"
                                />
                                <span className="ml-3 text-sm sm:text-base text-gray-700">{modelo}</span>
                              </label>
                            ))}
                          </div>
                          {errors.diferencialModelo && (
                            <p className="text-red-600 text-sm mt-1">{errors.diferencialModelo}</p>
                          )}
                        </motion.div>
                      )}

                      {/* Selector condicional para Sobretensiones monofásico */}
                      {formData.material === 'Sobretensiones monofásico' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4"
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Modelo de Sobretensiones *
                          </label>
                          <div className="space-y-3">
                            {sobretensionesMonofasicoModelos.map((modelo) => (
                              <label
                                key={modelo}
                                className={cn(
                                  "flex items-center p-4 sm:p-5 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 touch-manipulation",
                                  formData.sobretensionesModelo === modelo
                                    ? "border-[#008606] bg-[#008606]/10"
                                    : "border-gray-300 hover:border-gray-400"
                                )}
                              >
                                <input
                                  type="radio"
                                  name="sobretensionesModelo"
                                  value={modelo}
                                  checked={formData.sobretensionesModelo === modelo}
                                  onChange={() => handleInputChange('sobretensionesModelo', modelo)}
                                  className="w-5 h-5 text-[#008606] border-gray-300 focus:ring-[#008606]"
                                />
                                <span className="ml-3 text-sm sm:text-base text-gray-700">{modelo}</span>
                              </label>
                            ))}
                          </div>
                          {errors.sobretensionesModelo && (
                            <p className="text-red-600 text-sm mt-1">{errors.sobretensionesModelo}</p>
                          )}
                        </motion.div>
                      )}

                      {/* Selector condicional para Sobretensiones trifásico */}
                      {formData.material === 'Sobretensiones trifásico' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4"
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Modelo de Sobretensiones *
                          </label>
                          <div className="space-y-3">
                            {sobretensionesTrifasicoModelos.map((modelo) => (
                              <label
                                key={modelo}
                                className={cn(
                                  "flex items-center p-4 sm:p-5 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 touch-manipulation",
                                  formData.sobretensionesModelo === modelo
                                    ? "border-[#008606] bg-[#008606]/10"
                                    : "border-gray-300 hover:border-gray-400"
                                )}
                              >
                                <input
                                  type="radio"
                                  name="sobretensionesModelo"
                                  value={modelo}
                                  checked={formData.sobretensionesModelo === modelo}
                                  onChange={() => handleInputChange('sobretensionesModelo', modelo)}
                                  className="w-5 h-5 text-[#008606] border-gray-300 focus:ring-[#008606]"
                                />
                                <span className="ml-3 text-sm sm:text-base text-gray-700">{modelo}</span>
                              </label>
                            ))}
                          </div>
                          {errors.sobretensionesModelo && (
                            <p className="text-red-600 text-sm mt-1">{errors.sobretensionesModelo}</p>
                          )}
                        </motion.div>
                      )}

                      {/* Selector condicional para GDP */}
                      {formData.material === 'Gestor de potencia' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4"
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Modelo de GDP *
                          </label>
                          <div className="space-y-3">
                            {gdpModelos.map((modelo) => (
                              <label
                                key={modelo}
                                className={cn(
                                  "flex items-center p-4 sm:p-5 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 touch-manipulation",
                                  formData.gdpModelo === modelo
                                    ? "border-[#008606] bg-[#008606]/10"
                                    : "border-gray-300 hover:border-gray-400"
                                )}
                              >
                                <input
                                  type="radio"
                                  name="gdpModelo"
                                  value={modelo}
                                  checked={formData.gdpModelo === modelo}
                                  onChange={() => handleInputChange('gdpModelo', modelo)}
                                  className="w-5 h-5 text-[#008606] border-gray-300 focus:ring-[#008606]"
                                />
                                <span className="ml-3 text-sm sm:text-base text-gray-700">{modelo}</span>
                              </label>
                            ))}
                          </div>
                          {errors.gdpModelo && (
                            <p className="text-red-600 text-sm mt-1">{errors.gdpModelo}</p>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {formData.reparacion === 'Sustitución' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Material *
                        </label>
                        <div className="space-y-3">
                          {cuadroElectricoOptions.map((opcion) => (
                            <label
                              key={opcion}
                              className={cn(
                                "flex items-center p-4 sm:p-5 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 touch-manipulation",
                                formData.material === opcion
                                  ? "border-[#008606] bg-[#008606]/10"
                                  : "border-gray-300 hover:border-gray-400"
                              )}
                            >
                              <input
                                type="radio"
                                name="material"
                                value={opcion}
                                checked={formData.material === opcion}
                                onChange={() => handleMaterialChange(opcion)}
                                className="w-5 h-5 text-[#008606] border-gray-300 focus:ring-[#008606]"
                              />
                              <span className="ml-3 text-sm sm:text-base text-gray-700">{opcion}</span>
                            </label>
                          ))}
                        </div>
                        {errors.material && (
                          <p className="text-red-600 text-sm mt-2">{errors.material}</p>
                        )}

                        {/* Selector condicional para Diferencial monofásico en Sustitución */}
                        {formData.material === 'Diferencial monofásico' && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4"
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Modelo de Diferencial *
                            </label>
                            <div className="space-y-3">
                              {diferencialMonofasicoModelos.map((modelo) => (
                                <label
                                  key={modelo}
                                  className={cn(
                                    "flex items-center p-4 sm:p-5 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 touch-manipulation",
                                    formData.diferencialModelo === modelo
                                      ? "border-[#008606] bg-[#008606]/10"
                                      : "border-gray-300 hover:border-gray-400"
                                  )}
                                >
                                  <input
                                    type="radio"
                                    name="diferencialModeloSub"
                                    value={modelo}
                                    checked={formData.diferencialModelo === modelo}
                                    onChange={() => handleInputChange('diferencialModelo', modelo)}
                                    className="w-5 h-5 text-[#008606] border-gray-300 focus:ring-[#008606]"
                                  />
                                  <span className="ml-3 text-sm sm:text-base text-gray-700">{modelo}</span>
                                </label>
                              ))}
                            </div>
                            {errors.diferencialModelo && (
                              <p className="text-red-600 text-sm mt-1">{errors.diferencialModelo}</p>
                            )}
                          </motion.div>
                        )}

                        {/* Selector condicional para Diferencial trifásico en Sustitución */}
                        {formData.material === 'Diferencial trifásico' && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4"
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Modelo de Diferencial *
                            </label>
                            <div className="space-y-3">
                              {diferencialTrifasicoModelos.map((modelo) => (
                                <label
                                  key={modelo}
                                  className={cn(
                                    "flex items-center p-4 sm:p-5 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 touch-manipulation",
                                    formData.diferencialModelo === modelo
                                      ? "border-[#008606] bg-[#008606]/10"
                                      : "border-gray-300 hover:border-gray-400"
                                  )}
                                >
                                  <input
                                    type="radio"
                                    name="diferencialModeloSub"
                                    value={modelo}
                                    checked={formData.diferencialModelo === modelo}
                                    onChange={() => handleInputChange('diferencialModelo', modelo)}
                                    className="w-5 h-5 text-[#008606] border-gray-300 focus:ring-[#008606]"
                                  />
                                  <span className="ml-3 text-sm sm:text-base text-gray-700">{modelo}</span>
                                </label>
                              ))}
                            </div>
                            {errors.diferencialModelo && (
                              <p className="text-red-600 text-sm mt-1">{errors.diferencialModelo}</p>
                            )}
                          </motion.div>
                        )}

                        {/* Selector condicional para Sobretensiones monofásico en Sustitución */}
                        {formData.material === 'Sobretensiones monofásico' && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4"
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Modelo de Sobretensiones *
                            </label>
                            <div className="space-y-3">
                              {sobretensionesMonofasicoModelos.map((modelo) => (
                                <label
                                  key={modelo}
                                  className={cn(
                                    "flex items-center p-4 sm:p-5 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 touch-manipulation",
                                    formData.sobretensionesModelo === modelo
                                      ? "border-[#008606] bg-[#008606]/10"
                                      : "border-gray-300 hover:border-gray-400"
                                  )}
                                >
                                  <input
                                    type="radio"
                                    name="sobretensionesModeloSub"
                                    value={modelo}
                                    checked={formData.sobretensionesModelo === modelo}
                                    onChange={() => handleInputChange('sobretensionesModelo', modelo)}
                                    className="w-5 h-5 text-[#008606] border-gray-300 focus:ring-[#008606]"
                                  />
                                  <span className="ml-3 text-sm sm:text-base text-gray-700">{modelo}</span>
                                </label>
                              ))}
                            </div>
                            {errors.sobretensionesModelo && (
                              <p className="text-red-600 text-sm mt-1">{errors.sobretensionesModelo}</p>
                            )}
                          </motion.div>
                        )}

                        {/* Selector condicional para Sobretensiones trifásico en Sustitución */}
                        {formData.material === 'Sobretensiones trifásico' && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4"
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Modelo de Sobretensiones *
                            </label>
                            <div className="space-y-3">
                              {sobretensionesTrifasicoModelos.map((modelo) => (
                                <label
                                  key={modelo}
                                  className={cn(
                                    "flex items-center p-4 sm:p-5 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 touch-manipulation",
                                    formData.sobretensionesModelo === modelo
                                      ? "border-[#008606] bg-[#008606]/10"
                                      : "border-gray-300 hover:border-gray-400"
                                  )}
                                >
                                  <input
                                    type="radio"
                                    name="sobretensionesModeloSub"
                                    value={modelo}
                                    checked={formData.sobretensionesModelo === modelo}
                                    onChange={() => handleInputChange('sobretensionesModelo', modelo)}
                                    className="w-5 h-5 text-[#008606] border-gray-300 focus:ring-[#008606]"
                                  />
                                  <span className="ml-3 text-sm sm:text-base text-gray-700">{modelo}</span>
                                </label>
                              ))}
                            </div>
                            {errors.sobretensionesModelo && (
                              <p className="text-red-600 text-sm mt-1">{errors.sobretensionesModelo}</p>
                            )}
                          </motion.div>
                        )}

                        {/* Selector condicional para GDP en Sustitución */}
                        {formData.material === 'Gestor de potencia' && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4"
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Modelo de GDP *
                            </label>
                            <div className="space-y-3">
                              {gdpModelos.map((modelo) => (
                                <label
                                  key={modelo}
                                  className={cn(
                                    "flex items-center p-4 sm:p-5 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 touch-manipulation",
                                    formData.gdpModelo === modelo
                                      ? "border-[#008606] bg-[#008606]/10"
                                      : "border-gray-300 hover:border-gray-400"
                                  )}
                                >
                                  <input
                                    type="radio"
                                    name="gdpModeloSub"
                                    value={modelo}
                                    checked={formData.gdpModelo === modelo}
                                    onChange={() => handleInputChange('gdpModelo', modelo)}
                                    className="w-5 h-5 text-[#008606] border-gray-300 focus:ring-[#008606]"
                                  />
                                  <span className="ml-3 text-sm sm:text-base text-gray-700">{modelo}</span>
                                </label>
                              ))}
                            </div>
                            {errors.gdpModelo && (
                              <p className="text-red-600 text-sm mt-1">{errors.gdpModelo}</p>
                            )}
                          </motion.div>
                        )}
                      </div>
                      
                      {formData.material === 'Cargador' && (
                        <>
                          <div>
                            <label htmlFor="numeroSerieAntiguo" className="block text-sm font-medium text-gray-700 mb-2">
                              Número de serie antiguo *
                            </label>
                            <input
                              type="number"
                              id="numeroSerieAntiguo"
                              value={formData.numeroSerieAntiguo}
                              onChange={(e) => handleInputChange('numeroSerieAntiguo', e.target.value)}
                              className={cn(
                                "w-full px-4 py-4 text-base rounded-xl border transition-all duration-200 focus:shadow-md focus:ring-2 touch-manipulation",
                                errors.numeroSerieAntiguo 
                                  ? "border-red-300 focus:ring-red-200 focus:border-red-400" 
                                  : "border-gray-300 focus:ring-green-200 focus:border-green-400"
                              )}
                              placeholder="Ingresa el número de serie antiguo..."
                            />
                            {errors.numeroSerieAntiguo && (
                              <p className="text-red-600 text-sm mt-1">{errors.numeroSerieAntiguo}</p>
                            )}
                          </div>
                          
                          <div>
                            <label htmlFor="numeroSerie" className="block text-sm font-medium text-gray-700 mb-2">
                              Número de serie nuevo *
                            </label>
                            <input
                              type="number"
                              id="numeroSerie"
                              value={formData.numeroSerie}
                              onChange={(e) => handleInputChange('numeroSerie', e.target.value)}
                              className={cn(
                                "w-full px-4 py-4 text-base rounded-xl border transition-all duration-200 focus:shadow-md focus:ring-2 touch-manipulation",
                                errors.numeroSerie 
                                  ? "border-red-300 focus:ring-red-200 focus:border-red-400" 
                                  : "border-gray-300 focus:ring-green-200 focus:border-green-400"
                              )}
                              placeholder="Ingresa el número de serie nuevo..."
                            />
                            {errors.numeroSerie && (
                              <p className="text-red-600 text-sm mt-1">{errors.numeroSerie}</p>
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Campo de detalles que siempre aparece */}
              <div>
                <label htmlFor="detalles" className="block text-sm font-medium text-gray-700 mb-2">
                  Detalles de la reparación *
                </label>
                <textarea
                  id="detalles"
                  value={formData.detalles}
                  onChange={(e) => handleInputChange('detalles', e.target.value)}
                  rows={4}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:shadow-md resize-none",
                    errors.detalles
                      ? "border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400"
                      : "border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-400"
                  )}
                  placeholder="Describe los detalles de lo que has hecho en esta reparación"
                />
                {errors.detalles && (
                  <p className="text-red-600 text-sm mt-1">{errors.detalles}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmación de Cargador (solo si material === 'Cargador') */}
          {currentStep === 3 && formData.material === 'Cargador' && (
            <motion.div
              key="step3-confirmation"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                Confirmación de Sustitución
              </h2>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-900 mb-4">
                  Has seleccionado <strong>Cargador</strong> como material. Por favor, confirma el siguiente procedimiento:
                </p>
                
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={confirmacionCargador}
                    onChange={(e) => {
                      setConfirmacionCargador(e.target.checked);
                      if (errors.confirmacionCargador) {
                        setErrors(prev => ({ ...prev, confirmacionCargador: '' }));
                      }
                    }}
                    className="w-5 h-5 mt-0.5 text-[#008606] border-gray-300 rounded focus:ring-[#008606] focus:ring-2"
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    {tecnicoInfo.isFidelizado 
                      ? 'Confirmo que he empaquetado el cargador antiguo en la caja del nuevo y me lo he llevado a la oficina para que sea recogido.'
                      : 'Confirmo que he empaquetado el cargador antiguo en la caja del nuevo, lo he dejado listo para que sea recogido en la vivienda del cliente y he informado al cliente que pasarán a recogerlo en 24 / 48 horas.'}
                  </span>
                </label>
                
                {errors.confirmacionCargador && (
                  <p className="text-red-600 text-sm mt-2">{errors.confirmacionCargador}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Documentación */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                Documentación
              </h2>
              
              {/* Mensaje informativo si está solo adjuntando factura */}
              {isEditMode && formData.resultado && (formData.resultado === 'Reparado' || formData.resultado === 'No reparado') && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Adjuntar factura
                      </p>
                      <p className="text-sm text-blue-700">
                        Puedes adjuntar solo la factura sin necesidad de volver a subir las fotos.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <FileUpload
                label="Foto del punto de recarga después de la intervención"
                required
                error={errors.foto}
                onFileSelect={(selected) => handleFileChange('foto', selected)}
                maxFiles={5}
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
                }}
              />
              {existingAttachments.foto.length > 0 && files.foto.length === 0 && (
                <p className="text-sm text-gray-500 -mt-2">
                  Ya hay {existingAttachments.foto.length === 1 ? 'una foto' : `${existingAttachments.foto.length} fotos`} almacenada para este expediente.
                </p>
              )}

              {/* Mostrar campo de foto de etiqueta solo si se seleccionó "Sustitución" y el material es "Cargador" */}
              {formData.reparacion === 'Sustitución' && formData.material === 'Cargador' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <FileUpload
                    label="Foto de la etiqueta del nuevo equipo"
                    required
                    error={errors.fotoEtiqueta}
                    onFileSelect={(selected) => handleFileChange('fotoEtiqueta', selected)}
                    accept={{
                      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
                    }}
                  />
                  {existingAttachments.fotoEtiqueta.length > 0 && files.fotoEtiqueta.length === 0 && (
                    <p className="text-sm text-gray-500 -mt-2">
                      Ya hay {existingAttachments.fotoEtiqueta.length === 1 ? 'una foto' : `${existingAttachments.fotoEtiqueta.length} fotos`} de la etiqueta almacenada.
                    </p>
                  )}
                </motion.div>
              )}

              {/* Mostrar campo de foto de etiqueta antigua si el material es "Cargador" */}
              {formData.material === 'Cargador' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <FileUpload
                    label="Foto de la etiqueta del equipo antiguo"
                    required
                    error={errors.fotoEtiquetaAntigua}
                    onFileSelect={(selected) => handleFileChange('fotoEtiquetaAntigua', selected)}
                    accept={{
                      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
                    }}
                  />
                  {existingAttachments.fotoEtiquetaAntigua.length > 0 && files.fotoEtiquetaAntigua.length === 0 && (
                    <p className="text-sm text-gray-500 -mt-2">
                      Ya hay {existingAttachments.fotoEtiquetaAntigua.length === 1 ? 'una foto' : `${existingAttachments.fotoEtiquetaAntigua.length} fotos`} de la etiqueta antigua almacenada.
                    </p>
                  )}
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Factura (solo PDF)
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Puedes completar el parte ahora y adjuntar la factura más tarde.
                </p>
                <FileUpload
                  onFileSelect={(selected) => handleFileChange('factura', selected)}
                  accept={{
                    'application/pdf': ['.pdf'],
                  }}
                />
              </div>
              {existingAttachments.factura.length > 0 && files.factura.length === 0 && (
                <p className="text-sm text-gray-500 -mt-2">
                  Ya hay {existingAttachments.factura.length === 1 ? 'una factura' : `${existingAttachments.factura.length} facturas`} vinculada a este expediente.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex flex-row items-center justify-between gap-3 flex-wrap mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className={cn(
              "flex-1 min-w-[140px] flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium transition-all duration-200 touch-manipulation",
              currentStep === 1 || isSubmitting
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100 active:scale-95"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
            Atrás
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-[#008606] hover:bg-[#008606]/90 active:scale-95 text-white font-semibold px-6 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation"
            >
              Avanzar
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-[#008606] hover:bg-[#008606]/90 disabled:bg-[#008606]/50 active:scale-95 text-white font-semibold px-6 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar
                </>
              )}
            </button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

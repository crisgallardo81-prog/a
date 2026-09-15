import { jsPDF } from 'jspdf';
import { CalculationScenario } from '../types';

export function generateTechnicalPDFReport(scenario: CalculationScenario) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header background bar (Academic Dark Indigo)
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, y, contentWidth, 24, 'F');

  // Title in header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('ELECCIÓN DE LOS PARTICIPANTES - GUÍA DE MUESTREO', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('DICTAMEN TÉCNICO Y MEMORIA DE CÁLCULO DE TAMAÑO MUESTRAL', margin + 6, y + 16);

  y += 30;

  // Document metadata box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.rect(margin, y, contentWidth, 18, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Identificador de Protocolo: ${scenario.id}`, margin + 5, y + 6);
  doc.text(`Fecha y Hora de Emisión: ${new Date(scenario.timestamp).toLocaleString('es-ES')}`, margin + 5, y + 12);

  const approachName = scenario.approach === 'proportions' 
    ? 'Proporciones (Variables Cualitativas / Atributos)' 
    : 'Medias (Variables Cuantitativas / Continuas)';
  doc.text(`Enfoque Metodológico: ${approachName}`, margin + contentWidth / 2, y + 6);
  const popStatus = scenario.populationType === 'finite' 
    ? `Población Finita (N = ${scenario.populationSize?.toLocaleString('es-ES')})`
    : 'Población Infinita o Desconocida (N >= 100.000)';
  doc.text(`Marco Poblacional: ${popStatus}`, margin + contentWidth / 2, y + 12);

  y += 24;

  // Section 1: Parámetros del Estudio
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. PARÁMETROS METODOLÓGICOS CONFIGURADOS', margin, y);
  y += 6;

  // Table of parameters
  const params: [string, string, string][] = [
    [
      'Nivel de Confianza (1 - alpha)',
      `${scenario.confidenceLevel}% (Valor crítico Z = ${scenario.zValue})`,
      'Probabilidad de que el intervalo contenga el parámetro verdadero.',
    ],
    [
      'Margen de Error Máximo Tolerable (e)',
      scenario.approach === 'proportions'
        ? `± ${(scenario.marginOfError * 100).toFixed(2)}% (e = ${scenario.marginOfError})`
        : `± ${scenario.marginOfError} ${scenario.unitOfMeasurement || 'unidades'}`,
      'Máxima discrepancia aceptable entre la muestra y la población.',
    ],
  ];

  if (scenario.approach === 'proportions') {
    params.push([
      'Probabilidad de Éxito esperada (p)',
      `p = ${scenario.p}`,
      scenario.p === 0.5
        ? 'Máxima varianza supuesta (p=0.5, q=0.5) ante literatura previa no concluyente.'
        : 'Valor basado en estudios piloto o literatura previa reportada.',
    ]);
    params.push([
      'Probabilidad de Fracaso complementaria (q)',
      `q = ${scenario.q}`,
      'q = 1 - p (evento complementario).',
    ]);
  } else {
    params.push([
      'Desviación Estándar Estimada (sigma)',
      `sigma = ${scenario.stdDev} ${scenario.unitOfMeasurement || 'unidades'}`,
      'Medida de dispersión obtenida de estudio previo, prueba piloto o regla empírica.',
    ]);
  }

  params.push([
    'Universo / Población de Referencia (N)',
    scenario.populationType === 'finite' && scenario.populationSize
      ? `${scenario.populationSize.toLocaleString('es-ES')} elementos`
      : 'Infinita / Desconocida (>= 100.000)',
    scenario.populationType === 'finite'
      ? 'Se activa el Factor de Corrección por Finitud (f.p.c.).'
      : 'Se asume muestreo en población abierta sin corrección de finitud.',
  ]);

  // Render parameters table
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');

  params.forEach((param, index) => {
    const rowY = y + index * 8.5;
    if (index % 2 === 0) {
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, rowY - 4, contentWidth, 8, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(param[0], margin + 3, rowY + 1);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(param[1], margin + 70, rowY + 1);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(param[2], margin + 115, rowY + 1, { maxWidth: contentWidth - 118 });
  });

  y += params.length * 8.5 + 8;

  // Section 2: Rigor Matemático y Sustitución
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. DESARROLLO MATEMÁTICO Y SUSTITUCIÓN PASO A PASO', margin, y);
  y += 6;

  doc.setFillColor(254, 252, 232); // amber-50
  doc.setDrawColor(253, 230, 138); // amber-200
  doc.rect(margin, y, contentWidth, 34, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(146, 64, 14); // amber-800
  doc.setFont('helvetica', 'bold');

  if (scenario.approach === 'proportions') {
    if (scenario.populationType === 'finite' && scenario.populationSize) {
      doc.text('Fórmula para Población Finita (Proporciones):', margin + 4, y + 6);
      doc.setFont('courier', 'bold');
      doc.text('n = [ N * Z^2 * p * q ] / [ e^2 * (N - 1) + Z^2 * p * q ]', margin + 4, y + 12);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `n = [ ${scenario.populationSize} * (${scenario.zValue})^2 * ${scenario.p} * ${scenario.q} ] / [ (${scenario.marginOfError})^2 * (${scenario.populationSize - 1}) + (${scenario.zValue})^2 * ${scenario.p} * ${scenario.q} ]`,
        margin + 4,
        y + 19,
        { maxWidth: contentWidth - 8 }
      );
      doc.text(
        `n = [ ${(scenario.populationSize * scenario.zValue * scenario.zValue * (scenario.p || 0.5) * (scenario.q || 0.5)).toFixed(2)} ] / [ ${((scenario.marginOfError ** 2) * (scenario.populationSize - 1) + (scenario.zValue ** 2) * (scenario.p || 0.5) * (scenario.q || 0.5)).toFixed(4)} ] = ${scenario.exactSampleSize.toFixed(4)}`,
        margin + 4,
        y + 27
      );
    } else {
      doc.text('Fórmula para Población Infinita (Proporciones):', margin + 4, y + 6);
      doc.setFont('courier', 'bold');
      doc.text('n0 = [ Z^2 * p * q ] / [ e^2 ]', margin + 4, y + 12);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `n0 = [ (${scenario.zValue})^2 * ${scenario.p} * ${scenario.q} ] / [ (${scenario.marginOfError})^2 ]`,
        margin + 4,
        y + 19
      );
      doc.text(
        `n0 = [ ${(scenario.zValue * scenario.zValue * (scenario.p || 0.5) * (scenario.q || 0.5)).toFixed(4)} ] / [ ${(scenario.marginOfError * scenario.marginOfError).toFixed(6)} ] = ${scenario.exactSampleSize.toFixed(4)}`,
        margin + 4,
        y + 27
      );
    }
  } else {
    if (scenario.populationType === 'finite' && scenario.populationSize) {
      doc.text('Fórmula para Población Finita (Medias):', margin + 4, y + 6);
      doc.setFont('courier', 'bold');
      doc.text('n = [ N * Z^2 * sigma^2 ] / [ e^2 * (N - 1) + Z^2 * sigma^2 ]', margin + 4, y + 12);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `n = [ ${scenario.populationSize} * (${scenario.zValue})^2 * (${scenario.stdDev})^2 ] / [ (${scenario.marginOfError})^2 * (${scenario.populationSize - 1}) + (${scenario.zValue})^2 * (${scenario.stdDev})^2 ]`,
        margin + 4,
        y + 19,
        { maxWidth: contentWidth - 8 }
      );
      doc.text(
        `n = [ ${(scenario.populationSize * scenario.zValue * scenario.zValue * ((scenario.stdDev || 1) ** 2)).toFixed(2)} ] / [ ${((scenario.marginOfError ** 2) * (scenario.populationSize - 1) + (scenario.zValue ** 2) * ((scenario.stdDev || 1) ** 2)).toFixed(4)} ] = ${scenario.exactSampleSize.toFixed(4)}`,
        margin + 4,
        y + 27
      );
    } else {
      doc.text('Fórmula para Población Infinita (Medias):', margin + 4, y + 6);
      doc.setFont('courier', 'bold');
      doc.text('n0 = [ Z^2 * sigma^2 ] / [ e^2 ]', margin + 4, y + 12);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `n0 = [ (${scenario.zValue})^2 * (${scenario.stdDev})^2 ] / [ (${scenario.marginOfError})^2 ]`,
        margin + 4,
        y + 19
      );
      doc.text(
        `n0 = [ ${(scenario.zValue * scenario.zValue * ((scenario.stdDev || 1) ** 2)).toFixed(4)} ] / [ ${(scenario.marginOfError * scenario.marginOfError).toFixed(6)} ] = ${scenario.exactSampleSize.toFixed(4)}`,
        margin + 4,
        y + 27
      );
    }
  }

  y += 40;

  // Section 3: Dictamen y Resultados Oficiales
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. DICTAMEN OFICIAL DE TAMAÑO MUESTRAL', margin, y);
  y += 6;

  // Main result highlight box
  doc.setFillColor(239, 246, 255); // blue-50
  doc.setDrawColor(191, 219, 254); // blue-200
  doc.rect(margin, y, contentWidth, 34, 'FD');

  doc.setTextColor(30, 58, 138); // blue-900
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TAMAÑO MUESTRAL FORMAL RECOMENDADO:', margin + 6, y + 8);

  doc.setFontSize(22);
  doc.setTextColor(29, 78, 216); // blue-700
  doc.text(`n = ${scenario.roundedSampleSize} participantes`, margin + 6, y + 18);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Valor analítico continuo: ${scenario.exactSampleSize.toFixed(4)} | Regla metodológica: Redondeo obligatorio hacia el entero superior ceil(n).`,
    margin + 6,
    y + 25
  );

  if (scenario.samplingFraction) {
    doc.text(
      `Fracción de muestreo: f = n/N = ${(scenario.samplingFraction * 100).toFixed(2)}% del universo total analizado.`,
      margin + 6,
      y + 30
    );
  }

  y += 40;

  // Section 4: Ajuste por No Respuesta y Recomendaciones de Campo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('4. RECOMENDACIONES TÉCNICAS PARA EL TRABAJO DE CAMPO', margin, y);
  y += 6;

  const adjusted10 = Math.ceil(scenario.roundedSampleSize / (1 - 0.10));
  const adjusted20 = Math.ceil(scenario.roundedSampleSize / (1 - 0.20));

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const recLines = [
    `• Previsión por Deserción o No Respuesta: En encuestas o mediciones presenciales/virtuales, se recomienda reclutar un contingente adicional para amortiguar el desgaste de muestra:`,
    `    - Con tasa de pérdida estimada del 10%: Reclutar n* = ${adjusted10} participantes.`,
    `    - Con tasa de pérdida estimada del 20%: Reclutar n* = ${adjusted20} participantes.`,
    `• Marco Muestral Obligatorio: Ningún sorteo o contacto aleatorio es metodológicamente válido sin un listado previo, completo y numerado correlativamente del 1 al N.`,
    `• Criterio de Selección: Debe emplearse un procedimiento probabilístico (Aleatorio Simple, Sistemático o Estratificado) mediante el generador del Laboratorio para garantizar equiprobabilidad y evitar sesgos de selección voluntaria.`,
  ];

  recLines.forEach(line => {
    doc.text(line, margin, y, { maxWidth: contentWidth });
    y += 5.5;
  });

  y += 6;

  // Footer note / watermark
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Laboratorio Didáctico Digital de Muestreo Estadístico • Documento para uso pedagógico e investigativo formal.',
    margin,
    pageHeight - 11
  );
  doc.text(
    `Página 1 de 1 • Generado automáticamente el ${new Date().toLocaleDateString('es-ES')}`,
    pageWidth - margin - 55,
    pageHeight - 11
  );

  doc.save(`Dictamen_Tecnico_Muestra_${scenario.approach}_n${scenario.roundedSampleSize}.pdf`);
}

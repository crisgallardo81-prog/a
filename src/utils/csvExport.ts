import { CalculationScenario, RandomDrawResult, StratumItem } from '../types';

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportSingleCalculationToCSV(scenario: CalculationScenario) {
  const headers = [
    'Campo',
    'Valor Metodológico',
    'Descripción / Interpretación',
  ];

  const rows: [string, string, string][] = [
    ['ID de Consulta', scenario.id, 'Identificador único del registro'],
    ['Fecha y Hora', new Date(scenario.timestamp).toLocaleString('es-ES'), 'Momento de cálculo'],
    ['Enfoque Estadístico', scenario.approach === 'proportions' ? 'Proporciones (Cualitativa)' : 'Medias (Cuantitativa)', 'Tipo de parámetro'],
    ['Población', scenario.populationType === 'finite' ? `Finita (N = ${scenario.populationSize?.toLocaleString('es-ES')})` : 'Infinita o Desconocida (N >= 100.000)', 'Condición del universo'],
    ['Nivel de Confianza (1 - alpha)', `${scenario.confidenceLevel}%`, `Valor crítico Z = ${scenario.zValue}`],
    ['Margen de Error (e)', scenario.approach === 'proportions' ? `${(scenario.marginOfError * 100).toFixed(2)}%` : `${scenario.marginOfError} ${scenario.unitOfMeasurement || ''}`, 'Error máximo tolerable'],
  ];

  if (scenario.approach === 'proportions') {
    rows.push(
      ['Probabilidad de Éxito (p)', `${scenario.p}`, 'Prevalencia esperada o máxima incertidumbre (0.50)'],
      ['Probabilidad de Fracaso (q)', `${scenario.q}`, '1 - p'],
    );
  } else {
    rows.push(
      ['Desviación Estándar (sigma)', `${scenario.stdDev}`, `Variabilidad estimada en ${scenario.unitOfMeasurement || 'unidades'}`],
    );
  }

  rows.push(
    ['Tamaño Muestral Exacto (n)', scenario.exactSampleSize.toFixed(4), 'Cálculo analítico no redondeado'],
    ['Tamaño Muestral Recomendado (techo)', scenario.roundedSampleSize.toString(), 'Redondeo metodológico formal superior ceil(n)'],
    ['Muestra Base Infinita (n0)', scenario.infiniteBaseSize.toFixed(2), 'Muestra sin corrección por finitud'],
    ['Corrección por Finitud Aplicada', scenario.finiteCorrectionFactorApplied ? 'SÍ' : 'NO', 'Ajuste según tamaño de universo N'],
  );

  if (scenario.samplingFraction) {
    rows.push([
      'Fracción de Muestreo (f = n/N)',
      `${(scenario.samplingFraction * 100).toFixed(2)}%`,
      'Porcentaje del universo evaluado en la muestra',
    ]);
  }

  const csvRows = [
    headers.join(';'),
    ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(';')),
  ];

  const filename = `tamano_muestra_${scenario.approach}_${Date.now()}.csv`;
  downloadCSV(filename, csvRows.join('\r\n'));
}

export function exportHistoryToCSV(history: CalculationScenario[]) {
  if (history.length === 0) return;

  const headers = [
    'ID',
    'Fecha',
    'Nombre Escenario',
    'Enfoque',
    'Tipo Poblacion',
    'Universo N',
    'Nivel Confianza (%)',
    'Valor Z',
    'Margen Error (e)',
    'p (éxito)',
    'q (fracaso)',
    'Desv. Estándar (sigma)',
    'Unidad',
    'Muestra Exacta',
    'Muestra Techo ceil(n)',
    'Muestra Base Infinita n0',
    'Factor Correccion Aplicado',
    'Fraccion Muestreo f (%)',
  ];

  const rows = history.map(item => [
    item.id,
    new Date(item.timestamp).toLocaleString('es-ES'),
    item.name,
    item.approach === 'proportions' ? 'Proporciones' : 'Medias',
    item.populationType === 'finite' ? 'Finita' : 'Infinita',
    item.populationSize ? item.populationSize.toString() : 'Infinita / Desconocida',
    item.confidenceLevel.toString(),
    item.zValue.toString(),
    item.approach === 'proportions' ? (item.marginOfError * 100).toFixed(2) + '%' : item.marginOfError.toString(),
    item.p !== undefined ? item.p.toString() : 'N/A',
    item.q !== undefined ? item.q.toString() : 'N/A',
    item.stdDev !== undefined ? item.stdDev.toString() : 'N/A',
    item.unitOfMeasurement || '',
    item.exactSampleSize.toFixed(2),
    item.roundedSampleSize.toString(),
    item.infiniteBaseSize.toFixed(2),
    item.finiteCorrectionFactorApplied ? 'SI' : 'NO',
    item.samplingFraction ? (item.samplingFraction * 100).toFixed(2) + '%' : 'N/A',
  ]);

  const csvRows = [
    headers.join(';'),
    ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(';')),
  ];

  downloadCSV(`historial_muestreo_${Date.now()}.csv`, csvRows.join('\r\n'));
}

export function exportStrataAllocationToCSV(strata: StratumItem[], totalN: number, totalN_sample: number) {
  const headers = [
    'Estrato / Grupo',
    'Población del Estrato (Nh)',
    'Proporción del Universo (Wh = Nh/N)',
    'Muestra Asignada Proporcional (nh)',
  ];

  const rows = strata.map(s => {
    const wh = totalN > 0 ? ((s.size / totalN) * 100).toFixed(2) + '%' : '0%';
    return [
      s.name,
      s.size.toString(),
      wh,
      (s.sampleSize || 0).toString(),
    ];
  });

  rows.push([
    'TOTAL UNIVERSO Y MUESTRA',
    totalN.toString(),
    '100.00%',
    totalN_sample.toString(),
  ]);

  const csvRows = [
    headers.join(';'),
    ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(';')),
  ];

  downloadCSV(`afijacion_estratificada_${Date.now()}.csv`, csvRows.join('\r\n'));
}

export function exportRandomSelectionToCSV(draw: RandomDrawResult) {
  const headers = [
    'Orden de Extracción',
    'Número Identificador en Marco Muestral',
    'Orden Ascendente',
    'Notas de Campo',
  ];

  const sortedNumbers = [...draw.numbers].sort((a, b) => a - b);

  const rows = draw.numbers.map((num, idx) => [
    (idx + 1).toString(),
    num.toString(),
    sortedNumbers[idx].toString(),
    `Unidad seleccionada de N = ${draw.totalN}`,
  ]);

  const metaHeader = [
    `# REPORTE DE SELECCIÓN ALEATORIA DE MUESTRA`,
    `# Modalidad: ${draw.mode}`,
    `# Universo Marco Muestral N: ${draw.totalN}`,
    `# Elementos Seleccionados n: ${draw.sampleN}`,
    `# Fecha de Extracción: ${new Date(draw.timestamp).toLocaleString('es-ES')}`,
    `# ADVERTENCIA METODOLÓGICA: Cada número corresponde al índice prenumerado del marco muestral formal.`,
  ];

  const csvRows = [
    metaHeader.join('\r\n'),
    headers.join(';'),
    ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(';')),
  ];

  downloadCSV(`seleccion_aleatoria_n${draw.sampleN}_de_N${draw.totalN}.csv`, csvRows.join('\r\n'));
}

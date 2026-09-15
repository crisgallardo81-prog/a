import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Download, 
  FileText, 
  History as HistoryIcon, 
  RotateCcw, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Info, 
  TrendingUp, 
  Copy, 
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { CalculationScenario, SamplingApproach, PopulationType } from '../types';
import { 
  CONFIDENCE_PRESETS, 
  calculateZFromConfidence, 
  calculateSampleSizeProportions, 
  calculateSampleSizeMeans,
  CalculationResult 
} from '../utils/mathFormulas';
import { generateTechnicalPDFReport } from '../utils/pdfExport';
import { exportSingleCalculationToCSV, exportHistoryToCSV } from '../utils/csvExport';

interface Pillar2CalculatorProps {
  history: CalculationScenario[];
  setHistory: React.Dispatch<React.SetStateAction<CalculationScenario[]>>;
  onGoToRandomGeneratorWithSample: (sampleSize: number, populationSize?: number) => void;
}

export const Pillar2Calculator: React.FC<Pillar2CalculatorProps> = ({
  history,
  setHistory,
  onGoToRandomGeneratorWithSample,
}) => {
  // State for statistical approach
  const [approach, setApproach] = useState<SamplingApproach>('proportions');
  
  // State for population mode
  const [isFinite, setIsFinite] = useState<boolean>(true);
  const [populationN, setPopulationN] = useState<number>(3500);

  // Confidence level
  const [confidenceLevel, setConfidenceLevel] = useState<number>(95);
  const [zValue, setZValue] = useState<number>(1.96);

  // Margin of error (for proportions: decimal e.g. 0.05; for means: absolute units e.g. 2)
  const [marginOfErrorProp, setMarginOfErrorProp] = useState<number>(0.05);
  const [marginOfErrorMean, setMarginOfErrorMean] = useState<number>(2.5);

  // Proportions: p and q
  const [propP, setPropP] = useState<number>(0.50);

  // Means: sigma and unit
  const [stdDev, setStdDev] = useState<number>(12.0);
  const [unitOfMeasurement, setUnitOfMeasurement] = useState<string>('puntos');

  // Scenario naming & feedback
  const [scenarioName, setScenarioName] = useState<string>('Estudio Principal');
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  // Synchronize Z value when confidence level changes
  useEffect(() => {
    const computedZ = calculateZFromConfidence(confidenceLevel);
    setZValue(computedZ);
  }, [confidenceLevel]);

  // Compute live calculation result
  const currentResult: CalculationResult = approach === 'proportions'
    ? calculateSampleSizeProportions({
        confidenceLevel,
        zValue,
        marginOfError: marginOfErrorProp,
        p: propP,
        populationSize: isFinite ? populationN : undefined,
        isFinite: isFinite && populationN > 0,
      })
    : calculateSampleSizeMeans({
        confidenceLevel,
        zValue,
        marginOfError: marginOfErrorMean,
        stdDev,
        populationSize: isFinite ? populationN : undefined,
        isFinite: isFinite && populationN > 0,
        unitOfMeasurement,
      });

  // Construct current scenario object
  const currentScenario: CalculationScenario = {
    id: `CALC-${Date.now().toString().slice(-6)}`,
    timestamp: Date.now(),
    name: scenarioName || 'Cálculo de Muestra',
    approach,
    populationType: isFinite ? 'finite' : 'infinite',
    confidenceLevel,
    zValue,
    marginOfError: approach === 'proportions' ? marginOfErrorProp : marginOfErrorMean,
    populationSize: isFinite ? populationN : undefined,
    p: approach === 'proportions' ? propP : undefined,
    q: approach === 'proportions' ? 1 - propP : undefined,
    stdDev: approach === 'means' ? stdDev : undefined,
    unitOfMeasurement: approach === 'means' ? unitOfMeasurement : undefined,
    exactSampleSize: currentResult.exactN,
    roundedSampleSize: currentResult.roundedN,
    infiniteBaseSize: currentResult.n0,
    finiteCorrectionFactorApplied: currentResult.isFinite,
    samplingFraction: currentResult.samplingFraction,
  };

  // Save scenario to history & local storage
  const handleSaveToHistory = () => {
    setHistory((prev) => [currentScenario, ...prev.slice(0, 49)]);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  // Quick reset to methodological defaults
  const handleResetDefaults = () => {
    setConfidenceLevel(95);
    setZValue(1.96);
    if (approach === 'proportions') {
      setMarginOfErrorProp(0.05);
      setPropP(0.50);
      setIsFinite(true);
      setPopulationN(3500);
    } else {
      setMarginOfErrorMean(2.5);
      setStdDev(12.0);
      setUnitOfMeasurement('puntos');
    }
  };

  const copyResultSummary = () => {
    const text = `Dictamen Metodológico de Muestra:
- Enfoque: ${approach === 'proportions' ? 'Proporciones' : 'Medias'}
- Universo (N): ${isFinite ? populationN.toLocaleString('es-ES') : 'Infinita (>= 100.000)'}
- Confianza: ${confidenceLevel}% (Z = ${zValue})
- Margen de Error: ${approach === 'proportions' ? `${(marginOfErrorProp * 100).toFixed(1)}%` : `${marginOfErrorMean} ${unitOfMeasurement}`}
- Tamaño Muestral Recomendado: n = ${currentResult.roundedN} sujetos (valor exacto: ${currentResult.exactN.toFixed(2)})`;
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Intro banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold uppercase tracking-wider mb-2">
              <Calculator className="w-3.5 h-3.5" />
              Paso 2: Calculadora
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Calculadora de Tamaño de Muestra
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl leading-relaxed">
              Selecciona el enfoque estadístico según la variable de tu estudio. Las fórmulas matemáticas formales se actualizan y sustituyen numéricamente en tiempo real conforme modificas los parámetros.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Restablecer valores estándar"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
            <button
              onClick={copyResultSummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Copiar resumen al portapapeles"
            >
              {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSuccess ? '¡Copiado!' : 'Copiar Dictamen'}</span>
            </button>
          </div>
        </div>

        {/* Approach Selector Switch */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setApproach('proportions')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
              approach === 'proportions'
                ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
              approach === 'proportions' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              %
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Proporciones (Variables Cualitativas)</span>
                {approach === 'proportions' && (
                  <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded">
                    Seleccionado
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Para variables dicotómicas, categorías o porcentajes (ej. prevalencia de estrés, intención de voto, nivel de satisfacción). Parámetros: <span className="font-mono">Z, e, p, q</span>.
              </p>
            </div>
          </button>

          <button
            onClick={() => setApproach('means')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
              approach === 'means'
                ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
              approach === 'means' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              x̄
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Medias (Variables Cuantitativas)</span>
                {approach === 'means' && (
                  <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded">
                    Seleccionado
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Para variables continuas o numéricas con promedios y escalas (ej. puntaje promedio en examen, presión arterial, horas de estudio). Parámetros: <span className="font-mono">Z, e, σ</span>.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Main interactive grid: Controls on left, Live Result & Formulas on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>Configuración de Parámetros</span>
              <span className="text-xs font-normal text-slate-400">Paso a paso</span>
            </h3>

            {/* Scenario Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre o Etiqueta del Escenario:
              </label>
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                placeholder="Ej. Estudio Pregrado 2026"
              />
            </div>

            {/* Population Size N (Finite vs Infinite) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Delimitación del Universo (N)</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">¿Población Finita?</span>
                  <input
                    type="checkbox"
                    checked={isFinite}
                    onChange={(e) => setIsFinite(e.target.checked)}
                    id="finiteToggle"
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {isFinite ? (
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="10"
                      max="10000000"
                      step="100"
                      value={populationN}
                      onChange={(e) => setPopulationN(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 text-sm font-mono font-semibold border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <span className="text-xs font-medium text-slate-500 shrink-0">sujetos</span>
                  </div>

                  {/* Warning if N >= 100,000 */}
                  {populationN >= 100000 ? (
                    <div className="mt-2 text-[11px] p-2 bg-amber-50 text-amber-900 rounded-md border border-amber-200 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Criterio Metodológico:</strong> Con <span className="font-mono">N = {populationN.toLocaleString('es-ES')}</span> (≥ 100,000), la población converge al régimen infinito. El factor de corrección tiene un impacto inferior al 0.05%.
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1.5 flex justify-between items-center text-[11px] text-slate-500">
                      <span>Población finita: se aplica factor de corrección.</span>
                      <div className="flex gap-1">
                        {[500, 1200, 3500, 15000].map((quickN) => (
                          <button
                            key={quickN}
                            onClick={() => setPopulationN(quickN)}
                            className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded hover:bg-slate-100 cursor-pointer font-mono"
                          >
                            {quickN}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2.5 bg-slate-200/50 rounded-lg text-xs text-slate-600 flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Población <strong>Infinita o Desconocida (N ≥ 100,000)</strong>. Se calculará el tamaño muestral base (<span className="font-mono">n₀</span>).</span>
                </div>
              )}
            </div>

            {/* Confidence Level (Z) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-900">
                  Nivel de Confianza (1 - α):
                </label>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {confidenceLevel}% → Z = {zValue}
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {CONFIDENCE_PRESETS.map((preset) => (
                  <button
                    key={preset.confidencePercent}
                    onClick={() => {
                      setConfidenceLevel(preset.confidencePercent);
                      setZValue(preset.zValue);
                    }}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border text-center ${
                      confidenceLevel === preset.confidencePercent
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>{preset.label}</div>
                    <div className={`text-[10px] ${confidenceLevel === preset.confidencePercent ? 'text-indigo-200' : 'text-slate-400'}`}>
                      Z = {preset.zValue}
                    </div>
                  </button>
                ))}
              </div>

              {/* Continuous slider for custom confidence */}
              <div className="pt-1">
                <input
                  type="range"
                  min="80"
                  max="99.5"
                  step="0.5"
                  value={confidenceLevel}
                  onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Margin of Error */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-900">
                  Margen de Error Máximo Tolerable (e):
                </label>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {approach === 'proportions'
                    ? `± ${(marginOfErrorProp * 100).toFixed(1)}% (e = ${marginOfErrorProp})`
                    : `± ${marginOfErrorMean} ${unitOfMeasurement}`}
                </span>
              </div>

              {approach === 'proportions' ? (
                <>
                  <div className="flex gap-1.5">
                    {[0.01, 0.025, 0.03, 0.05, 0.07, 0.10].map((err) => (
                      <button
                        key={err}
                        onClick={() => setMarginOfErrorProp(err)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                          marginOfErrorProp === err
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {(err * 100).toFixed(0)}%
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.15"
                    step="0.005"
                    value={marginOfErrorProp}
                    onChange={(e) => setMarginOfErrorProp(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-500 block">
                    En ciencias sociales y salud, <strong>5% (e = 0.05)</strong> es la convención metodológica más extendida.
                  </span>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0.01"
                      value={marginOfErrorMean}
                      onChange={(e) => setMarginOfErrorMean(Math.max(0.01, Number(e.target.value)))}
                      className="w-1/2 px-3 py-2 text-sm font-mono font-semibold border border-slate-300 rounded-lg bg-white"
                      placeholder="Error e"
                    />
                    <input
                      type="text"
                      value={unitOfMeasurement}
                      onChange={(e) => setUnitOfMeasurement(e.target.value)}
                      className="w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      placeholder="Unidad (kg, puntos, etc.)"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Distancia máxima permitida entre la media muestral (<span className="font-serif italic">x̄</span>) y la media poblacional (<span className="font-serif italic">μ</span>).
                  </span>
                </div>
              )}
            </div>

            {/* Approach specific parameter: p (proportions) OR sigma (means) */}
            {approach === 'proportions' ? (
              <div className="space-y-2 p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-amber-950">
                    Probabilidad de Éxito (p) y Fracaso (q):
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                    p = {propP.toFixed(2)} | q = {(1 - propP).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.05"
                    max="0.95"
                    step="0.05"
                    value={propP}
                    onChange={(e) => setPropP(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <button
                    onClick={() => setPropP(0.50)}
                    className="text-[10px] font-bold px-2 py-1 bg-amber-200/80 hover:bg-amber-300 text-amber-900 rounded shrink-0 cursor-pointer"
                    title="Asumir máxima incertidumbre"
                  >
                    Máx. Varianza (0.50)
                  </button>
                </div>

                <div className="text-[11px] text-amber-900/90 leading-relaxed pt-1">
                  <strong>Aclaratoria Metodológica Obligatoria:</strong> Ante el desconocimiento de literatura científica previa o falta de prueba piloto, se debe fijar rigurosamente <strong>p = 0.50 y q = 0.50</strong> (máxima varianza p·q = 0.25) para garantizar el tamaño muestral protector máximo.
                </div>
              </div>
            ) : (
              <div className="space-y-2 p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-blue-950">
                    Desviación Estándar Estimada (σ):
                  </label>
                  <span className="text-xs font-mono font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200">
                    σ = {stdDev} {unitOfMeasurement}
                  </span>
                </div>

                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={stdDev}
                  onChange={(e) => setStdDev(Math.max(0.1, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm font-mono font-semibold border border-blue-200 rounded-lg bg-white"
                />

                <span className="text-[11px] text-blue-900/80 block leading-relaxed">
                  Proveniente de estudios preliminares, literatura científica o prueba piloto (s). Si se desconoce por completo, una aproximación empírica es el rango dividido entre 4 o 6.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Result, Dynamic Mathematical Formulas and Step-by-Step (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero Result Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-md border border-indigo-800/40 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-indigo-700/50">
                <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Dictamen Oficial de Tamaño Muestral
                </span>
                <span className="text-xs bg-indigo-800/80 px-2.5 py-1 rounded-full text-indigo-200 font-mono">
                  {approach === 'proportions' ? 'Variable Cualitativa' : 'Variable Cuantitativa'}
                </span>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-300 font-medium uppercase tracking-wider">
                    Tamaño Muestral Mínimo Requerido:
                  </div>
                  <div className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight my-1">
                    n = {currentResult.roundedN}
                  </div>
                  <div className="text-xs text-indigo-200 font-mono">
                    Valor analítico exacto: <span className="font-bold text-white">{currentResult.exactN.toFixed(4)}</span> sujetos
                  </div>
                </div>

                <div className="text-right sm:text-right flex flex-col items-start sm:items-end gap-1.5">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    <Check className="w-3.5 h-3.5" />
                    <span>Redondeo Formal: ceil(n)</span>
                  </div>
                  {currentResult.isFinite && currentResult.samplingFraction && (
                    <div className="text-xs text-slate-300 font-mono">
                      Fracción f = {(currentResult.samplingFraction * 100).toFixed(2)}% del universo N
                    </div>
                  )}
                </div>
              </div>

              {/* Methodological rule on ceiling */}
              <div className="mt-5 p-3.5 bg-indigo-950/70 rounded-xl border border-indigo-700/60 text-xs text-slate-200 flex items-start gap-2.5 leading-relaxed">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Regla de Redondeo Metodológico:</strong> En estadística de muestreo, cualquier fracción decimal se redondea <strong>estrictamente al entero superior inmediato</strong> (⌈{currentResult.exactN.toFixed(2)}⌉ = {currentResult.roundedN}). Redondear hacia abajo aumentaría el error real por encima del límite fijado.
                </div>
              </div>

              {/* Field contingencies recommendations */}
              <div className="mt-4 pt-4 border-t border-indigo-800/60 grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Previsión +10% No Respuesta</span>
                  <span className="text-base font-bold text-white font-mono">
                    n* = {Math.ceil(currentResult.roundedN / 0.90)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Amortigua pérdidas de campo</span>
                </div>
                <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Previsión +20% No Respuesta</span>
                  <span className="text-base font-bold text-white font-mono">
                    n* = {Math.ceil(currentResult.roundedN / 0.80)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Recomendado en encuestas online</span>
                </div>
              </div>

              {/* Action Buttons inside hero */}
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => generateTechnicalPDFReport(currentScenario)}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Descargar Dictamen PDF</span>
                </button>

                <button
                  onClick={() => exportSingleCalculationToCSV(currentScenario)}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-indigo-700/80 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition-all border border-indigo-500/40 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Exportar CSV</span>
                </button>

                <button
                  onClick={handleSaveToHistory}
                  className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    justSaved
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-indigo-800/70 hover:bg-indigo-700/70 text-slate-200 border-indigo-700/60'
                  }`}
                >
                  {justSaved ? <Check className="w-3.5 h-3.5" /> : <HistoryIcon className="w-3.5 h-3.5" />}
                  <span>{justSaved ? '¡Guardado en Historial!' : 'Guardar en Historial'}</span>
                </button>

                <button
                  onClick={() => onGoToRandomGeneratorWithSample(currentResult.roundedN, isFinite ? populationN : undefined)}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-all ml-auto cursor-pointer"
                >
                  <span>Generador Aleatorio →</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Mathematical Formulas & Step-by-Step Substitution */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Rigor Matemático: Fórmulas y Sustitución en Tiempo Real</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Paso a Paso
              </span>
            </div>

            {/* Formula Expression Card */}
            <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800">
              <div className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-2">
                1. Fórmula Formal Teórica
              </div>
              
              {approach === 'proportions' ? (
                isFinite ? (
                  <div className="py-2 text-center font-serif text-base sm:text-lg text-white">
                    <span className="italic">n</span> = 
                    <span className="inline-block align-middle mx-2 text-center">
                      <span className="block border-b border-slate-600 pb-1 font-mono text-indigo-200">
                        N · Z² · p · q
                      </span>
                      <span className="block pt-1 font-mono text-slate-300">
                        e² · (N - 1) + Z² · p · q
                      </span>
                    </span>
                  </div>
                ) : (
                  <div className="py-2 text-center font-serif text-base sm:text-lg text-white">
                    <span className="italic">n₀</span> = 
                    <span className="inline-block align-middle mx-2 text-center">
                      <span className="block border-b border-slate-600 pb-1 font-mono text-indigo-200">
                        Z² · p · q
                      </span>
                      <span className="block pt-1 font-mono text-slate-300">
                        e²
                      </span>
                    </span>
                  </div>
                )
              ) : (
                isFinite ? (
                  <div className="py-2 text-center font-serif text-base sm:text-lg text-white">
                    <span className="italic">n</span> = 
                    <span className="inline-block align-middle mx-2 text-center">
                      <span className="block border-b border-slate-600 pb-1 font-mono text-indigo-200">
                        N · Z² · σ²
                      </span>
                      <span className="block pt-1 font-mono text-slate-300">
                        e² · (N - 1) + Z² · σ²
                      </span>
                    </span>
                  </div>
                ) : (
                  <div className="py-2 text-center font-serif text-base sm:text-lg text-white">
                    <span className="italic">n₀</span> = 
                    <span className="inline-block align-middle mx-2 text-center">
                      <span className="block border-b border-slate-600 pb-1 font-mono text-indigo-200">
                        Z² · σ²
                      </span>
                      <span className="block pt-1 font-mono text-slate-300">
                        e²
                      </span>
                    </span>
                  </div>
                )
              )}
            </div>

            {/* Step-by-Step Substitution Card */}
            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 space-y-3 font-mono text-xs text-slate-800">
              <div className="text-xs font-sans font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>2. Sustitución Numérica en Vivo:</span>
              </div>

              {approach === 'proportions' ? (
                isFinite ? (
                  <div className="space-y-2 overflow-x-auto py-1">
                    <div className="text-slate-600">
                      n = [ {populationN} · ({zValue})² · ({propP}) · ({(1 - propP).toFixed(2)}) ] / [ ({marginOfErrorProp})² · ({populationN} - 1) + ({zValue})² · ({propP}) · ({(1 - propP).toFixed(2)}) ]
                    </div>
                    <div className="text-slate-700 font-semibold">
                      n = [ {currentResult.numerator.toFixed(3)} ] / [ {currentResult.denominator.toFixed(5)} ]
                    </div>
                    <div className="text-indigo-700 font-bold text-sm">
                      n = {currentResult.exactN.toFixed(4)}  ⟹  ⌈n⌉ = {currentResult.roundedN} sujetos
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 overflow-x-auto py-1">
                    <div className="text-slate-600">
                      n₀ = [ ({zValue})² · ({propP}) · ({(1 - propP).toFixed(2)}) ] / [ ({marginOfErrorProp})² ]
                    </div>
                    <div className="text-slate-700 font-semibold">
                      n₀ = [ {currentResult.numerator.toFixed(4)} ] / [ {currentResult.denominator.toFixed(6)} ]
                    </div>
                    <div className="text-indigo-700 font-bold text-sm">
                      n₀ = {currentResult.exactN.toFixed(4)}  ⟹  ⌈n⌉ = {currentResult.roundedN} sujetos
                    </div>
                  </div>
                )
              ) : (
                isFinite ? (
                  <div className="space-y-2 overflow-x-auto py-1">
                    <div className="text-slate-600">
                      n = [ {populationN} · ({zValue})² · ({stdDev})² ] / [ ({marginOfErrorMean})² · ({populationN} - 1) + ({zValue})² · ({stdDev})² ]
                    </div>
                    <div className="text-slate-700 font-semibold">
                      n = [ {currentResult.numerator.toFixed(3)} ] / [ {currentResult.denominator.toFixed(5)} ]
                    </div>
                    <div className="text-indigo-700 font-bold text-sm">
                      n = {currentResult.exactN.toFixed(4)}  ⟹  ⌈n⌉ = {currentResult.roundedN} sujetos
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 overflow-x-auto py-1">
                    <div className="text-slate-600">
                      n₀ = [ ({zValue})² · ({stdDev})² ] / [ ({marginOfErrorMean})² ]
                    </div>
                    <div className="text-slate-700 font-semibold">
                      n₀ = [ {currentResult.numerator.toFixed(4)} ] / [ {currentResult.denominator.toFixed(6)} ]
                    </div>
                    <div className="text-indigo-700 font-bold text-sm">
                      n₀ = {currentResult.exactN.toFixed(4)}  ⟹  ⌈n⌉ = {currentResult.roundedN} sujetos
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History and Comparison Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <HistoryIcon className="w-5 h-5 text-indigo-600" />
              <span>Historial de Escenarios Guardados ({history.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Almacenado localmente en el navegador para comparar escenarios de precisión y costos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <>
                <button
                  onClick={() => exportHistoryToCSV(history)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Exportar Todo a CSV</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('¿Deseas vaciar el historial guardado?')) {
                      setHistory([]);
                    }
                  }}
                  className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  Vaciar
                </button>
              </>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Calculator className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p>No tienes escenarios guardados aún.</p>
            <p className="text-slate-500 mt-1">
              Haz clic en «Guardar en Historial» en la tarjeta del dictamen para archivar consultas.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Escenario</th>
                  <th className="py-2.5 px-3">Enfoque</th>
                  <th className="py-2.5 px-3">Población (N)</th>
                  <th className="py-2.5 px-3">Confianza</th>
                  <th className="py-2.5 px-3">Error (e)</th>
                  <th className="py-2.5 px-3">Muestra ceil(n)</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div>{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {new Date(item.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {item.approach === 'proportions' ? 'Proporciones' : 'Medias'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {item.populationType === 'finite' && item.populationSize
                        ? item.populationSize.toLocaleString('es-ES')
                        : 'Infinita'}
                    </td>
                    <td className="py-3 px-3 font-mono">{item.confidenceLevel}%</td>
                    <td className="py-3 px-3 font-mono">
                      {item.approach === 'proportions'
                        ? `${(item.marginOfError * 100).toFixed(1)}%`
                        : `${item.marginOfError} ${item.unitOfMeasurement || ''}`}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                      n = {item.roundedSampleSize}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => generateTechnicalPDFReport(item)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                          title="Descargar PDF de este escenario"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => exportSingleCalculationToCSV(item)}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                          title="Descargar CSV de este escenario"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            // Load back into calculator
                            setApproach(item.approach);
                            setConfidenceLevel(item.confidenceLevel);
                            setZValue(item.zValue);
                            if (item.populationType === 'finite' && item.populationSize) {
                              setIsFinite(true);
                              setPopulationN(item.populationSize);
                            } else {
                              setIsFinite(false);
                            }
                            if (item.approach === 'proportions') {
                              setMarginOfErrorProp(item.marginOfError);
                              if (item.p !== undefined) setPropP(item.p);
                            } else {
                              setMarginOfErrorMean(item.marginOfError);
                              if (item.stdDev !== undefined) setStdDev(item.stdDev);
                              if (item.unitOfMeasurement) setUnitOfMeasurement(item.unitOfMeasurement);
                            }
                            setScenarioName(item.name);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded cursor-pointer"
                        >
                          Cargar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

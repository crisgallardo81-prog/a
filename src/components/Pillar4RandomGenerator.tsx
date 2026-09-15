import React, { useState, useEffect } from 'react';
import { 
  Dices, 
  AlertOctagon, 
  Download, 
  ArrowUpDown, 
  Search, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  Users, 
  FileSpreadsheet,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Hash
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RandomDrawResult } from '../types';
import { exportRandomSelectionToCSV } from '../utils/csvExport';

interface Pillar4RandomGeneratorProps {
  initialN?: number;
  initialSampleN?: number;
}

export const Pillar4RandomGenerator: React.FC<Pillar4RandomGeneratorProps> = ({
  initialN = 1000,
  initialSampleN = 50,
}) => {
  // Mode selection: 1. Strata/Clusters selection, 2. Participants selection, 3. Systematic selection
  const [generationMode, setGenerationMode] = useState<'participants' | 'strata' | 'systematic'>('participants');

  // Input states
  const [totalN, setTotalN] = useState<number>(initialN);
  const [sampleN, setSampleN] = useState<number>(initialSampleN);
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(initialN);
  const [withoutReplacement, setWithoutReplacement] = useState<boolean>(true);

  // Systematic mode inputs
  const [systematicStart, setSystematicStart] = useState<number | null>(null);

  // Results state
  const [drawResult, setDrawResult] = useState<RandomDrawResult | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [sortAscending, setSortAscending] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  // Update ranges when totalN changes in participants mode
  useEffect(() => {
    if (generationMode === 'participants') {
      setRangeEnd(totalN);
    }
  }, [totalN, generationMode]);

  // Handle generation execution
  const handleExecuteDraw = () => {
    if (sampleN <= 0 || totalN <= 0) {
      alert('Tanto N como n deben ser mayores a cero.');
      return;
    }

    if (withoutReplacement && sampleN > totalN) {
      alert('En un sorteo SIN REEMPLAZO, el tamaño de muestra (n) no puede superar la población total (N).');
      return;
    }

    setIsDrawing(true);

    setTimeout(() => {
      let drawnOrder: number[] = [];

      if (generationMode === 'systematic') {
        const k = Math.floor(totalN / sampleN);
        const randomStart = Math.floor(Math.random() * k) + 1;
        setSystematicStart(randomStart);
        drawnOrder = Array.from({ length: sampleN }, (_, i) => randomStart + i * k);
      } else {
        if (withoutReplacement) {
          // Fisher-Yates shuffle sampling for exact without replacement
          const pool: number[] = [];
          for (let i = rangeStart; i <= rangeEnd; i++) {
            pool.push(i);
          }

          // Shuffle pool
          for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
          }

          drawnOrder = pool.slice(0, Math.min(sampleN, pool.length));
        } else {
          // With replacement
          for (let i = 0; i < sampleN; i++) {
            const val = Math.floor(Math.random() * (rangeEnd - rangeStart + 1)) + rangeStart;
            drawnOrder.push(val);
          }
        }
      }

      const newDraw: RandomDrawResult = {
        id: `DRAW-${Date.now().toString().slice(-6)}`,
        timestamp: Date.now(),
        title: generationMode === 'strata' 
          ? `Selección de ${sampleN} Estratos/Aulas de ${totalN}` 
          : generationMode === 'systematic'
          ? `Muestreo Sistemático (k = ${Math.floor(totalN / sampleN)})`
          : `Muestreo de ${sampleN} Participantes`,
        mode: generationMode === 'systematic'
          ? 'systematic'
          : withoutReplacement
          ? 'simple_without_replacement'
          : 'simple_with_replacement',
        totalN,
        sampleN,
        numbers: drawnOrder,
        drawOrder: [...drawnOrder],
        systematicK: generationMode === 'systematic' ? Math.floor(totalN / sampleN) : undefined,
        systematicRandomStart: generationMode === 'systematic' ? systematicStart || 1 : undefined,
      };

      setDrawResult(newDraw);
      setIsDrawing(false);

      // Trigger confetti celebration for completed draw
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // ignore if not supported
      }
    }, 450);
  };

  // Numbers to display based on sort toggle
  const displayedNumbers = drawResult
    ? sortAscending
      ? [...drawResult.numbers].sort((a, b) => a - b)
      : drawResult.drawOrder
    : [];

  // Filtered numbers based on search
  const filteredNumbers = searchQuery.trim()
    ? displayedNumbers.filter((n) => n.toString().includes(searchQuery.trim()))
    : displayedNumbers;

  // Search check if a specific ID was drawn
  const isSearchTargetDrawn = searchQuery.trim() && drawResult
    ? drawResult.numbers.includes(Number(searchQuery.trim()))
    : null;

  const copyNumbersList = () => {
    if (!drawResult) return;
    const text = displayedNumbers.join(', ');
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Pillar Title Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-semibold uppercase tracking-wider mb-2">
              <Dices className="w-3.5 h-3.5" />
              Paso 4: Generador Aleatorio
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Generador Aleatorio
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl leading-relaxed">
              Selección probabilística de unidades muestrales sin reemplazo ni sesgo humano para garantizar equiprobabilidad en campo.
            </p>
          </div>
        </div>

        {/* MANDATORY METHODOLOGICAL WARNING BANNER */}
        <div className="mt-6 p-4 sm:p-5 bg-gradient-to-r from-amber-50 via-amber-50/70 to-orange-50 border-2 border-amber-300 rounded-xl text-amber-950 flex flex-col sm:flex-row items-start gap-3.5 shadow-xs">
          <div className="p-2 bg-amber-200/80 text-amber-900 rounded-lg shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="text-xs leading-relaxed space-y-1.5">
            <h4 className="text-sm font-black uppercase tracking-wide text-amber-900 flex items-center gap-1.5">
              Condición Metodológica Obligatoria
            </h4>
            <p className="text-amber-900 font-medium">
              <strong>¡Ningún sorteo aleatorio es válido sin un Marco Muestral previo!</strong> Antes de accionar este generador, debes contar con una lista exhaustiva, actualizada y <strong>rigurosamente numerada del 1 al N</strong> de todas las unidades del universo de estudio.
            </p>
            <div className="p-2.5 bg-white/70 rounded-lg border border-amber-200 text-amber-950 space-y-1">
              <span className="font-bold text-[11px] uppercase tracking-wider block text-amber-900">
                Guía de inicio según el tipo de muestreo:
              </span>
              <ul className="space-y-0.5 text-[11px] list-disc list-inside">
                <li>
                  <strong>Muestreo Aleatorio Simple:</strong> No requiere sortear grupos; <strong>puedes empezar directamente en el Paso 2</strong> (Sorteo de Participantes).
                </li>
                <li>
                  <strong>Muestreo Estratificado o por Conglomerados:</strong> Requiere ejecutar primero el <strong>Paso 1</strong> para seleccionar los estratos/aulas y luego el <strong>Paso 2</strong> para extraer los sujetos de cada uno.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Sequential Step Chooser (One step at a time) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => {
            setGenerationMode('strata');
            setTotalN(10);
            setSampleN(3);
            setRangeStart(1);
            setRangeEnd(10);
            setDrawResult(null);
          }}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            generationMode === 'strata'
              ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-xs'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-2">
              <Layers className={`w-4 h-4 ${generationMode === 'strata' ? 'text-indigo-600' : 'text-slate-500'}`} />
              <span className="font-bold text-xs text-slate-900">Paso 1: Sorteo de Estratos o Aulas</span>
            </div>
          </div>
          <span className="inline-block px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold text-[10px] mb-1.5">
            Solo para Muestreo Estratificado
          </span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Solo se hace en caso de que sea un muestreo estratificado o por conglomerados (ej. sortear 3 de 10 grupos o facultades). El muestreo aleatorio simple puede empezar en el paso 2.
          </p>
        </button>

        <button
          onClick={() => {
            setGenerationMode('participants');
            setTotalN(initialN);
            setSampleN(initialSampleN);
            setRangeStart(1);
            setRangeEnd(initialN);
            setDrawResult(null);
          }}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            generationMode === 'participants'
              ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-xs'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-2">
              <Users className={`w-4 h-4 ${generationMode === 'participants' ? 'text-indigo-600' : 'text-slate-500'}`} />
              <span className="font-bold text-xs text-slate-900">Paso 2: Sorteo de Participantes</span>
            </div>
          </div>
          <span className="inline-block px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded font-semibold text-[10px] mb-1.5">
            Inicio para Muestreo Aleatorio Simple
          </span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Punto de inicio para el muestreo aleatorio simple sobre la lista de participantes del padrón general, o para seleccionar a los sujetos dentro de cada estrato ya definido.
          </p>
        </button>

        <button
          onClick={() => {
            setGenerationMode('systematic');
            setTotalN(1200);
            setSampleN(60);
            setDrawResult(null);
          }}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            generationMode === 'systematic'
              ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-xs'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className={`w-4 h-4 ${generationMode === 'systematic' ? 'text-indigo-600' : 'text-slate-500'}`} />
            <span className="font-bold text-xs text-slate-900">Paso 3: Sorteo Sistemático</span>
          </div>
          <span className="inline-block px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px] mb-1.5">
            Progresión a + (k * i)
          </span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Calcula el intervalo k = N/n, sortea el arranque aleatorio equiprobable (a) y genera la progresión uniforme.
          </p>
        </button>
      </div>

      {/* Generator Controls and Visual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Generator Setup Form (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900">
              {generationMode === 'strata' && 'Parámetros del Sorteo de Estratos'}
              {generationMode === 'participants' && 'Parámetros del Sorteo de Sujetos'}
              {generationMode === 'systematic' && 'Parámetros del Muestreo Sistemático'}
            </h3>

            {/* Total N and sample n */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Universo del Marco (N):
                </label>
                <input
                  type="number"
                  min="2"
                  max="500000"
                  value={totalN}
                  onChange={(e) => setTotalN(Math.max(2, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-lg bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Cantidad a Extraer (n):
                </label>
                <input
                  type="number"
                  min="1"
                  max={totalN}
                  value={sampleN}
                  onChange={(e) => setSampleN(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm font-mono font-bold border border-indigo-300 text-indigo-700 rounded-lg bg-indigo-50/30"
                />
              </div>
            </div>

            {/* Range of numbers (if in participants mode for sub-strata) */}
            {generationMode === 'participants' && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Rango Numérico del Padrón:</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    [{rangeStart} al {rangeEnd}]
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Desde ID:</span>
                    <input
                      type="number"
                      min="1"
                      value={rangeStart}
                      onChange={(e) => setRangeStart(Math.max(1, Number(e.target.value)))}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Hasta ID:</span>
                    <input
                      type="number"
                      min={rangeStart + 1}
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(Math.max(rangeStart + 1, Number(e.target.value)))}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-mono text-xs"
                    />
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Útil para extraer participantes pertenecientes a un estrato específico (ej. IDs del 1500 al 2200).
                </span>
              </div>
            )}

            {/* Replacement toggle */}
            {generationMode !== 'systematic' && (
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">
                    {withoutReplacement ? 'Sin Reemplazo (Por Defecto)' : 'Con Reemplazo'}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {withoutReplacement
                      ? 'Garantiza que ningún sujeto o aula sea seleccionada más de una vez.'
                      : 'Un mismo número puede repetirse en la muestra.'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={withoutReplacement}
                  onChange={(e) => setWithoutReplacement(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            )}

            {/* Systematic interval info */}
            {generationMode === 'systematic' && (
              <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200 text-xs space-y-1 font-mono text-indigo-950">
                <div>Intervalo de Salto: k = ⌊{totalN} / {sampleN}⌋ = <strong>{Math.floor(totalN / sampleN)}</strong></div>
                <div className="text-[11px] font-sans text-indigo-800">
                  El sistema sorteará un arranque aleatorio equiprobable en el intervalo [1, {Math.floor(totalN / sampleN)}].
                </div>
              </div>
            )}

            {/* Trigger Button */}
            <button
              onClick={handleExecuteDraw}
              disabled={isDrawing}
              className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                isDrawing
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25 active:scale-[0.98]'
              }`}
            >
              <Dices className={`w-4 h-4 ${isDrawing ? 'animate-spin' : ''}`} />
              <span>
                {isDrawing ? 'Sorteando de Manera Equiprobable...' : 'Ejecutar Sorteo Aleatorio'}
              </span>
            </button>
          </div>
        </div>

        {/* Results Visual Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs min-h-[420px] flex flex-col justify-between">
            {/* Results Header Controls */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Elementos Seleccionados ({displayedNumbers.length})</span>
                  </h3>
                  {drawResult && (
                    <span className="text-xs text-slate-500">
                      Sorteo #{drawResult.id} • {new Date(drawResult.timestamp).toLocaleTimeString('es-ES')}
                    </span>
                  )}
                </div>

                {drawResult && (
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Sort Order Button */}
                    <button
                      onClick={() => setSortAscending(!sortAscending)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      title="Alternar entre orden numérico y orden de extracción"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span>{sortAscending ? 'Orden Ascendente (1...N)' : 'Orden de Extracción'}</span>
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={copyNumbersList}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                      title="Copiar lista de números"
                    >
                      {copyFeedback ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Export to CSV Button */}
                    <button
                      onClick={() => exportRandomSelectionToCSV(drawResult)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      title="Descargar lista oficial en CSV"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>CSV</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Search / ID Checker */}
              {drawResult && (
                <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Verificar si salió el ID #..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 font-mono"
                    />
                  </div>

                  {searchQuery.trim() && (
                    <div className="text-xs font-medium flex items-center gap-1.5">
                      {isSearchTargetDrawn ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ¡El sujeto #{searchQuery.trim()} fue SELECCIONADO!
                        </span>
                      ) : (
                        <span className="text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          El ID #{searchQuery.trim()} NO forma parte de la muestra.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Grid of numbers */}
              <div className="mt-5">
                {!drawResult ? (
                  <div className="py-16 text-center text-slate-400 text-xs space-y-2">
                    <Dices className="w-10 h-10 mx-auto opacity-30 text-indigo-400" />
                    <p className="font-semibold text-slate-600 text-sm">
                      Listo para iniciar la extracción aleatoria
                    </p>
                    <p className="max-w-md mx-auto text-slate-400 text-xs">
                      Verifica que los {totalN} elementos estén previamente numerados en tu marco muestral y presiona «Ejecutar Sorteo Aleatorio».
                    </p>
                  </div>
                ) : filteredNumbers.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No se encontraron números que coincidan con la búsqueda "{searchQuery}".
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[380px] overflow-y-auto p-1 scrollbar-thin">
                    {filteredNumbers.map((num, idx) => {
                      const isHighlighted = searchQuery.trim() && num.toString() === searchQuery.trim();
                      return (
                        <div
                          key={`${num}-${idx}`}
                          className={`p-2 rounded-xl text-center font-mono font-bold text-xs transition-all border shadow-2xs ${
                            isHighlighted
                              ? 'bg-amber-400 text-amber-950 border-amber-500 scale-105 ring-2 ring-amber-400'
                              : 'bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-slate-900 border-slate-200/90'
                          }`}
                        >
                          <span className="text-[9px] text-slate-400 font-sans block leading-none mb-0.5">
                            #{idx + 1}
                          </span>
                          <span className="text-sm font-extrabold text-indigo-950">
                            {num}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Methodology Note */}
            {drawResult && (
              <div className="mt-6 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
                <span>
                  Modo: {withoutReplacement ? 'Sin reemplazo (Muestreo Equiprobable)' : 'Con reemplazo'} • Total: {drawResult.sampleN} unidades
                </span>
                <span className="font-medium text-slate-600">
                  Cotejar directamente con el listado del Marco Muestral
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

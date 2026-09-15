import React, { useState } from 'react';
import { 
  Layers, 
  Dices, 
  Building2, 
  Users2, 
  GitFork, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';
import { StratumItem } from '../types';
import { exportStrataAllocationToCSV } from '../utils/csvExport';

interface Pillar3SamplingDesignsProps {
  onGoToRandomGeneratorWithStrata?: (stratumCount: number, selectedCount: number) => void;
}

export const Pillar3SamplingDesigns: React.FC<Pillar3SamplingDesignsProps> = ({
  onGoToRandomGeneratorWithStrata,
}) => {
  const [activeTab, setActiveTab] = useState<'probabilistic' | 'non-probabilistic'>('probabilistic');
  const [selectedProbDesign, setSelectedProbDesign] = useState<'simple' | 'stratified' | 'systematic' | 'clusters'>('stratified');

  // Interactive Stratified Allocation Simulator
  const [strataList, setStrataList] = useState<StratumItem[]>([
    { id: '1', name: 'Facultad de Ciencias de la Salud (Medicina/Enfermería)', size: 1450 },
    { id: '2', name: 'Facultad de Ingeniería y Arquitectura', size: 1100 },
    { id: '3', name: 'Facultad de Ciencias Económicas y Administrativas', size: 850 },
    { id: '4', name: 'Facultad de Ciencias Sociales y Humanidades', size: 600 },
  ]);
  const [targetSampleN, setTargetSampleN] = useState<number>(352);
  const [newStratumName, setNewStratumName] = useState<string>('');
  const [newStratumSize, setNewStratumSize] = useState<number>(500);

  // Systematic Sampling Interactive Calculator
  const [sysN, setSysN] = useState<number>(1200);
  const [sysn, setSysn] = useState<number>(60);
  const [sysRandomStart, setSysRandomStart] = useState<number>(7);

  // Calculations for Stratified Allocation
  const totalN = strataList.reduce((acc, s) => acc + s.size, 0);

  // Compute proportional allocation
  const computedStrata = strataList.map((s) => {
    const fraction = totalN > 0 ? s.size / totalN : 0;
    const exactNh = fraction * targetSampleN;
    const roundedNh = Math.round(exactNh);
    return {
      ...s,
      sampleSize: roundedNh,
      percentage: fraction * 100,
    };
  });

  const sumAssignedSample = computedStrata.reduce((acc, s) => acc + (s.sampleSize || 0), 0);

  const handleAddStratum = () => {
    if (!newStratumName.trim() || newStratumSize <= 0) return;
    setStrataList((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newStratumName.trim(),
        size: newStratumSize,
      },
    ]);
    setNewStratumName('');
    setNewStratumSize(500);
  };

  const handleRemoveStratum = (id: string) => {
    if (strataList.length <= 2) {
      alert('Debe haber al menos 2 estratos para un diseño estratificado.');
      return;
    }
    setStrataList((prev) => prev.filter((s) => s.id !== id));
  };

  // Systematic interval k
  const sysK = sysn > 0 ? Math.floor(sysN / sysn) : 1;
  const sysPreviewSeries = Array.from({ length: Math.min(10, sysn) }, (_, i) => sysRandomStart + i * sysK);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Pillar header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" />
              Paso 3: Tipos de Muestreo
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Tipos de Muestreo
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl leading-relaxed">
              El tamaño de muestra <span className="font-mono">n</span> solo garantiza representatividad si la estrategia de selección de las unidades es coherente con la estructura del universo.
            </p>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('probabilistic')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'probabilistic'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Muestreos Probabilísticos (Científicos)
            </button>
            <button
              onClick={() => setActiveTab('non-probabilistic')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'non-probabilistic'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Muestreos No Probabilísticos
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'probabilistic' ? (
        <div className="space-y-6">
          {/* Sub-navigation for probabilistic designs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'stratified', label: '1. Estratificado', sub: 'Homogeneidad interna' },
              { id: 'simple', label: '2. Aleatorio Simple (MAS)', sub: 'Marco muestral' },
              { id: 'systematic', label: '3. Sistemático', sub: 'Salto k = N/n' },
              { id: 'clusters', label: '4. Conglomerados', sub: 'Aulas y grupos naturales' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedProbDesign(d.id as any)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedProbDesign === d.id
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`font-bold text-xs ${selectedProbDesign === d.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                  {d.label}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{d.sub}</div>
              </button>
            ))}
          </div>

          {/* DESIGN 1: ESTRATIFICADO CON SIMULADOR INTERACTIVO */}
          {selectedProbDesign === 'stratified' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mb-1">
                      <Building2 className="w-3.5 h-3.5" />
                      Contexto Universitario
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Muestreo Estratificado con Afijación Proporcional
                    </h3>
                  </div>
                  <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
                    Fórmula: nₕ = n · (Nₕ / N)
                  </div>
                </div>

                {/* Explanation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <strong className="text-slate-900 block mb-1 text-sm font-semibold">¿Qué es un Estrato?</strong>
                    Es una subpoblación que comparte una condición clave que influye en la variable de estudio (ej. carreras, semestres, turnos mañana/noche). Se cumple la regla metodológica:
                    <ul className="list-disc ml-4 mt-2 space-y-1 text-slate-700 font-medium">
                      <li><strong>Homogeneidad interna:</strong> Los estudiantes dentro de cada estrato son muy parecidos entre sí.</li>
                      <li><strong>Heterogeneidad externa:</strong> Los estratos difieren marcadamente unos de otros.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <strong className="text-slate-900 block mb-1 text-sm font-semibold">Asignación Proporcional (Afijación)</strong>
                    Garantiza que ningún estrato quede sub-representado ni sobre-representado en la muestra final. Cada estrato aporta exactamente una proporción de participantes idéntica a su peso en el universo total:
                    <div className="mt-2 font-mono text-indigo-900 bg-white p-2 rounded border border-slate-200">
                      Peso Wₕ = Nₕ / N  ⟹  nₕ = n · Wₕ
                    </div>
                  </div>
                </div>

                {/* Interactive Stratified Simulator */}
                <div className="p-5 bg-indigo-50/40 rounded-xl border border-indigo-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-indigo-950 flex items-center gap-1.5">
                        <Users2 className="w-4 h-4 text-indigo-600" />
                        Simulador Interactivo de Afijación Proporcional en Campus
                      </h4>
                      <p className="text-xs text-indigo-900/80 mt-0.5">
                        Edita los tamaños poblacionales por facultad o estrato para repartir el tamaño muestral <span className="font-mono font-bold">n</span>.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-700 shrink-0">Muestra Total Deseada (n):</label>
                      <input
                        type="number"
                        min="10"
                        max="10000"
                        value={targetSampleN}
                        onChange={(e) => setTargetSampleN(Math.max(1, Number(e.target.value)))}
                        className="w-24 px-2.5 py-1.5 text-xs font-mono font-bold text-indigo-700 bg-white border border-indigo-300 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Table of Strata */}
                  <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Estrato Universitario</th>
                          <th className="py-2.5 px-3">Población (Nₕ)</th>
                          <th className="py-2.5 px-3">Peso Relativo (Wₕ)</th>
                          <th className="py-2.5 px-3">Muestra Asignada (nₕ)</th>
                          <th className="py-2.5 px-3 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {computedStrata.map((stratum) => (
                          <tr key={stratum.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-medium text-slate-900">
                              {stratum.name}
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              <input
                                type="number"
                                min="1"
                                value={stratum.size}
                                onChange={(e) => {
                                  const val = Math.max(1, Number(e.target.value));
                                  setStrataList((prev) =>
                                    prev.map((s) => (s.id === stratum.id ? { ...s, size: val } : s))
                                  );
                                }}
                                className="w-28 px-2 py-1 border border-slate-200 rounded font-mono text-xs"
                              />
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">
                              {stratum.percentage?.toFixed(2)}%
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                              nₕ = {stratum.sampleSize}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleRemoveStratum(stratum.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                title="Eliminar estrato"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {/* Summary footer */}
                        <tr className="bg-indigo-50/60 font-bold text-slate-900 border-t border-indigo-200">
                          <td className="py-3 px-3">TOTAL UNIVERSO Y MUESTRA</td>
                          <td className="py-3 px-3 font-mono text-slate-900">N = {totalN.toLocaleString('es-ES')}</td>
                          <td className="py-3 px-3 font-mono">100.00%</td>
                          <td className="py-3 px-3 font-mono text-indigo-700">n = {sumAssignedSample}</td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => exportStrataAllocationToCSV(computedStrata, totalN, sumAssignedSample)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50 rounded-lg cursor-pointer shadow-2xs"
                            >
                              <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                              <span>CSV</span>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Add Stratum Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Nuevo estrato (ej. Turno Noche / Carrera Odontología)"
                      value={newStratumName}
                      onChange={(e) => setNewStratumName(e.target.value)}
                      className="flex-1 min-w-[200px] px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                    <input
                      type="number"
                      placeholder="Población N_h"
                      min="1"
                      value={newStratumSize}
                      onChange={(e) => setNewStratumSize(Math.max(1, Number(e.target.value)))}
                      className="w-32 px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                    />
                    <button
                      onClick={handleAddStratum}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Estrato</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DESIGN 2: ALEATORIO SIMPLE */}
          {selectedProbDesign === 'simple' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Dices className="w-5 h-5 text-indigo-600" />
                <span>Muestreo Aleatorio Simple (MAS)</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                Es la técnica fundacional del muestreo probabilístico. En el MAS, <strong>todos y cada uno de los elementos del universo tienen exactamente la misma probabilidad de ser seleccionados</strong> (<span className="font-mono">P = 1/N</span>).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5 text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Condición Metodológica Obligatoria
                  </div>
                  <p className="text-amber-900 leading-relaxed">
                    Requiere un <strong>Marco Muestral</strong> completo, actualizado y rigurosamente numerado del <span className="font-mono">1</span> al <span className="font-mono">N</span>. Sin este listado identificatorio previo, no es posible efectuar el sorteo aleatorio equiprobable.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 text-sm">Procedimiento Paso a Paso</div>
                  <ol className="list-decimal ml-4 space-y-1 text-slate-600 leading-relaxed">
                    <li>Obtener la lista oficial del universo (nómina de matrícula, empleados).</li>
                    <li>Asignar un número correlativo secuencial único (1, 2, ..., N).</li>
                    <li>Calcular el tamaño muestral <span className="font-mono">n</span> en la Calculadora.</li>
                    <li>Utilizar el <strong>Generador Aleatorio sin reemplazo</strong> del Pilar 4.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* DESIGN 3: SISTEMÁTICO */}
          {selectedProbDesign === 'systematic' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GitFork className="w-5 h-5 text-indigo-600" />
                <span>Muestreo Sistemático: Intervalo de Salto (k = N/n) y Arranque Aleatorio</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                Se utiliza cuando los elementos del marco muestral están ordenados de manera natural (listas alfabéticas, expedientes en estanterías, llegada de pacientes a una consulta). Selecciona una unidad cada <span className="font-mono">k</span> elementos tras un arranque aleatorio inicial.
              </p>

              {/* Interactive Demonstration */}
              <div className="p-5 bg-slate-900 text-white rounded-xl space-y-4">
                <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Simulador de Parámetros Sistemáticos
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Población (N):</label>
                    <input
                      type="number"
                      value={sysN}
                      onChange={(e) => setSysN(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Muestra deseada (n):</label>
                    <input
                      type="number"
                      value={sysn}
                      onChange={(e) => setSysn(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Arranque Aleatorio (a ∈ [1, {sysK}]):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max={sysK}
                        value={sysRandomStart}
                        onChange={(e) => setSysRandomStart(Math.min(sysK, Math.max(1, Number(e.target.value))))}
                        className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-slate-800 border border-slate-700 rounded-lg text-indigo-300"
                      />
                      <button
                        onClick={() => setSysRandomStart(Math.floor(Math.random() * sysK) + 1)}
                        className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-xs text-white shrink-0 cursor-pointer"
                        title="Sortear arranque"
                      >
                        Sortear a
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-slate-400">Intervalo de Salto calculado:</span>
                    <span className="font-mono font-bold text-indigo-400 text-sm">
                      k = ⌊{sysN} / {sysn}⌋ = {sysK}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mb-1">
                    Primeros 10 elementos seleccionados en la secuencia sistemática:
                  </div>
                  <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                    {sysPreviewSeries.map((num, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-slate-200">
                        #{num}
                      </span>
                    ))}
                    <span className="px-2 py-1 text-slate-500 font-mono">... ({sysn} total)</span>
                  </div>
                </div>
              </div>

              {/* Bias Warning */}
              <div className="p-3.5 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-xs flex items-start gap-2 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Cuidado Metodológico con la Periodicidad Oculta:</strong> Si la lista tiene un orden cíclico que coincide con el intervalo <span className="font-mono">k</span> (ej. listas donde cada 7.° elemento es siempre el delegado de aula o un día sábado), se generará un grave sesgo sistemático en la inferencia.
                </div>
              </div>
            </div>
          )}

          {/* DESIGN 4: CONGLOMERADOS */}
          {selectedProbDesign === 'clusters' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span>Muestreo por Conglomerados (Clusters)</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                Se aplica cuando no se tiene una lista de individuos pero sí una lista de agrupaciones naturales geográficas o institucionales (aulas completas, centros de salud, manzanas urbanas).
              </p>

              {/* Crucial comparison: Stratified vs Clusters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200">
                  <div className="font-bold text-indigo-900 text-sm mb-2">
                    Muestreo Estratificado (MAE)
                  </div>
                  <ul className="space-y-1.5 text-indigo-950">
                    <li>• <strong>Homogeneidad interna:</strong> Unidades dentro del estrato se parecen.</li>
                    <li>• <strong>Heterogeneidad externa:</strong> Estratos muy distintos entre sí.</li>
                    <li>• <strong>Selección:</strong> Se extrae muestra de <strong>TODOS</strong> los estratos.</li>
                    <li>• <strong>Meta:</strong> Ganar precisión estadística y comparar subgrupos.</li>
                  </ul>
                </div>

                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
                  <div className="font-bold text-emerald-900 text-sm mb-2">
                    Muestreo por Conglomerados
                  </div>
                  <ul className="space-y-1.5 text-emerald-950">
                    <li>• <strong>Heterogeneidad interna:</strong> Cada conglomerado reproduce la diversidad del universo (un aula tiene alumnos de distinto rendimiento).</li>
                    <li>• <strong>Homogeneidad externa:</strong> Conglomerados semejantes entre sí.</li>
                    <li>• <strong>Selección:</strong> Se sortea solo un <strong>subgrupo de conglomerados</strong> completos.</li>
                    <li>• <strong>Meta:</strong> Reducir costos de desplazamiento y logística.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* NON-PROBABILISTIC SAMPLING GUIDE */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded">
                Limitación Inferencial
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Muestreos No Probabilísticos: Técnicas, Sesgos y Cuándo son Admisibles
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                En los muestreos no probabilísticos, la probabilidad de selección de cada unidad es desconocida o nula para ciertos individuos. Por tanto, <strong>no es matemáticamente posible calcular el error estándar ni realizar inferencia estadística con validez externa formal</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: '1. Muestreo por Conveniencia',
                  desc: 'Se seleccionan sujetos fácilmente accesibles al investigador (ej. estudiantes que cruzan el patio, personas que responden un formulario en Twitter/Instagram).',
                  bias: 'Sesgo del voluntario y sesgo de conveniencia. Los voluntarios suelen tener opiniones más extremas o mayor disponibilidad que el promedio de la población.',
                  validWhen: 'Estudios cualitativos preliminares, validación semántica de instrumentos o pruebas piloto.',
                },
                {
                  title: '2. Muestreo por Cuotas',
                  desc: 'Fija metas porcentuales según variables demográficas (ej. 50% hombres y 50% mujeres), pero el encuestador elige a discreción a los participantes hasta llenar la cuota.',
                  bias: 'Sesgo de selección personal del encuestador, quien suele evitar zonas peligrosas o sujetos de trato difícil.',
                  validWhen: 'Sondeos de opinión comercial rápidos o estudios de mercado sin marco muestral formal.',
                },
                {
                  title: '3. Muestreo en Bola de Nieve (Snowball)',
                  desc: 'Un participante inicial refiere o presenta a nuevos contactos que cumplen con el perfil de investigación, expandiendo la red sucesivamente.',
                  bias: 'Sesgo de red social y homofilia: los participantes tienden a recomendar personas con sus mismas afinidades y niveles socioeconómicos.',
                  validWhen: 'Poblaciones ocultas, estigmatizadas o de difícil acceso (ej. enfermedades raras, minorías sin registros oficiales).',
                },
                {
                  title: '4. Muestreo Intencional o por Juicio',
                  desc: 'El investigador selecciona deliberadamente a sujetos con base en su pericia o criterio experto específico.',
                  bias: 'Subjetividad inherente del juicio del evaluador; no representa la dispersión probabilística de la población.',
                  validWhen: 'Paneles de expertos (método Delphi), estudios de caso clínicos o validación de contenido por jueces.',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 text-xs space-y-2">
                  <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                  <div className="pt-2 border-t border-slate-200">
                    <span className="font-semibold text-rose-700 block">Sesgo Metodológico:</span>
                    <span className="text-slate-600">{item.bias}</span>
                  </div>
                  <div className="pt-1">
                    <span className="font-semibold text-emerald-800 block">¿Cuándo es metodológicamente admisible?:</span>
                    <span className="text-slate-600">{item.validWhen}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

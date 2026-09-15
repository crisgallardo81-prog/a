import React, { useState } from 'react';
import { 
  Users, 
  Target, 
  Sparkles, 
  TrendingDown, 
  AlertCircle, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight,
  Lightbulb,
  FileSearch,
  BookOpen
} from 'lucide-react';

export const Pillar1Conceptual: React.FC<{ onGoToCalculator: () => void }> = ({ onGoToCalculator }) => {
  // State for interactive FPC exploration demo
  const [demoN, setDemoN] = useState<number>(5000);
  const [selectedGlossary, setSelectedGlossary] = useState<string | null>('marco-muestral');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Math for demo FPC
  // Standard params: Z = 1.96 (95%), p = 0.5, e = 0.05
  const z = 1.96;
  const p = 0.5;
  const q = 0.5;
  const e = 0.05;
  const n0 = (z * z * p * q) / (e * e); // 384.16

  const exactFiniteN = (demoN * z * z * p * q) / (e * e * (demoN - 1) + z * z * p * q);
  const roundedFiniteN = Math.ceil(exactFiniteN);
  const roundedInfiniteN = Math.ceil(n0); // 385
  const reductionPercent = Math.max(0, ((n0 - exactFiniteN) / n0) * 100);
  const fpcFactor = Math.sqrt(Math.max(0, (demoN - exactFiniteN) / (demoN - 1)));

  const glossaryItems = [
    {
      id: 'poblacion',
      title: 'Universo / Población (N)',
      summary: 'Totalidad de unidades que comparten una o más características observables delimitadas temporal y espacialmente.',
      detail: 'El universo debe estar rigurosamente delimitado por criterios de inclusión y exclusión. Por ejemplo: "Todos los estudiantes matriculados en la Universidad Central durante el semestre 2026-I". Puede ser finita o infinita.',
      badge: 'Parámetro N',
    },
    {
      id: 'muestra',
      title: 'Muestra Representativa (n)',
      summary: 'Subconjunto del universo que reproduce fielmente sus variaciones y heterogeneidad.',
      detail: 'La representatividad no depende exclusivamente del tamaño absoluto (n), sino del método de selección (probabilístico vs no probabilístico). Una muestra de 10,000 voluntarios en redes sociales puede tener menor representatividad que una muestra probabilística de 384 sujetos.',
      badge: 'Estadístico n',
    },
    {
      id: 'marco-muestral',
      title: 'Marco Muestral',
      summary: 'Lista física o digital completa y actualizada donde están identificados y numerados todos los elementos de la población (del 1 al N).',
      detail: 'Es el requisito indispensable y obligatorio para realizar un muestreo probabilístico. Consiste en la nómina, padrón o base de datos exhaustiva donde cada sujeto tiene asignado un número único correlativo del 1 al N (por ejemplo: lista de estudiantes matriculados, censo de empleados o registro de historias clínicas). Sin este marco muestral previo, no es posible efectuar un sorteo aleatorio válido ni garantizar la equiprobabilidad de selección.',
      badge: 'Requisito Obligatorio',
    },
    {
      id: 'fraccion-muestreo',
      title: 'Fracción de Muestreo (f = n / N)',
      summary: 'Proporción del universo que forma parte de la muestra.',
      detail: 'Si f > 0.05 (la muestra representa más del 5% del universo), el Factor de Corrección por Finitud tiene un impacto apreciable reduciendo el número de sujetos necesarios sin comprometer la precisión.',
      badge: 'Ratio f',
    },
    {
      id: 'validez-externa',
      title: 'Validez Externa e Inferencia',
      summary: 'Capacidad metodológica de generalizar los hallazgos muestrales hacia la población total de estudio.',
      detail: 'Garantizada por la selección aleatoria equiprobable y un tamaño de muestra calculado con rigor matemático. Los errores sistemáticos o sesgos de selección destruyen la validez externa.',
      badge: 'Generalización',
    },
    {
      id: 'maxima-varianza',
      title: 'Máxima Varianza (p = 0.50, q = 0.50)',
      summary: 'Criterio conservador adoptado cuando se desconoce la proporción del fenómeno en la literatura previa.',
      detail: 'El producto p · q alcanza su valor máximo matemático (0.25) cuando p = 0.50. Esto garantiza el tamaño de muestra más seguro y robusto posible para proteger al investigador contra subestimaciones.',
      badge: 'Incertidumbre',
    },
  ];

  const quizQuestions = [
    {
      id: 1,
      question: '¿Por qué la literatura estadística fija N >= 100,000 como umbral para considerar una población infinita?',
      options: [
        'Porque en poblaciones de 100,000 o más personas ya no existen censos posibles.',
        'Porque matemáticamente el factor de corrección por finitud converge hacia 1 y la diferencia en n es de menos de 1 persona.',
        'Porque los softwares estadísticos no admiten números mayores a cinco dígitos.',
      ],
      correct: 1,
      explanation: 'Al evaluar N = 100,000 con confianza del 95% y margen de error del 5%, la muestra calculada con corrección finita es 383 y para N infinito es 384. La diferencia es de apenas una persona, por lo que la corrección por finitud deja de tener impacto práctico en la precisión.',
    },
    {
      id: 2,
      question: 'Si una investigación no cuenta con un marco muestral (lista exhaustiva y numerada del universo):',
      options: [
        'Se puede aplicar muestreo aleatorio simple siempre que se use una calculadora científica.',
        'No es posible ejecutar un muestreo probabilístico estricto; se debe recurrir a muestreos no probabilísticos o construir el marco.',
        'Se asume que la población es infinita y se calcula la muestra sin inconveniente alguno.',
      ],
      correct: 1,
      explanation: 'El marco muestral es el requisito indispensable de todo muestreo probabilístico. Sin una lista numerada del 1 al N, es imposible garantizar que todas las unidades tengan una probabilidad conocida y no nula de ser seleccionadas.',
    },
    {
      id: 3,
      question: 'Si un investigador no tiene literatura previa ni estudio piloto sobre la prevalencia de su variable cualitativa, ¿qué valor debe asignar a p?',
      options: [
        'p = 0.05, correspondiente al margen de error habitual.',
        'p = 0.50, adoptando el supuesto de máxima varianza o incertidumbre metodológica.',
        'p = 1.00, para abarcar la totalidad del fenómeno estudiado.',
      ],
      correct: 1,
      explanation: 'El valor p = 0.50 maximiza el producto p · q = 0.25, lo cual genera el tamaño muestral más conservador y robusto posible, protegiendo la investigación contra subestimaciones de la muestra requerida.',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero card: Delimitación de Población y Muestra */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Paso 1: Conceptos
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Conceptos: Delimitación de Población y Muestra
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl leading-relaxed">
              La base de todo estudio cuantitativo radica en definir con precisión qué conjunto de elementos se desea investigar y cuál es el procedimiento científico para inferir sus características sin sesgos.
            </p>
          </div>
          <button
            onClick={onGoToCalculator}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-600/20 shrink-0 cursor-pointer self-start lg:self-center"
          >
            <span>Ir a la Calculadora</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison grid: N vs n */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Card Universo N */}
          <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base">
                N
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Universo o Población Objetivo</h3>
                <span className="text-xs text-blue-600 font-medium">Parámetro Macro de Inferencia</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Es el conjunto completo de individuos, objetos, expedientes o mediciones que cumplen una serie común de especificaciones temporales y geográficas. Sus propiedades numéricas se denominan <strong>parámetros</strong> (como la media poblacional <span className="font-serif italic">μ</span> o la proporción <span className="font-serif italic">P</span>).
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs text-slate-500">
              <strong>Ejemplo en contexto universitario:</strong> «Todos los 4,500 estudiantes de pregrado con matrícula activa en el campus central en el presente ciclo lectivo».
            </div>
          </div>

          {/* Card Muestra n */}
          <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">
                n
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Muestra Representativa</h3>
                <span className="text-xs text-emerald-600 font-medium">Estadístico Micro de Observación</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Es un subgrupo rigurosamente extraído del universo que reproduce en pequeña escala las mismas características de variabilidad y proporción. Las medidas obtenidas en ella se llaman <strong>estadísticos</strong> (como la media muestral <span className="font-serif italic">x̄</span> o la proporción muestral <span className="font-serif italic">p</span>).
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs text-slate-500">
              <strong>Objetivo científico:</strong> Lograr inferencias con un margen de error (<span className="font-serif italic">e</span>) y nivel de confianza (<span className="font-serif italic">1 - α</span>) previamente declarados.
            </div>
          </div>
        </div>

        {/* 5 Reasons why sampling is imperative */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            ¿Por qué se extrae una muestra en lugar de censar a todo el universo?
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              {
                title: '1. Viabilidad Logística',
                desc: 'Contactar e indagar a millones de sujetos suele ser operativamente inalcanzable.',
              },
              {
                title: '2. Restricción de Costos',
                desc: 'Optimiza el presupuesto disponible maximizando la relación costo-efectividad de los datos.',
              },
              {
                title: '3. Economía del Tiempo',
                desc: 'Proporciona resultados en plazos oportunos antes de que la realidad fenoménica cambie.',
              },
              {
                title: '4. Ensayos Destructivos',
                desc: 'En biomedicina o control de calidad, examinar la unidad implica su consumo o destrucción.',
              },
              {
                title: '5. Mayor Calidad del Dato',
                desc: 'Un equipo encuestador reducido y altamente capacitado comete menos errores no muestrales.',
              },
            ].map((reason, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200/70 text-xs">
                <div className="font-bold text-slate-800 mb-1">{reason.title}</div>
                <div className="text-slate-500 leading-relaxed">{reason.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Criterio Metodológico: Finitud vs Infinitud y f.p.c. */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <TrendingDown className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Criterio Metodológico: Poblaciones Finitas vs. Infinitas (N ≥ 100,000)
          </h3>
        </div>
        <p className="text-slate-600 text-sm max-w-4xl leading-relaxed mb-6">
          En la literatura estadística clásica (Cochran, Kish, Hernández-Sampieri), una población se clasifica bajo dos regímenes matemáticos. Comprender el <strong>Factor de Corrección por Finitud</strong> permite saber cuándo se justifica recolectar el universo exacto y cuándo es irrelevante.
        </p>

        {/* Theoretical criteria boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="p-5 rounded-xl border border-indigo-100 bg-indigo-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-indigo-900 text-sm">Población Finita (N &lt; 100,000)</span>
              <span className="px-2 py-0.5 bg-indigo-200/60 text-indigo-800 text-xs font-semibold rounded-md">
                Aplica Corrección
              </span>
            </div>
            <p className="text-xs text-indigo-950/80 leading-relaxed mb-3">
              El universo es de tamaño acotado y conocido (ej. 800 médicos de un hospital, 3,200 alumnos de una facultad). La extracción de cada unidad sin reemplazo modifica la probabilidad de las siguientes.
            </p>
            <div className="bg-white p-3 rounded-lg border border-indigo-200/70 text-xs font-mono text-indigo-900">
              Factor f.p.c. = √[(N - n) / (N - 1)]
              <div className="text-[11px] font-sans text-indigo-700 mt-1">
                Efecto: Reduce significativamente el tamaño de muestra requerido conservando idéntica precisión.
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-sm">Población Infinita o Desconocida (N ≥ 100,000)</span>
              <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-md">
                Fórmula Base n₀
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Se asume cuando el universo es inabarcable, continuo o supera las 100,000 unidades (ej. votantes de un país, habitantes de una metrópoli). El factor de corrección se aproxima asintóticamente a 1.000.
            </p>
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800">
              lim (N → ∞) [ (N - n) / (N - 1) ] = 1.0000
              <div className="text-[11px] font-sans text-slate-500 mt-1">
                Efecto: Añadir sujetos a N a partir de 100,000 ya no altera el tamaño muestral necesario.
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Simulator of Finite Population Impact */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/80">
            <div>
              <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                Demostración Interactiva del Impacto de N
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">
                ¿Por qué N ≥ 100,000 hace indiferente el tamaño del universo?
              </h4>
            </div>
            <div className="text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              Supuesto: Confianza 95% (Z=1.96), Error 5% (e=0.05), p=0.50
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Control Slider */}
            <div className="lg:col-span-1 space-y-4">
              <label className="block text-xs font-medium text-slate-300">
                Ajusta el tamaño del Universo (N):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="200"
                  max="200000"
                  step="500"
                  value={demoN}
                  onChange={(e) => setDemoN(Number(e.target.value))}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
              </div>

              {/* Quick preset buttons for N */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[500, 1500, 5000, 20000, 50000, 100000, 200000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setDemoN(preset)}
                    className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                      demoN === preset
                        ? 'bg-indigo-500 text-white font-bold'
                        : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    N={preset.toLocaleString('es-ES')}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 text-xs text-slate-300">
                Población actual: <span className="font-bold text-white text-sm font-mono">{demoN.toLocaleString('es-ES')}</span>
                <span className="block mt-1 text-[11px] text-slate-400">
                  {demoN >= 100000 ? (
                    <span className="text-emerald-400 font-semibold">
                      ✓ Régimen Infinito: La diferencia con la muestra infinita es de apenas {roundedInfiniteN - roundedFiniteN} sujeto(s).
                    </span>
                  ) : (
                    <span className="text-amber-300 font-medium">
                      ⚡ Régimen Finito: Ahorro de muestra del {reductionPercent.toFixed(1)}% gracias al factor de corrección.
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Live Comparative Display */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Box 1: Muestra Finita */}
              <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700 text-center">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                  Muestra Finita (n)
                </span>
                <div className="text-3xl font-extrabold text-indigo-400 font-mono my-1">
                  {roundedFiniteN}
                </div>
                <span className="text-[11px] text-slate-400">
                  Exacto: {exactFiniteN.toFixed(2)}
                </span>
                <div className="mt-2 text-[10px] text-slate-300 bg-slate-700/50 py-1 px-2 rounded">
                  f = {(exactFiniteN / demoN * 100).toFixed(2)}% del universo
                </div>
              </div>

              {/* Box 2: Muestra Infinita Base */}
              <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700 text-center">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                  Muestra Infinita (n₀)
                </span>
                <div className="text-3xl font-extrabold text-slate-200 font-mono my-1">
                  {roundedInfiniteN}
                </div>
                <span className="text-[11px] text-slate-400">
                  Teórico: 384.16
                </span>
                <div className="mt-2 text-[10px] text-slate-300 bg-slate-700/50 py-1 px-2 rounded">
                  Asume N ≥ 100,000
                </div>
              </div>

              {/* Box 3: Factor de Corrección */}
              <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700 text-center">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                  Factor f.p.c.
                </span>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono my-1">
                  {fpcFactor.toFixed(4)}
                </div>
                <span className="text-[11px] text-slate-400">
                  Diferencia: {roundedInfiniteN - roundedFiniteN} sujetos
                </span>
                <div className="mt-2 text-[10px] text-emerald-300 bg-emerald-950/50 py-1 px-2 rounded border border-emerald-800/40">
                  {demoN >= 100000 ? 'Efecto despreciable' : 'Ajuste sustancial'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Glosario Metodológico Interactivo */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h3 className="text-xl font-bold text-slate-900">
            Glosario Didáctico y Criterios de Representatividad
          </h3>
        </div>
        <p className="text-slate-600 text-sm mb-6 max-w-3xl">
          Haz clic en cada concepto fundamental para desplegar su definición operativa, implicaciones metodológicas en la investigación de campo y ejemplos contextualizados.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {glossaryItems.map((item) => {
            const isSelected = selectedGlossary === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedGlossary(isSelected ? null : item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                  <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.summary}</p>
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-indigo-200/80 text-xs text-indigo-950 animate-in fade-in duration-200 leading-relaxed bg-white/70 p-2.5 rounded-lg">
                    {item.detail}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Auto-Evaluación Rápida del Estudiante */}
      <section className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Chequeo Rápido de Comprensión Metodológica
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">3 preguntas didácticas</span>
        </div>

        <div className="space-y-4">
          {quizQuestions.map((q) => {
            const userAnswer = quizAnswers[q.id];
            const isAnswered = userAnswer !== undefined;
            const isCorrect = isAnswered && userAnswer === q.correct;

            return (
              <div key={q.id} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="font-semibold text-sm text-slate-900 mb-3">
                  {q.id}. {q.question}
                </div>
                <div className="space-y-2">
                  {q.options.map((option, optIdx) => {
                    const selectedThis = userAnswer === optIdx;
                    let optionStyle = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700';

                    if (isAnswered) {
                      if (optIdx === q.correct) {
                        optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
                      } else if (selectedThis) {
                        optionStyle = 'border-rose-400 bg-rose-50 text-rose-900';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                        disabled={isAnswered}
                        className={`w-full text-left text-xs p-3 rounded-lg border transition-all flex items-start gap-2.5 cursor-pointer ${optionStyle}`}
                      >
                        <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className={`mt-3 p-3.5 rounded-xl text-xs leading-relaxed border ${
                    isCorrect 
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-300' 
                      : 'bg-rose-50 text-rose-950 border-rose-300'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1.5 w-full">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                            {isCorrect ? '¡Respuesta correcta!' : 'Respuesta incorrecta'}
                          </span>
                          <button
                            onClick={() => {
                              setQuizAnswers((prev) => {
                                const next = { ...prev };
                                delete next[q.id];
                                return next;
                              });
                            }}
                            className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 underline cursor-pointer"
                          >
                            Reintentar pregunta
                          </button>
                        </div>

                        {!isCorrect && (
                          <p className="text-rose-900 font-medium">
                            La opción correcta es la <strong>{String.fromCharCode(65 + q.correct)}:</strong> {q.options[q.correct]}
                          </p>
                        )}

                        <p className={isCorrect ? 'text-emerald-900' : 'text-slate-700'}>
                          <span className="font-semibold">{isCorrect ? 'Explicación: ' : 'Fundamento: '}</span>
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

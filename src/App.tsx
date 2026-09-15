import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Pillar1Conceptual } from './components/Pillar1Conceptual';
import { Pillar2Calculator } from './components/Pillar2Calculator';
import { Pillar3SamplingDesigns } from './components/Pillar3SamplingDesigns';
import { Pillar4RandomGenerator } from './components/Pillar4RandomGenerator';
import { HistoryDrawer } from './components/HistoryDrawer';
import { CalculationScenario } from './types';
import { GraduationCap, BookOpen, Calculator, Layers, Dices } from 'lucide-react';

const LOCAL_STORAGE_HISTORY_KEY = 'lab_muestreo_history_v1';

export default function App() {
  const [activePillar, setActivePillar] = useState<number>(1);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Cross-pillar communication states
  const [generatorInitialN, setGeneratorInitialN] = useState<number>(3500);
  const [generatorInitialSampleN, setGeneratorInitialSampleN] = useState<number>(347);

  // Calculation scenarios history with localStorage persistence
  const [history, setHistory] = useState<CalculationScenario[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read history from localStorage', e);
    }
    // Default initial demonstration scenarios for student exploration
    return [
      {
        id: 'CALC-952041',
        timestamp: Date.now() - 3600000 * 2,
        name: 'Encuesta Estudiantes Pregrado (Caso Estándar)',
        approach: 'proportions',
        populationType: 'finite',
        confidenceLevel: 95,
        zValue: 1.96,
        marginOfError: 0.05,
        populationSize: 3500,
        p: 0.50,
        q: 0.50,
        exactSampleSize: 346.28,
        roundedSampleSize: 347,
        infiniteBaseSize: 384.16,
        finiteCorrectionFactorApplied: true,
        samplingFraction: 0.0989,
      },
      {
        id: 'CALC-841920',
        timestamp: Date.now() - 3600000 * 5,
        name: 'Evaluación de Rendimiento Académico (Medias)',
        approach: 'means',
        populationType: 'finite',
        confidenceLevel: 95,
        zValue: 1.96,
        marginOfError: 2.0,
        populationSize: 1200,
        stdDev: 14.5,
        unitOfMeasurement: 'puntos',
        exactSampleSize: 173.84,
        roundedSampleSize: 174,
        infiniteBaseSize: 201.88,
        finiteCorrectionFactorApplied: true,
        samplingFraction: 0.1449,
      },
    ];
  });

  // Save history updates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Could not persist history to localStorage', e);
    }
  }, [history]);

  // Handler to jump from Calculator (Pillar 2) to Random Generator (Pillar 4)
  const handleGoToRandomGenerator = (sampleSize: number, populationSize?: number) => {
    setGeneratorInitialSampleN(sampleSize);
    if (populationSize) {
      setGeneratorInitialN(populationSize);
    }
    setActivePillar(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler to load scenario from history drawer
  const handleLoadScenario = (scenario: CalculationScenario) => {
    setActivePillar(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Main Navigation Header */}
      <Header
        activePillar={activePillar}
        setActivePillar={(p) => {
          setActivePillar(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Progress tracker ribbon */}
        <div className="mb-6 hidden md:flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-slate-200/90 text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Secuencia de Aprendizaje:</span>
            <span className="text-slate-400">Paso a paso metodológico</span>
          </div>

          <div className="flex items-center gap-3">
            {[
              { id: 1, label: '1. Conceptos', icon: BookOpen },
              { id: 2, label: '2. Cálculo', icon: Calculator },
              { id: 3, label: '3. Tipos de Muestreo', icon: Layers },
              { id: 4, label: '4. Generador Aleatorio', icon: Dices },
            ].map((step) => {
              const StepIcon = step.icon;
              const isCurrent = activePillar === step.id;
              const isPast = activePillar > step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActivePillar(step.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : isPast
                      ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <StepIcon className="w-3.5 h-3.5" />
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Pillar Views */}
        {activePillar === 1 && (
          <Pillar1Conceptual onGoToCalculator={() => setActivePillar(2)} />
        )}

        {activePillar === 2 && (
          <Pillar2Calculator
            history={history}
            setHistory={setHistory}
            onGoToRandomGeneratorWithSample={handleGoToRandomGenerator}
          />
        )}

        {activePillar === 3 && (
          <Pillar3SamplingDesigns
            onGoToRandomGeneratorWithStrata={(stratumCount, selectedCount) => {
              setGeneratorInitialN(stratumCount);
              setGeneratorInitialSampleN(selectedCount);
              setActivePillar(4);
            }}
          />
        )}

        {activePillar === 4 && (
          <Pillar4RandomGenerator
            initialN={generatorInitialN}
            initialSampleN={generatorInitialSampleN}
          />
        )}
      </main>

      {/* History Drawer Modal */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        setHistory={setHistory}
        onLoadScenario={handleLoadScenario}
      />

      {/* Academic Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs mt-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-800">
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <span>Elección de los Participantes</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
                Herramienta didáctica para guiar la selección científica y metodológica de muestras en investigación, con fórmulas matemáticas paso a paso y sorteo probabilístico en campo.
              </p>
            </div>

            <div>
              <div className="text-white font-semibold text-xs mb-2">Fundamentos Metodológicos</div>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>• Cochran, W.G. (1977). Sampling Techniques.</li>
                <li>• Kish, L. (1965). Survey Sampling. Wiley.</li>
                <li>• Hernández-Sampieri, R. Metodología de la Investigación.</li>
                <li>• Factor de Corrección por Finitud (f.p.c.)</li>
              </ul>
            </div>

            <div>
              <div className="text-white font-semibold text-xs mb-2">Módulos del Sistema</div>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li><button onClick={() => setActivePillar(1)} className="hover:text-white cursor-pointer">1. Conceptos (Población y Muestra)</button></li>
                <li><button onClick={() => setActivePillar(2)} className="hover:text-white cursor-pointer">2. Calculadora con Reportes PDF/CSV</button></li>
                <li><button onClick={() => setActivePillar(3)} className="hover:text-white cursor-pointer">3. Tipos de Muestreo</button></li>
                <li><button onClick={() => setActivePillar(4)} className="hover:text-white cursor-pointer">4. Generador Aleatorio</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <div>
              Elección de los Participantes • Guía metodológica para estudiantes e investigadores.
            </div>
            <div>
              Garantía de rigor estadístico • Redondeo metodológico superior ⌈n⌉
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

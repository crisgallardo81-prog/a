import React from 'react';
import { 
  BookOpen, 
  Calculator, 
  Layers, 
  Dices, 
  GraduationCap, 
  History,
  FileSpreadsheet
} from 'lucide-react';

interface HeaderProps {
  activePillar: number;
  setActivePillar: (pillar: number) => void;
  historyCount: number;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePillar,
  setActivePillar,
  historyCount,
  onOpenHistory,
}) => {
  const pillars = [
    {
      id: 1,
      name: '1. Conceptos',
      subtitle: 'Población vs. Muestra y Finitud',
      icon: BookOpen,
      badge: 'Teoría',
    },
    {
      id: 2,
      name: '2. Calculadora',
      subtitle: 'Tamaño de Muestra & Fórmulas',
      icon: Calculator,
      badge: 'Cálculo',
    },
    {
      id: 3,
      name: '3. Tipos de Muestreo',
      subtitle: 'Probabilístico y No Probabilístico',
      icon: Layers,
      badge: 'Métodos',
    },
    {
      id: 4,
      name: '4. Generador Aleatorio',
      subtitle: 'Marco Muestral & Sorteo',
      icon: Dices,
      badge: 'Sorteo',
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top institution bar */}
      <div className="bg-slate-900 text-slate-100 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1 bg-indigo-500/20 text-indigo-300 rounded font-semibold text-[11px] tracking-wide uppercase">
              Guía Metodológica
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-300 font-medium">Elección de los Participantes en Investigación</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <button
              onClick={onOpenHistory}
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-xs"
              title="Ver consultas guardadas en el navegador"
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>Historial ({historyCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main app bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight tracking-tight">
                Elección de los Participantes
              </h1>
              <p className="text-xs text-slate-500 font-normal">
                De la teoría estadística a la selección aleatoria en campo
              </p>
            </div>
          </div>

          {/* Pillars Navigation Pills */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              const isActive = activePillar === pillar.id;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActivePillar(pillar.id)}
                  id={`nav-pillar-${pillar.id}`}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-left transition-all cursor-pointer whitespace-nowrap text-xs font-semibold ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <div className="flex flex-col">
                    <span>{pillar.name}</span>
                  </div>
                  {isActive && (
                    <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                      Activo
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

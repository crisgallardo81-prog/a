import React from 'react';
import { 
  X, 
  History, 
  FileText, 
  Download, 
  Trash2, 
  Calculator, 
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { CalculationScenario } from '../types';
import { generateTechnicalPDFReport } from '../utils/pdfExport';
import { exportSingleCalculationToCSV, exportHistoryToCSV } from '../utils/csvExport';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: CalculationScenario[];
  setHistory: React.Dispatch<React.SetStateAction<CalculationScenario[]>>;
  onLoadScenario: (scenario: CalculationScenario) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  setHistory,
  onLoadScenario,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Historial de Consultas Guardadas
              </h3>
              <p className="text-xs text-slate-500">
                {history.length} cálculo(s) almacenados en este navegador
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {history.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs space-y-2">
              <Calculator className="w-10 h-10 mx-auto opacity-30 text-indigo-400" />
              <p className="font-semibold text-slate-600 text-sm">
                No hay cálculos en el historial
              </p>
              <p className="text-slate-500 max-w-xs mx-auto">
                Realiza un cálculo en el Pilar 2 y pulsa «Guardar en Historial» para archivar y comparar tus escenarios.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(item.timestamp).toLocaleString('es-ES')} • {item.id}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                    n = {item.roundedSampleSize}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs py-2 px-3 bg-slate-50 rounded-lg text-slate-600 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Enfoque:</span>
                    <span className="font-bold text-slate-800">
                      {item.approach === 'proportions' ? 'Proporciones' : 'Medias'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Población (N):</span>
                    <span className="font-bold text-slate-800">
                      {item.populationType === 'finite' && item.populationSize
                        ? item.populationSize.toLocaleString('es-ES')
                        : 'Infinita'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Conf. / Error:</span>
                    <span className="font-bold text-slate-800">
                      {item.confidenceLevel}% / {item.approach === 'proportions' ? `${(item.marginOfError * 100).toFixed(1)}%` : item.marginOfError}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => generateTechnicalPDFReport(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                    >
                      <FileText className="w-3 h-3 text-indigo-600" />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => exportSingleCalculationToCSV(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-700 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                      <span>CSV</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onLoadScenario(item);
                      onClose();
                    }}
                    className="font-semibold text-indigo-600 hover:text-indigo-800 px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer text-[11px]"
                  >
                    Cargar en Calculadora →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Actions */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <button
              onClick={() => exportHistoryToCSV(history)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exportar Todo a CSV</span>
            </button>

            <button
              onClick={() => {
                if (confirm('¿Deseas vaciar todos los registros del historial?')) {
                  setHistory([]);
                }
              }}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 px-3 py-2 rounded-lg hover:bg-rose-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar Historial</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

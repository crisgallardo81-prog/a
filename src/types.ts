export type SamplingApproach = 'proportions' | 'means';

export type PopulationType = 'finite' | 'infinite';

export interface ConfidenceLevelPreset {
  label: string;
  confidencePercent: number;
  zValue: number;
  description: string;
}

export interface CalculationScenario {
  id: string;
  timestamp: number;
  name: string;
  approach: SamplingApproach;
  populationType: PopulationType;
  // Parameters
  confidenceLevel: number; // e.g. 95
  zValue: number; // e.g. 1.96
  marginOfError: number; // e.g. 0.05 or 2.5
  populationSize?: number; // N
  // Proportions specific
  p?: number; // 0.50
  q?: number; // 0.50
  // Means specific
  stdDev?: number; // sigma
  unitOfMeasurement?: string; // e.g. "puntos", "kg", "horas"
  // Results
  exactSampleSize: number; // e.g. 277.71
  roundedSampleSize: number; // e.g. 278
  infiniteBaseSize: number; // n0 before finite correction
  finiteCorrectionFactorApplied: boolean;
  samplingFraction?: number; // n / N
  notes?: string;
}

export interface StratumItem {
  id: string;
  name: string;
  size: number; // Nh
  sampleSize?: number; // nh
  percentage?: number; // % of total N
}

export interface RandomDrawResult {
  id: string;
  timestamp: number;
  title: string;
  mode: 'simple_without_replacement' | 'simple_with_replacement' | 'strata_selection' | 'systematic';
  totalN: number;
  sampleN: number;
  numbers: number[];
  drawOrder: number[];
  systematicK?: number;
  systematicRandomStart?: number;
  strataContext?: string;
}

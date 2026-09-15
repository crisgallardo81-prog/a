import { ConfidenceLevelPreset } from '../types';

export const CONFIDENCE_PRESETS: ConfidenceLevelPreset[] = [
  {
    label: '90%',
    confidencePercent: 90,
    zValue: 1.645,
    description: 'Estudios exploratorios, pruebas piloto o márgenes preliminares (α = 0.10)',
  },
  {
    label: '95%',
    confidencePercent: 95,
    zValue: 1.96,
    description: 'Estándar de oro científico en ciencias sociales, biomédicas y de la conducta (α = 0.05)',
  },
  {
    label: '99%',
    confidencePercent: 99,
    zValue: 2.576,
    description: 'Alta exigencia metodológica, estudios clínicos críticos o farmacológicos (α = 0.01)',
  },
];

/**
 * Calculates the standard normal critical value Z for any confidence level (e.g. 95 -> 1.96).
 * Uses rational approximation for standard normal inverse CDF.
 */
export function calculateZFromConfidence(confidencePercent: number): number {
  const rounded = Math.round(confidencePercent * 10) / 10;
  if (rounded === 90) return 1.645;
  if (rounded === 95) return 1.96;
  if (rounded === 99) return 2.576;
  if (rounded === 98) return 2.326;

  const alpha = 1 - confidencePercent / 100;
  const p = 1 - alpha / 2;

  // Abramowitz and Stegun rational approximation
  const t = Math.sqrt(-2 * Math.log(1 - p));
  const c0 = 2.515517;
  const c1 = 0.802853;
  const c2 = 0.010328;
  const d1 = 1.432788;
  const d2 = 0.189269;
  const d3 = 0.001308;

  const z = t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t);
  return Math.round(z * 1000) / 1000;
}

export interface CalculationResult {
  approach: 'proportions' | 'means';
  isFinite: boolean;
  populationSize?: number;
  zValue: number;
  confidenceLevel: number;
  marginOfError: number;
  // Proportions
  p?: number;
  q?: number;
  // Means
  stdDev?: number;
  unitOfMeasurement?: string;

  // Intermediate values
  n0: number; // sample size for infinite population
  numerator: number;
  denominator: number;
  exactN: number;
  roundedN: number; // ceiling
  samplingFraction?: number; // n / N
  fpcPercentReduction?: number; // How much % reduction compared to infinite
}

export function calculateSampleSizeProportions(params: {
  confidenceLevel: number;
  zValue: number;
  marginOfError: number; // in proportion (e.g. 0.05)
  p: number; // e.g. 0.50
  populationSize?: number; // N
  isFinite: boolean;
}): CalculationResult {
  const { confidenceLevel, zValue, marginOfError, p, isFinite } = params;
  const q = 1 - p;
  const e = marginOfError;
  const z2 = zValue * zValue;
  const pq = p * q;

  // Infinite formula: n0 = (Z^2 * p * q) / e^2
  const n0 = (z2 * pq) / (e * e);

  if (!isFinite || !params.populationSize || params.populationSize <= 0) {
    const roundedN = Math.ceil(n0);
    return {
      approach: 'proportions',
      isFinite: false,
      zValue,
      confidenceLevel,
      marginOfError: e,
      p,
      q,
      n0,
      numerator: z2 * pq,
      denominator: e * e,
      exactN: n0,
      roundedN,
      fpcPercentReduction: 0,
    };
  }

  const N = params.populationSize;
  // Finite formula: n = (N * Z^2 * p * q) / (e^2 * (N - 1) + Z^2 * p * q)
  const num = N * z2 * pq;
  const den = e * e * (N - 1) + z2 * pq;
  const exactN = num / den;
  const roundedN = Math.ceil(exactN);
  const samplingFraction = exactN / N;
  const fpcPercentReduction = Math.max(0, ((n0 - exactN) / n0) * 100);

  return {
    approach: 'proportions',
    isFinite: true,
    populationSize: N,
    zValue,
    confidenceLevel,
    marginOfError: e,
    p,
    q,
    n0,
    numerator: num,
    denominator: den,
    exactN,
    roundedN,
    samplingFraction,
    fpcPercentReduction,
  };
}

export function calculateSampleSizeMeans(params: {
  confidenceLevel: number;
  zValue: number;
  marginOfError: number; // in units of measurement
  stdDev: number; // sigma
  populationSize?: number; // N
  isFinite: boolean;
  unitOfMeasurement?: string;
}): CalculationResult {
  const { confidenceLevel, zValue, marginOfError, stdDev, isFinite, unitOfMeasurement } = params;
  const e = marginOfError;
  const sigma = stdDev;
  const z2 = zValue * zValue;
  const s2 = sigma * sigma;

  // Infinite formula: n0 = (Z^2 * sigma^2) / e^2
  const n0 = (z2 * s2) / (e * e);

  if (!isFinite || !params.populationSize || params.populationSize <= 0) {
    const roundedN = Math.ceil(n0);
    return {
      approach: 'means',
      isFinite: false,
      zValue,
      confidenceLevel,
      marginOfError: e,
      stdDev: sigma,
      unitOfMeasurement: unitOfMeasurement || 'unidades',
      n0,
      numerator: z2 * s2,
      denominator: e * e,
      exactN: n0,
      roundedN,
      fpcPercentReduction: 0,
    };
  }

  const N = params.populationSize;
  // Finite formula: n = (N * Z^2 * sigma^2) / (e^2 * (N - 1) + Z^2 * sigma^2)
  const num = N * z2 * s2;
  const den = e * e * (N - 1) + z2 * s2;
  const exactN = num / den;
  const roundedN = Math.ceil(exactN);
  const samplingFraction = exactN / N;
  const fpcPercentReduction = Math.max(0, ((n0 - exactN) / n0) * 100);

  return {
    approach: 'means',
    isFinite: true,
    populationSize: N,
    zValue,
    confidenceLevel,
    marginOfError: e,
    stdDev: sigma,
    unitOfMeasurement: unitOfMeasurement || 'unidades',
    n0,
    numerator: num,
    denominator: den,
    exactN,
    roundedN,
    samplingFraction,
    fpcPercentReduction,
  };
}

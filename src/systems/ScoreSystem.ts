/**
 * ScoreSystem - Sistema de puntuación para niveles
 * Calcula el score basado en múltiples factores con multiplicadores balanceados
 */

/**
 * Datos recopilados durante un nivel normal (1-5)
 */
export interface LevelStats {
  /** Monedas recogidas */
  coinsCollected: number;
  /** Total de monedas en el nivel */
  totalCoins: number;
  /** Mini-pingus recogidos */
  miniPingusCollected: number;
  /** Total de mini-pingus en el nivel (siempre 3) */
  totalMiniPingus: number;
  /** Tiempo en segundos para completar el nivel */
  timeInSeconds: number;
  /** Vidas perdidas durante el nivel */
  livesMissed: number;
}

/**
 * Datos recopilados durante el nivel BOSS
 */
export interface BossLevelStats {
  /** Tiempo en segundos para derrotar al boss */
  timeInSeconds: number;
  /** Vidas perdidas durante la batalla */
  livesMissed: number;
}

/**
 * Resultado del cálculo de score con desglose
 */
export interface ScoreBreakdown {
  /** Puntos por monedas */
  coinPoints: number;
  /** Puntos por mini-pingus */
  miniPinguPoints: number;
  /** Multiplicador de tiempo (0.5 - 2.0) */
  timeMultiplier: number;
  /** Multiplicador de vidas (0.5 - 2.0) */
  livesMultiplier: number;
  /** Score base (antes de multiplicadores) */
  baseScore: number;
  /** Score final (después de multiplicadores) */
  finalScore: number;
}

/**
 * Constantes para el cálculo de score
 */
const SCORE_CONSTANTS = {
  // Puntos base por elemento
  COIN_POINTS: 10, // 10 puntos por moneda
  MINI_PINGU_POINTS: 100, // 100 puntos por mini-pingu (10x más que una moneda)

  // Tiempos objetivo (en segundos) para multiplicadores perfectos
  FAST_TIME_THRESHOLD: 60, // Menos de 1 minuto = multiplicador máximo
  SLOW_TIME_THRESHOLD: 300, // Más de 5 minutos = multiplicador mínimo

  // Multiplicadores de tiempo
  TIME_MULTIPLIER_MAX: 2.0, // x2.0 si terminas muy rápido
  TIME_MULTIPLIER_MIN: 0.5, // x0.5 si tardas mucho

  // Multiplicadores de vidas
  LIVES_MULTIPLIER_PERFECT: 2.0, // x2.0 si no pierdes ninguna vida
  LIVES_MULTIPLIER_MIN: 0.5, // x0.5 si pierdes las 3 vidas

  // Boss level - tiempos objetivo
  BOSS_FAST_TIME: 120, // 2 minutos para boss
  BOSS_SLOW_TIME: 600, // 10 minutos para boss
  BOSS_BASE_SCORE: 1000, // Score base por derrotar al boss
};

/**
 * Calcula el multiplicador de tiempo basado en qué tan rápido completaste el nivel
 * @param timeInSeconds - Tiempo que tardaste en completar el nivel
 * @param isBossLevel - Si es el nivel boss (tiempos diferentes)
 * @returns Multiplicador entre 0.5 y 2.0
 */
function calculateTimeMultiplier(
  timeInSeconds: number,
  isBossLevel: boolean = false
): number {
  const fastThreshold = isBossLevel
    ? SCORE_CONSTANTS.BOSS_FAST_TIME
    : SCORE_CONSTANTS.FAST_TIME_THRESHOLD;
  const slowThreshold = isBossLevel
    ? SCORE_CONSTANTS.BOSS_SLOW_TIME
    : SCORE_CONSTANTS.SLOW_TIME_THRESHOLD;

  // Si terminas más rápido que el umbral rápido → multiplicador máximo
  if (timeInSeconds <= fastThreshold) {
    return SCORE_CONSTANTS.TIME_MULTIPLIER_MAX;
  }

  // Si tardas más que el umbral lento → multiplicador mínimo
  if (timeInSeconds >= slowThreshold) {
    return SCORE_CONSTANTS.TIME_MULTIPLIER_MIN;
  }

  // Interpolación lineal entre los umbrales
  const range = slowThreshold - fastThreshold;
  const position = timeInSeconds - fastThreshold;
  const ratio = position / range;

  // Interpolar de max a min
  return (
    SCORE_CONSTANTS.TIME_MULTIPLIER_MAX -
    ratio *
      (SCORE_CONSTANTS.TIME_MULTIPLIER_MAX -
        SCORE_CONSTANTS.TIME_MULTIPLIER_MIN)
  );
}

/**
 * Calcula el multiplicador de vidas basado en cuántas vidas perdiste
 * @param livesMissed - Número de vidas perdidas (0-3)
 * @returns Multiplicador entre 0.5 y 2.0
 */
function calculateLivesMultiplier(livesMissed: number): number {
  // 0 vidas perdidas = x2.0 (perfecto)
  if (livesMissed === 0) {
    return SCORE_CONSTANTS.LIVES_MULTIPLIER_PERFECT;
  }

  // 3 vidas perdidas = x0.5 (mínimo)
  if (livesMissed >= 3) {
    return SCORE_CONSTANTS.LIVES_MULTIPLIER_MIN;
  }

  // 1 vida perdida = x1.5
  // 2 vidas perdidas = x1.0
  const multipliers = [2.0, 1.5, 1.0, 0.5];
  return multipliers[livesMissed];
}

/**
 * Calcula el score de un nivel normal (1-5) con desglose completo
 * @param stats - Estadísticas del nivel completado
 * @returns Desglose completo del score
 */
export function calculateLevelScore(stats: LevelStats): ScoreBreakdown {
  // 1. Puntos por monedas (proporcional a las recogidas)
  const coinPoints = stats.coinsCollected * SCORE_CONSTANTS.COIN_POINTS;

  // 2. Puntos por mini-pingus (proporcional a los recogidos)
  const miniPinguPoints =
    stats.miniPingusCollected * SCORE_CONSTANTS.MINI_PINGU_POINTS;

  // 3. Score base (antes de multiplicadores)
  const baseScore = coinPoints + miniPinguPoints;

  // 4. Calcular multiplicadores
  const timeMultiplier = calculateTimeMultiplier(stats.timeInSeconds, false);
  const livesMultiplier = calculateLivesMultiplier(stats.livesMissed);

  // 5. Score final = base × multiplicador_tiempo × multiplicador_vidas
  const finalScore = Math.round(baseScore * timeMultiplier * livesMultiplier);

  return {
    coinPoints,
    miniPinguPoints,
    timeMultiplier,
    livesMultiplier,
    baseScore,
    finalScore,
  };
}

/**
 * Calcula el score del nivel BOSS (solo tiempo + vidas)
 * @param stats - Estadísticas del nivel boss
 * @returns Desglose completo del score
 */
export function calculateBossLevelScore(stats: BossLevelStats): ScoreBreakdown {
  // 1. Score base fijo por derrotar al boss
  const baseScore = SCORE_CONSTANTS.BOSS_BASE_SCORE;

  // 2. Calcular multiplicadores
  const timeMultiplier = calculateTimeMultiplier(stats.timeInSeconds, true);
  const livesMultiplier = calculateLivesMultiplier(stats.livesMissed);

  // 3. Score final = base × multiplicador_tiempo × multiplicador_vidas
  const finalScore = Math.round(baseScore * timeMultiplier * livesMultiplier);

  return {
    coinPoints: 0, // Boss no tiene monedas
    miniPinguPoints: 0, // Boss no tiene mini-pingus
    timeMultiplier,
    livesMultiplier,
    baseScore,
    finalScore,
  };
}

/**
 * Formatea el tiempo en segundos a formato MM:SS
 * @param seconds - Tiempo en segundos
 * @returns String formateado "MM:SS"
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Redondea el multiplicador a 1 decimal para mostrar
 * @param multiplier - Multiplicador (ej: 1.75)
 * @returns String formateado (ej: "x1.8")
 */
export function formatMultiplier(multiplier: number): string {
  return `x${multiplier.toFixed(1)}`;
}

/**
 * Ejemplos de uso:
 *
 * // Nivel normal - Perfecto (todas monedas, todos mini-pingus, rápido, sin vidas perdidas)
 * const perfectStats: LevelStats = {
 *   coinsCollected: 50,
 *   totalCoins: 50,
 *   miniPingusCollected: 3,
 *   totalMiniPingus: 3,
 *   timeInSeconds: 45,
 *   livesMissed: 0,
 * };
 * // Score: (50×10 + 3×100) × 2.0 × 2.0 = 800 × 4.0 = 3200 puntos
 *
 * // Nivel normal - Regular (mitad de monedas, 2 mini-pingus, tiempo medio, 1 vida perdida)
 * const regularStats: LevelStats = {
 *   coinsCollected: 25,
 *   totalCoins: 50,
 *   miniPingusCollected: 2,
 *   totalMiniPingus: 3,
 *   timeInSeconds: 180,
 *   livesMissed: 1,
 * };
 * // Score: (25×10 + 2×100) × 1.0 × 1.5 = 450 × 1.5 = 675 puntos
 *
 * // Boss level - Perfecto (rápido, sin vidas perdidas)
 * const perfectBoss: BossLevelStats = {
 *   timeInSeconds: 90,
 *   livesMissed: 0,
 * };
 * // Score: 1000 × 2.0 × 2.0 = 4000 puntos
 */

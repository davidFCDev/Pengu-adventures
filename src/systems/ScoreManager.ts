/**
 * ScoreManager - Gestión global de puntuaciones
 * Sistema centralizado para almacenar y recuperar scores de niveles
 * Integrado con Farcade/Remix SDK para persistencia
 */

export interface LevelScore {
  levelNumber: number;
  score: number;
  coinsCollected?: number;
  totalCoins?: number;
  miniPingusCollected?: number;
  totalMiniPingus?: number;
  timeInSeconds?: number;
  livesMissed?: number;
  completedAt?: number; // Timestamp
}

/**
 * Estructura de datos completa del juego
 * Compatible con Record<string, unknown> del SDK
 */
interface GameData extends Record<string, unknown> {
  scores: { [key: number]: LevelScore };
  unlockedLevels: number[]; // Array de índices de niveles desbloqueados (0-5)
  version: string; // Para futuras migraciones
}

/**
 * Clase singleton para gestionar scores
 */
class ScoreManagerClass {
  private static instance: ScoreManagerClass;
  private scores: Map<number, LevelScore> = new Map();
  private isSDKReady: boolean = false;
  private gameData: GameData = {
    scores: {},
    unlockedLevels: [0], // Solo nivel 1 desbloqueado al inicio (progresión)
    version: "1.0.0",
  };

  private constructor() {
    // Constructor privado para singleton
    this.initializeSDK();
  }

  public static getInstance(): ScoreManagerClass {
    if (!ScoreManagerClass.instance) {
      ScoreManagerClass.instance = new ScoreManagerClass();
    }
    return ScoreManagerClass.instance;
  }

  /**
   * Inicializar SDK y cargar datos guardados
   */
  private initializeSDK(): void {
    // Verificar si el SDK está disponible
    if (window.FarcadeSDK) {
      console.log("📊 ScoreManager: SDK de Farcade detectado");
      this.isSDKReady = true;

      // Escuchar actualizaciones del estado del juego
      window.FarcadeSDK.on("game_state_updated", (event: any) => {
        console.log(
          "📊 ScoreManager: Estado del juego actualizado desde SDK",
          event
        );
        this.loadFromSDK(event.data);
      });

      console.log("📊 ScoreManager: Inicializado con SDK");
    } else {
      console.warn("⚠️ ScoreManager: SDK no disponible, usando solo memoria");
      this.isSDKReady = false;
    }
  }

  /**
   * Cargar datos desde el SDK
   */
  private loadFromSDK(data: any): void {
    if (!data) {
      console.log("📊 ScoreManager: No hay datos guardados en SDK");
      return;
    }

    try {
      // Validar estructura de datos
      if (data.scores && typeof data.scores === "object") {
        this.gameData = data as GameData;

        // Asegurar que unlockedLevels existe (migración de datos antiguos)
        if (
          !this.gameData.unlockedLevels ||
          !Array.isArray(this.gameData.unlockedLevels)
        ) {
          console.log(
            "📊 ScoreManager: Migrando datos antiguos - inicializando niveles desbloqueados"
          );
          // Solo nivel 1 desbloqueado por defecto (progresión)
          this.gameData.unlockedLevels = [0];
        }

        // Convertir objeto a Map
        this.scores.clear();
        Object.entries(this.gameData.scores).forEach(([levelNum, score]) => {
          this.scores.set(parseInt(levelNum), score);
        });

        console.log(
          `📊 ScoreManager: ${this.scores.size} scores cargados desde SDK`
        );
        console.log(
          `📊 ScoreManager: ${this.gameData.unlockedLevels.length} niveles desbloqueados`
        );
      }
    } catch (error) {
      console.error("❌ ScoreManager: Error al cargar datos desde SDK", error);
    }
  }

  /**
   * Guardar score de un nivel
   * Solo guarda si es mejor que el score anterior
   * Desbloquea automáticamente el siguiente nivel al completar
   */
  public saveScore(scoreData: LevelScore): void {
    const levelNumber = scoreData.levelNumber;
    const currentBest = this.scores.get(levelNumber);

    // Si no hay score anterior o el nuevo es mejor, guardarlo
    if (!currentBest || scoreData.score > currentBest.score) {
      const levelScore: LevelScore = {
        ...scoreData,
        completedAt: Date.now(),
      };

      this.scores.set(levelNumber, levelScore);

      console.log(
        `📊 ScoreManager: Nuevo mejor score para Level ${levelNumber}: ${scoreData.score}`
      );

      // Desbloquear el siguiente nivel automáticamente
      // Niveles: 1-6 → índices: 0-5
      const currentLevelIndex = levelNumber - 1; // levelNumber es 1-based
      const nextLevelIndex = currentLevelIndex + 1;

      // Si hay un siguiente nivel (máximo 6 niveles, índice 5)
      if (nextLevelIndex < 6) {
        if (!this.isLevelUnlocked(nextLevelIndex)) {
          this.unlockLevel(nextLevelIndex, true); // skipSave=true para guardar solo una vez
          console.log(
            `🔓 Nivel ${nextLevelIndex + 1} desbloqueado automáticamente`
          );
        }
      }

      // Guardar en SDK (incluye scores y niveles desbloqueados)
      this.saveToSDK();
    } else {
      console.log(
        `📊 ScoreManager: Score ${scoreData.score} no supera el mejor (${currentBest.score})`
      );
    }
  }

  /**
   * Guardar todos los datos en el SDK
   */
  private saveToSDK(): void {
    if (!this.isSDKReady || !window.FarcadeSDK) {
      console.warn("⚠️ ScoreManager: SDK no disponible para guardar");
      return;
    }

    try {
      // Convertir Map a objeto plano
      const scoresObject: { [key: number]: LevelScore } = {};
      this.scores.forEach((score, levelNum) => {
        scoresObject[levelNum] = score;
      });

      // Actualizar gameData
      this.gameData = {
        scores: scoresObject,
        unlockedLevels: this.gameData.unlockedLevels, // Preservar niveles desbloqueados
        version: "1.0.0",
      };

      // Guardar en SDK usando multiplayer API (funciona también para single player)
      window.FarcadeSDK.multiplayer.actions.updateGameState({
        data: this.gameData,
        alertUserIds: [], // No necesitamos alertar a otros jugadores
      });

      console.log("✅ ScoreManager: Datos guardados en SDK", this.gameData);
    } catch (error) {
      console.error("❌ ScoreManager: Error al guardar en SDK", error);
    }
  }

  /**
   * Obtener mejor score de un nivel
   */
  public getScore(levelNumber: number): LevelScore | null {
    return this.scores.get(levelNumber) || null;
  }

  /**
   * Obtener todos los scores
   */
  public getAllScores(): LevelScore[] {
    return Array.from(this.scores.values());
  }

  /**
   * Obtener score total (suma de todos los niveles)
   */
  public getTotalScore(): number {
    let total = 0;
    this.scores.forEach((score) => {
      total += score.score;
    });
    return total;
  }

  /**
   * Verificar si un nivel ha sido completado
   */
  public isLevelCompleted(levelNumber: number): boolean {
    return this.scores.has(levelNumber);
  }

  /**
   * Resetear todos los scores (útil para testing)
   */
  public resetAllScores(): void {
    this.scores.clear();
    console.log("📊 ScoreManager: Todos los scores reseteados");

    // Resetear en SDK también
    this.saveToSDK();
  }

  /**
   * Obtener estadísticas generales
   */
  public getStats(): {
    levelsCompleted: number;
    totalScore: number;
    averageScore: number;
  } {
    const levelsCompleted = this.scores.size;
    const totalScore = this.getTotalScore();
    const averageScore =
      levelsCompleted > 0 ? Math.round(totalScore / levelsCompleted) : 0;

    return {
      levelsCompleted,
      totalScore,
      averageScore,
    };
  }

  /**
   * Verifica si un nivel está desbloqueado
   * @param levelIndex Índice del nivel (0-5 para niveles 1-6)
   * @returns true si el nivel está desbloqueado
   */
  public isLevelUnlocked(levelIndex: number): boolean {
    return this.gameData.unlockedLevels.includes(levelIndex);
  }

  /**
   * Desbloquea un nivel y persiste el cambio en el SDK
   * @param levelIndex Índice del nivel a desbloquear (0-5 para niveles 1-6)
   * @param skipSave Si es true, no guarda en SDK (útil para desbloqueo masivo)
   */
  public unlockLevel(levelIndex: number, skipSave: boolean = false): void {
    if (!this.gameData.unlockedLevels.includes(levelIndex)) {
      this.gameData.unlockedLevels.push(levelIndex);
      this.gameData.unlockedLevels.sort((a, b) => a - b); // Mantener ordenado

      if (!skipSave) {
        this.saveToSDK();
      }

      console.log(
        `✅ Nivel ${levelIndex + 1} desbloqueado${
          skipSave ? " (pendiente guardar)" : " y guardado en SDK"
        }`
      );
    }
  }

  /**
   * Obtiene el array completo de niveles desbloqueados
   * @returns Array de índices de niveles desbloqueados
   */
  public getUnlockedLevels(): number[] {
    return [...this.gameData.unlockedLevels]; // Retornar copia para evitar mutaciones
  }

  /**
   * Obtiene un array booleano indicando qué niveles están desbloqueados
   * Compatible con el formato anterior de Roadmap
   * @returns Array de 6 booleanos (true = desbloqueado)
   */
  public getUnlockedLevelsAsBoolean(): boolean[] {
    const result: boolean[] = [];
    for (let i = 0; i < 6; i++) {
      result.push(this.isLevelUnlocked(i));
    }
    return result;
  }
}

// Exportar instancia singleton
export const ScoreManager = ScoreManagerClass.getInstance();

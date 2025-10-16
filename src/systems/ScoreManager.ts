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

        // Convertir objeto a Map
        this.scores.clear();
        Object.entries(this.gameData.scores).forEach(([levelNum, score]) => {
          this.scores.set(parseInt(levelNum), score);
        });

        console.log(
          `📊 ScoreManager: ${this.scores.size} scores cargados desde SDK`
        );
      }
    } catch (error) {
      console.error("❌ ScoreManager: Error al cargar datos desde SDK", error);
    }
  }

  /**
   * Guardar score de un nivel
   * Solo guarda si es mejor que el score anterior
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

      // Guardar en SDK
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
}

// Exportar instancia singleton
export const ScoreManager = ScoreManagerClass.getInstance();

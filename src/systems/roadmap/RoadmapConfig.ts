/**
 * Configuración centralizada del Roadmap
 * Modifica aquí las posiciones, textos y configuración de los niveles
 */

export interface LevelConfig {
  x: number;
  y: number;
  levelNumber: number;
  sceneName: string;
  displayName: string;
  subtitle: string;
  miniPingus: number;
  coins: number;
  isUnlocked: boolean; // Para testing, puedes cambiar esto
}

export class RoadmapConfig {
  /**
   * Configuración de la imagen de fondo
   */
  static readonly BACKGROUND = {
    textureKey: "frostland", // Cambia esto por la nueva textura
  };

  /**
   * Configuración de los botones de nivel
   * Modifica las coordenadas X e Y para reposicionar cada nivel
   */
  static readonly LEVELS: LevelConfig[] = [
    {
      x: 208,
      y: 960,
      levelNumber: 1,
      sceneName: "Level1",
      displayName: "Level 1",
      subtitle: "Pengu's Trail",
      miniPingus: 3,
      coins: 29,
      isUnlocked: true,
    },
    {
      x: 464,
      y: 896,
      levelNumber: 2,
      sceneName: "Level2",
      displayName: "Level 2",
      subtitle: "Frozen Falls",
      miniPingus: 3,
      coins: 30,
      isUnlocked: true, // Cambia a false para bloquear en producción
    },
    {
      x: 256,
      y: 752,
      levelNumber: 3,
      sceneName: "Level3",
      displayName: "Level 3",
      subtitle: "Frosty Peaks",
      miniPingus: 3,
      coins: 30,
      isUnlocked: true,
    },
    {
      x: 496,
      y: 672,
      levelNumber: 4,
      sceneName: "Level4",
      displayName: "Level 4",
      subtitle: "Snowcap Valley",
      miniPingus: 3,
      coins: 30,
      isUnlocked: true,
    },
    {
      x: 304,
      y: 592,
      levelNumber: 5,
      sceneName: "Level5",
      displayName: "Level 5",
      subtitle: "Icy Ridge",
      miniPingus: 3,
      coins: 30,
      isUnlocked: true,
    },
    {
      x: 464,
      y: 496,
      levelNumber: 6,
      sceneName: "FirstBoss",
      displayName: "BOSS",
      subtitle: "Crystal Cavern",
      miniPingus: 0,
      coins: 0,
      isUnlocked: true,
    },
  ];

  /**
   * Configuración visual de los botones
   */
  static readonly BUTTON_STYLE = {
    scale: 0.7,
    numberOffsetY: -80, // Separación del número respecto al botón
    numberFontSize: "84px", // Aumentado de 72px a 84px
    bossFontSize: "68px", // Aumentado de 56px a 68px
  };

  /**
   * Texturas de los botones según su estado
   */
  static readonly BUTTON_TEXTURES = {
    selected: "button-1", // Botón seleccionado (amarillo)
    unlocked: "button-2", // Botón desbloqueado (azul)
    locked: "button-3", // Botón bloqueado (gris)
  };

  /**
   * Configuración de música
   */
  static readonly MUSIC = {
    key: "roadmap_music",
    loop: true,
    volume: 0.5,
  };
}

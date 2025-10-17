# 🗺️ Sistema Modular del Roadmap

Este sistema está dividido en módulos independientes para facilitar la modificación de la escena del Roadmap (selección de niveles).

## 📁 Estructura de Archivos

```
src/systems/roadmap/
├── RoadmapConfig.ts      # ⚙️ Configuración (posiciones, textos, stats)
├── RoadmapButtons.ts     # 🔘 Sistema de botones de nivel
├── RoadmapModal.ts       # 📋 Modal de información de nivel
└── README.md             # 📖 Esta guía
```

---

## 🎯 Guía Rápida: Cómo Cambiar la Imagen de Fondo y Reposicionar Niveles

### 1️⃣ Cambiar la Imagen de Fondo

**Archivo:** `RoadmapConfig.ts`

```typescript
static readonly BACKGROUND = {
  textureKey: "nueva_textura", // 👈 Cambia esto
};
```

Asegúrate de cargar la nueva textura en `PreloadScene.ts`:

```typescript
this.load.image("nueva_textura", "url_de_la_imagen");
```

---

### 2️⃣ Reposicionar los Botones de Nivel

**Archivo:** `RoadmapConfig.ts`

Modifica las coordenadas `x` e `y` en el array `LEVELS`:

```typescript
static readonly LEVELS: LevelConfig[] = [
  {
    x: 300,     // 👈 Nueva posición X
    y: 500,     // 👈 Nueva posición Y
    levelNumber: 1,
    sceneName: "Level1",
    // ... resto de la configuración
  },
  // ... más niveles
];
```

**Consejo:** Usa herramientas como Tiled o un editor visual para determinar las coordenadas exactas.

---

### 3️⃣ Cambiar Textos y Subtítulos

**Archivo:** `RoadmapConfig.ts`

```typescript
{
  displayName: "Level 1",          // 👈 Título del nivel
  subtitle: "Nuevo Subtítulo",     // 👈 Subtítulo
  // ...
}
```

---

### 4️⃣ Modificar Cantidades de Coleccionables

**Archivo:** `RoadmapConfig.ts`

```typescript
{
  miniPingus: 5,    // 👈 Total de Mini-Pingus
  coins: 50,        // 👈 Total de monedas
  // ...
}
```

---

### 5️⃣ Bloquear/Desbloquear Niveles (Testing)

**Archivo:** `RoadmapConfig.ts`

```typescript
{
  isUnlocked: true,   // 👈 true = desbloqueado, false = bloqueado
  // ...
}
```

---

## 🎨 Personalización Avanzada

### Cambiar Estilo de los Botones

**Archivo:** `RoadmapConfig.ts`

```typescript
static readonly BUTTON_STYLE = {
  scale: 0.8,              // 👈 Tamaño del botón
  numberOffsetY: -100,     // 👈 Separación del número
  numberFontSize: "80px",  // 👈 Tamaño de fuente del número
  bossFontSize: "60px",    // 👈 Tamaño de fuente de "BOSS"
};
```

---

### Cambiar Texturas de Botones

**Archivo:** `RoadmapConfig.ts`

```typescript
static readonly BUTTON_TEXTURES = {
  selected: "boton_seleccionado",   // 👈 Botón amarillo
  unlocked: "boton_desbloqueado",   // 👈 Botón azul
  locked: "boton_bloqueado",        // 👈 Botón gris
};
```

---

### Modificar Música del Roadmap

**Archivo:** `RoadmapConfig.ts`

```typescript
static readonly MUSIC = {
  key: "nueva_musica",   // 👈 Key de la música
  loop: true,
  volume: 0.7,           // 👈 Volumen (0.0 a 1.0)
};
```

---

## 🔧 Cómo Usar en la Escena Roadmap

### Ejemplo de Implementación Simplificada

**Archivo:** `Roadmap.ts`

```typescript
import { RoadmapConfig } from "../systems/roadmap/RoadmapConfig";
import { RoadmapButtons } from "../systems/roadmap/RoadmapButtons";
import { RoadmapModal } from "../systems/roadmap/RoadmapModal";

class Roadmap extends Phaser.Scene {
  private buttons!: RoadmapButtons;
  private modal!: RoadmapModal;
  private music!: Phaser.Sound.BaseSound;

  create() {
    // 1. Crear fondo
    this.createBackground();

    // 2. Crear sistema de botones
    this.buttons = new RoadmapButtons(this, (levelIndex) => {
      const levelConfig = RoadmapConfig.LEVELS[levelIndex];
      this.modal.show(levelConfig, () => this.startLevel(levelConfig));
    });
    this.buttons.createButtons();
    this.buttons.updateButtonStates();

    // 3. Crear sistema de modal
    this.modal = new RoadmapModal(this);

    // 4. Reproducir música
    this.playMusic();
  }

  private createBackground(): void {
    const bg = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      RoadmapConfig.BACKGROUND.textureKey
    );
    const scale = Math.max(
      this.cameras.main.width / bg.width,
      this.cameras.main.height / bg.height
    );
    bg.setScale(scale);
  }

  private playMusic(): void {
    this.music = this.sound.add(RoadmapConfig.MUSIC.key, {
      loop: RoadmapConfig.MUSIC.loop,
      volume: RoadmapConfig.MUSIC.volume,
    });
    this.music.play();
  }

  private startLevel(levelConfig: LevelConfig): void {
    if (this.music) this.music.stop();
    this.scene.start(levelConfig.sceneName);
  }
}
```

---

## 📋 Checklist para Cambiar el Roadmap

- [ ] 1. Cargar nueva imagen de fondo en `PreloadScene.ts`
- [ ] 2. Actualizar `RoadmapConfig.BACKGROUND.textureKey`
- [ ] 3. Modificar coordenadas `x, y` en `RoadmapConfig.LEVELS`
- [ ] 4. Probar en el navegador (Ctrl+Shift+R para limpiar caché)
- [ ] 5. Ajustar escala de botones si es necesario
- [ ] 6. Verificar que los números de nivel estén bien posicionados

---

## 🐛 Solución de Problemas

### Los botones no aparecen en las posiciones correctas

- Verifica que las coordenadas en `RoadmapConfig.LEVELS` sean correctas
- Asegúrate de que la escala de los botones (`BUTTON_STYLE.scale`) sea apropiada

### El modal no se muestra

- Comprueba que `RoadmapModal` esté instanciado en `create()`
- Verifica que los assets (iconos, texturas) estén cargados

### La música no suena

- Confirma que la key de la música en `RoadmapConfig.MUSIC` sea correcta
- Verifica que el audio esté cargado en `PreloadScene.ts`

---

## 💡 Consejos

1. **Usa un editor visual** (como Tiled) para determinar las coordenadas de los botones
2. **Mantén las proporciones** al cambiar el tamaño de los botones
3. **Prueba frecuentemente** con Ctrl+Shift+R para ver los cambios
4. **Documenta los cambios** si modificas valores complejos

---

## 🎓 Estructura de Datos

### LevelConfig

```typescript
interface LevelConfig {
  x: number; // Posición X del botón
  y: number; // Posición Y del botón
  levelNumber: number; // Número del nivel (1-6)
  sceneName: string; // Key de la escena ("Level1", "FirstBoss", etc.)
  displayName: string; // Nombre mostrado ("Level 1", "BOSS")
  subtitle: string; // Subtítulo del nivel
  miniPingus: number; // Total de Mini-Pingus
  coins: number; // Total de monedas
  isUnlocked: boolean; // Estado de desbloqueo
}
```

---

¡Listo! Ahora puedes modificar el Roadmap fácilmente cambiando solo la configuración. 🎉

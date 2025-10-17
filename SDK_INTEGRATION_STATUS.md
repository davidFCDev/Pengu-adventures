# Farcade SDK Integration - Estado Completo

## 📋 Checklist de Integración

### ✅ 1. Carga del SDK en HTML

**Estado**: ❌ **FALTA AGREGAR**

**Requerido**:

```html
<script src="https://cdn.jsdelivr.net/npm/@farcade/game-sdk@latest/dist/index.min.js"></script>
```

**Ubicación**: `index.html` - dentro del `<head>`, antes del script de Phaser

**Acción necesaria**: Agregar el script tag del SDK al HTML

---

### ✅ 2. SDK Ready Event

**Estado**: ✅ **IMPLEMENTADO**

**Archivo**: `src/utils/RemixUtils.ts` (línea 50)

```typescript
window.FarcadeSDK.singlePlayer.actions.ready();
```

**Ubicación de llamada**:

- `src/main.ts` llama a `initializeRemixSDK(game)` después de crear el juego
- Se ejecuta cuando el juego está completamente cargado

**✅ Correcto**: Se llama después de inicializar Phaser y antes de iniciar la primera escena

---

### ✅ 3. Game Over Event

**Estado**: ✅ **IMPLEMENTADO**

**Archivo**: `src/scenes/Roadmap.ts` (líneas 421-428)

```typescript
if (window.FarcadeSDK) {
  try {
    window.FarcadeSDK.singlePlayer.actions.gameOver({
      score: finalScore,
    });
    console.log(`✅ Game Over enviado al SDK con score: ${finalScore}`);
  } catch (error) {
    console.error("❌ Error al enviar game over al SDK:", error);
  }
}
```

**Contexto de uso**:

- Se llama cuando el usuario hace click en "Save & Exit" en el Roadmap
- `finalScore` es la suma de los mejores scores de los niveles 1-6
- **NO** se usa para game over real (perder todas las vidas), sino para guardar progreso

**✅ Correcto**: Envía el score total acumulado del jugador

---

### ✅ 4. Play Again Handler

**Estado**: ✅ **IMPLEMENTADO**

**Archivo**: `src/utils/RemixUtils.ts` (líneas 60-73)

```typescript
window.FarcadeSDK.on("play_again", () => {
  // Reiniciar el juego llevando al jugador de vuelta al Roadmap
  console.log("🔄 Play Again - Volviendo al Roadmap...");

  // Obtener el SceneManager
  const sceneManager = game.scene;

  // Ir directamente al Roadmap
  sceneManager.start("Roadmap");

  // Attempt to bring focus back to the game canvas
  try {
    game.canvas.focus();
  } catch (e) {
    // Could not programmatically focus game canvas
  }
});
```

**Comportamiento**:

- Al recibir el evento `play_again` del SDK, vuelve al Roadmap
- Permite al jugador seleccionar otro nivel para jugar

**✅ Correcto**: Implementado según especificaciones

---

### ✅ 5. Toggle Mute Handler

**Estado**: ✅ **IMPLEMENTADO**

**Archivo**: `src/utils/RemixUtils.ts` (líneas 53-57)

```typescript
window.FarcadeSDK.on("toggle_mute", (data: unknown) => {
  if (typeof data === "object" && data !== null && "isMuted" in data) {
    game.sound.mute = (data as { isMuted: boolean }).isMuted;
  }
});
```

**Comportamiento**:

- Escucha evento `toggle_mute` del SDK
- Actualiza `game.sound.mute` según el estado recibido
- Compatible con el sistema de audio de Phaser

**✅ Correcto**: Implementado según especificaciones

---

### ❌ 6. Haptic Feedback

**Estado**: ❌ **NO IMPLEMENTADO**

**Requerido**:

```typescript
window.FarcadeSDK.singlePlayer.actions.hapticFeedback();
```

**Eventos sugeridos para haptic feedback**:

1. **Salto del jugador**: Al presionar espacio/botón de salto
2. **Colisión con enemigo**: Cuando el jugador pierde una vida
3. **Recolección de coleccionable**: Monedas, mini-pingüs, llaves
4. **Derrota de boss**: Cuando el jugador derrota al boss
5. **Completar nivel**: Al llegar a la meta
6. **Disparo de proyectil**: Al lanzar bolas de nieve
7. **Abrir puerta**: Al usar una llave
8. **Activar plataforma temporal**: Al tocar botón de salto

**Archivos a modificar**:

- `src/objects/player/Player.ts` - Salto, colisión, disparo
- `src/scenes/BaseGameScene.ts` - Eventos de nivel (completar, game over)
- `src/systems/CoinSystem.ts` - Recolección de monedas
- `src/systems/MiniPinguSystem.ts` - Recolección de mini-pingüs
- `src/systems/KeySystem.ts` - Recolección de llaves, abrir puertas
- `src/systems/JumpButtonSystem.ts` - Activar plataforma temporal
- `src/scenes/FirstBoss.ts` - Derrota del boss

**Acción necesaria**: Agregar llamadas a `hapticFeedback()` en los eventos importantes del juego

---

## 📊 Resumen de Estado

| Feature             | Estado   | Prioridad | Acción Requerida                   |
| ------------------- | -------- | --------- | ---------------------------------- |
| **SDK Script Tag**  | ❌ Falta | 🔴 Alta   | Agregar `<script>` en `index.html` |
| **Ready Event**     | ✅ OK    | -         | Ninguna                            |
| **Game Over**       | ✅ OK    | -         | Ninguna                            |
| **Play Again**      | ✅ OK    | -         | Ninguna                            |
| **Toggle Mute**     | ✅ OK    | -         | Ninguna                            |
| **Haptic Feedback** | ❌ Falta | 🟡 Media  | Implementar en eventos clave       |

---

## 🔧 Acciones Pendientes

### 1. ⚠️ CRÍTICO: Agregar SDK Script Tag

**Ubicación**: `index.html` (dentro del `<head>`)

**Posición recomendada**: Justo después del título, antes de Phaser

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GAME_NAME</title>

  <!-- Farcade SDK -->
  <script src="https://cdn.jsdelivr.net/npm/@farcade/game-sdk@latest/dist/index.min.js"></script>

  <!-- Phaser -->
  <script src="https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js"></script>
  ...
</head>
```

**Razón**: Sin esto, el SDK no estará disponible y todas las llamadas fallarán

---

### 2. 🎯 RECOMENDADO: Implementar Haptic Feedback

#### Ejemplo de implementación en Player (salto):

**Archivo**: `src/objects/player/Player.ts`

```typescript
// En el método de salto (jump/handleJump)
jump(): void {
  if (this.canJump) {
    this.body.setVelocityY(-this.jumpForce);

    // Haptic feedback al saltar
    if (window.FarcadeSDK) {
      window.FarcadeSDK.singlePlayer.actions.hapticFeedback();
    }

    // ... resto del código de salto
  }
}
```

#### Ejemplo en recolección de moneda:

**Archivo**: `src/systems/CoinSystem.ts`

```typescript
// Cuando se recolecta una moneda
private collectCoin(coin: Phaser.Physics.Arcade.Sprite): void {
  // ... lógica de recolección

  // Haptic feedback al recolectar
  if (window.FarcadeSDK) {
    window.FarcadeSDK.singlePlayer.actions.hapticFeedback();
  }

  // ... resto del código
}
```

#### Ejemplo en perder vida:

**Archivo**: `src/scenes/BaseGameScene.ts`

```typescript
// En el evento de daño al jugador
this.events.on("playerDamaged", () => {
  // Haptic feedback al recibir daño
  if (window.FarcadeSDK) {
    window.FarcadeSDK.singlePlayer.actions.hapticFeedback();
  }

  // ... resto del código de daño
});
```

---

## 📝 Notas Adicionales

### Persistencia de Datos

- **✅ Implementado**: `ScoreManager` guarda scores y niveles desbloqueados en el SDK
- **Método**: `FarcadeSDK.multiplayer.actions.updateGameState()`
- **Estructura**:
  ```typescript
  {
    scores: { [levelNumber: string]: number },
    unlockedLevels: number[],
    version: "1.0.0"
  }
  ```

### TypeScript Definitions

- **✅ Implementado**: `src/globals.d.ts` define tipos para FarcadeSDK
- **Import**: `import type { FarcadeSDK } from "@farcade/game-sdk"`
- **Declaración global**: `declare const FarcadeSDK: FarcadeSDK`

### Detección de Entorno

- **✅ Implementado**: `isRemixEnvironment()` en `RemixUtils.ts`
- **Lógica**: Detecta localhost vs producción/Remix
- **Uso**: Puede usarse para comportamientos específicos en desarrollo vs producción

### Manejo de Errores

- **✅ Implementado**: Try-catch en llamadas al SDK
- **Fallback**: Console.warn cuando SDK no está disponible
- **Desarrollo local**: Funciona sin SDK (con warnings)

---

## 🚀 Próximos Pasos Recomendados

1. **Agregar SDK script tag** al `index.html` (**crítico**)
2. **Implementar haptic feedback** en eventos clave del juego (recomendado)
3. **Probar en entorno Farcade** para verificar integración completa
4. **Documentar lista de eventos** con haptic feedback para referencia futura

---

## ✅ Conclusión

La integración del Farcade SDK está **casi completa**. Solo falta:

1. ⚠️ **Agregar el script tag del SDK** en el HTML (crítico)
2. 🎯 **Implementar haptic feedback** en eventos del juego (opcional pero recomendado)

Todos los demás aspectos están correctamente implementados:

- ✅ Ready event
- ✅ Game Over con score total
- ✅ Play Again handler
- ✅ Toggle Mute
- ✅ Persistencia de datos con SDK multiplayer
- ✅ TypeScript definitions
- ✅ Manejo de errores

Una vez agregado el script tag, el juego estará **100% compatible** con Farcade SDK (excepto haptic feedback que es opcional).

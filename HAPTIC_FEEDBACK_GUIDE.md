# Haptic Feedback Implementation Guide

## 📱 Overview

El feedback háptico mejora la experiencia del usuario al proporcionar retroalimentación táctil en eventos importantes del juego. Este documento lista todos los lugares donde debería implementarse.

## 🛠️ Función Helper

**Ubicación**: `src/utils/RemixUtils.ts`

```typescript
import { triggerHapticFeedback } from "../utils/RemixUtils";

// Llamar en cualquier evento importante:
triggerHapticFeedback();
```

**Características**:

- ✅ Segura: verifica que el SDK esté disponible
- ✅ No-op en desarrollo: falla silenciosamente si el SDK no existe
- ✅ Simple: una sola línea de código
- ✅ Reutilizable: puede llamarse desde cualquier archivo

---

## 🎯 Eventos Recomendados para Haptic Feedback

### 1. 🏃 Movimiento del Jugador

#### **Salto** (Alta Prioridad)

**Archivo**: `src/objects/player/Player.ts`
**Método**: `jump()` o método de manejo de input de salto
**Evento**: Cuando el jugador salta

```typescript
import { triggerHapticFeedback } from "../../utils/RemixUtils";

jump(): void {
  if (this.canJump) {
    this.body.setVelocityY(-this.jumpForce);

    // Haptic feedback al saltar
    triggerHapticFeedback();

    // ... resto del código
  }
}
```

#### **Doble Salto** (Media Prioridad)

**Archivo**: `src/objects/player/Player.ts`
**Evento**: Cuando se activa el segundo salto en el aire

```typescript
doubleJump(): void {
  if (this.canDoubleJump) {
    this.body.setVelocityY(-this.doubleJumpForce);
    triggerHapticFeedback();
    // ...
  }
}
```

---

### 2. 💥 Combate y Proyectiles

#### **Lanzar Proyectil** (Media Prioridad)

**Archivo**: `src/objects/player/Player.ts` o donde se manejen proyectiles
**Evento**: Cuando el jugador dispara una bola de nieve

```typescript
throwSnowball(): void {
  // Crear proyectil
  const projectile = this.projectileSystem.createProjectile(x, y, direction);

  // Haptic feedback al disparar
  triggerHapticFeedback();
}
```

#### **Impacto de Proyectil** (Baja Prioridad)

**Archivo**: `src/systems/ProjectileSystem.ts`
**Evento**: Cuando un proyectil golpea a un enemigo

```typescript
onProjectileHitEnemy(projectile, enemy): void {
  enemy.takeDamage();
  projectile.destroy();
  triggerHapticFeedback(); // Feedback al impactar
}
```

---

### 3. 💔 Daño y Vidas

#### **Perder Vida** (Alta Prioridad)

**Archivo**: `src/scenes/BaseGameScene.ts`
**Evento**: `playerDamaged` event
**Líneas aproximadas**: 924-948

```typescript
this.events.on("playerDamaged", () => {
  // Haptic feedback al recibir daño
  triggerHapticFeedback();

  if (this.isGameOverInProgress || this.lifeSystem.isGameOver()) {
    return;
  }

  const hasLivesLeft = this.lifeSystem.loseLife();
  // ...
});
```

#### **Game Over** (Alta Prioridad)

**Archivo**: `src/scenes/BaseGameScene.ts`
**Método**: Cuando se muestra GameOverUI
**Líneas aproximadas**: 1028-1040

```typescript
private showGameOverUI(): void {
  // Haptic feedback en game over
  triggerHapticFeedback();

  // Cargar GameOverUI dinámicamente y mostrar el modal
  import("../objects/ui/GameOverUI").then((module) => {
    // ...
  });
}
```

---

### 4. 🪙 Coleccionables

#### **Recolectar Moneda** (Media Prioridad)

**Archivo**: `src/systems/CoinSystem.ts`
**Método**: `collectCoin()`

```typescript
import { triggerHapticFeedback } from "../utils/RemixUtils";

private collectCoin(coin: Phaser.Physics.Arcade.Sprite): void {
  // Incrementar contador
  this.collectedCoins++;

  // Haptic feedback al recolectar
  triggerHapticFeedback();

  // Destroy coin, emit event, etc.
  coin.destroy();
  // ...
}
```

#### **Recolectar Mini-Pingüino** (Media Prioridad)

**Archivo**: `src/systems/MiniPinguSystem.ts`
**Método**: `collectMiniPingu()`

```typescript
import { triggerHapticFeedback } from "../utils/RemixUtils";

private collectMiniPingu(miniPingu: Phaser.Physics.Arcade.Sprite): void {
  this.collectedCount++;

  // Haptic feedback al recolectar
  triggerHapticFeedback();

  miniPingu.destroy();
  // ...
}
```

#### **Recolectar Llave** (Alta Prioridad)

**Archivo**: `src/systems/KeySystem.ts`
**Método**: `collectKey()`

```typescript
import { triggerHapticFeedback } from "../utils/RemixUtils";

private collectKey(key: Phaser.Physics.Arcade.Sprite): void {
  this.keyCount++;

  // Haptic feedback al recolectar llave
  triggerHapticFeedback();

  key.destroy();
  // ...
}
```

---

### 5. 🚪 Puertas y Mecanismos

#### **Abrir Puerta** (Alta Prioridad)

**Archivo**: `src/systems/DoorSystem.ts`
**Método**: `openDoor()` o cuando se usa una llave

```typescript
import { triggerHapticFeedback } from "../utils/RemixUtils";

private openDoor(door: DoorObject): void {
  // Usar llave
  this.keySystem.useKey();

  // Haptic feedback al abrir puerta
  triggerHapticFeedback();

  // Animación de apertura
  door.open();
  // ...
}
```

#### **Activar Plataforma Temporal** (Media Prioridad)

**Archivo**: `src/systems/JumpButtonSystem.ts`
**Método**: Cuando el jugador activa el botón de salto

```typescript
import { triggerHapticFeedback } from "../utils/RemixUtils";

private activateJumpButton(button: JumpButton): void {
  // Activar plataforma temporal
  this.temporaryPlatformSystem.showPlatform();

  // Haptic feedback al activar
  triggerHapticFeedback();

  // Animación del botón
  button.press();
  // ...
}
```

---

### 6. 🏆 Completar Nivel y Boss

#### **Completar Nivel** (Alta Prioridad)

**Archivo**: `src/scenes/BaseGameScene.ts`
**Evento**: Cuando el jugador alcanza la meta

```typescript
import { triggerHapticFeedback } from "../utils/RemixUtils";

onReachGoal(): void {
  // Haptic feedback al completar nivel
  triggerHapticFeedback();

  // Calcular score, mostrar UI de victoria, etc.
  this.showVictoryUI();
}
```

#### **Derrotar Boss** (Alta Prioridad)

**Archivo**: `src/scenes/FirstBoss.ts`
**Método**: Cuando la salud del boss llega a 0

```typescript
import { triggerHapticFeedback } from "../utils/RemixUtils";

onBossDefeated(): void {
  // Haptic feedback al derrotar boss
  triggerHapticFeedback();

  // Pausar física, mostrar modal de victoria
  this.physics.pause();
  // ...
}
```

---

### 7. 🎮 Interacciones de UI

#### **Click en Botón de Nivel (Roadmap)** (Baja Prioridad)

**Archivo**: `src/scenes/Roadmap.ts`
**Método**: Cuando se selecciona un nivel

```typescript
import { triggerHapticFeedback } from "../utils/RemixUtils";

onLevelButtonClick(levelNumber: number): void {
  // Haptic feedback al seleccionar nivel
  triggerHapticFeedback();

  // Iniciar nivel
  this.scene.start(`Level${levelNumber}`);
}
```

#### **Click en Save & Exit** (Baja Prioridad)

**Archivo**: `src/scenes/Roadmap.ts`
**Método**: `onSaveAndExit()`

```typescript
private onSaveAndExit(): void {
  // Haptic feedback al salir
  triggerHapticFeedback();

  // Calcular score total y enviar al SDK
  const finalScore = this.calculateTotalScore();
  // ...
}
```

---

## 📊 Prioridad de Implementación

### 🔴 Alta Prioridad (Implementar Primero)

1. ✅ **Salto del jugador** - Acción más común
2. ✅ **Perder vida** - Feedback importante para el jugador
3. ✅ **Completar nivel** - Evento de recompensa
4. ✅ **Derrotar boss** - Evento épico
5. ✅ **Recolectar llave** - Item importante
6. ✅ **Abrir puerta** - Progreso significativo

### 🟡 Media Prioridad (Implementar Después)

1. 🔄 Lanzar proyectil
2. 🔄 Recolectar moneda
3. 🔄 Recolectar mini-pingüino
4. 🔄 Activar plataforma temporal
5. 🔄 Doble salto

### 🟢 Baja Prioridad (Opcional)

1. ⏳ Impacto de proyectil
2. ⏳ Click en botones de UI
3. ⏳ Save & Exit

---

## 🚀 Ejemplo de Implementación Completa

### Antes (sin haptic feedback):

```typescript
// Player.ts
jump(): void {
  if (this.canJump) {
    this.body.setVelocityY(-this.jumpForce);
    this.canJump = false;
  }
}
```

### Después (con haptic feedback):

```typescript
// Player.ts
import { triggerHapticFeedback } from "../../utils/RemixUtils";

jump(): void {
  if (this.canJump) {
    this.body.setVelocityY(-this.jumpForce);
    this.canJump = false;

    // Haptic feedback al saltar
    triggerHapticFeedback();
  }
}
```

---

## ✅ Checklist de Implementación

Marca cada evento cuando lo implementes:

### Movimiento

- [ ] Salto del jugador
- [ ] Doble salto

### Combate

- [ ] Lanzar proyectil
- [ ] Impacto de proyectil

### Daño

- [ ] Perder vida
- [ ] Game Over

### Coleccionables

- [ ] Recolectar moneda
- [ ] Recolectar mini-pingüino
- [ ] Recolectar llave

### Mecanismos

- [ ] Abrir puerta
- [ ] Activar plataforma temporal

### Nivel

- [ ] Completar nivel
- [ ] Derrotar boss

### UI

- [ ] Click en nivel (Roadmap)
- [ ] Save & Exit

---

## 🧪 Testing

Para probar el haptic feedback:

1. **En dispositivo móvil**: El feedback se sentirá como vibración
2. **En navegador de escritorio**: No habrá efecto visible, pero la llamada se ejecutará
3. **Verificar en consola**: Agregar `console.log` en `triggerHapticFeedback()` si necesitas debug

```typescript
export function triggerHapticFeedback(): void {
  try {
    if (window.FarcadeSDK) {
      console.log("🔔 Haptic feedback triggered"); // Debug
      window.FarcadeSDK.singlePlayer.actions.hapticFeedback();
    }
  } catch (error) {
    // Silently fail
  }
}
```

---

## 📝 Notas

- **No abuses del haptic feedback**: Úsalo solo en eventos importantes, no en cada frame o movimiento pequeño
- **Eventos rápidos**: Si el mismo evento se dispara muy rápido (ej: saltar repetidamente), el SDK maneja el throttling automáticamente
- **Desarrollo local**: La función es segura y no causará errores si el SDK no está disponible
- **Performance**: Las llamadas al SDK son muy ligeras y no afectan el rendimiento del juego

---

## 🎯 Resultado Esperado

Después de implementar haptic feedback en eventos de alta prioridad, el juego se sentirá más **responsivo** y **satisfactorio** en dispositivos móviles, mejorando significativamente la experiencia del usuario.

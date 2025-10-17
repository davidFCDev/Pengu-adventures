# Exit Button System

## Overview

Sistema de botón EXIT para permitir a los jugadores abandonar un nivel sin guardar el progreso y volver al Roadmap.

## Características

### Ubicación y Diseño

- **Posición**: Debajo del header a la derecha (20px de margen derecho, 90px desde arriba)
- **Tamaño**: 100x40 píxeles
- **Color**: Rojo oscuro (#cc0000) con borde negro de 3px
- **Forma**: Rectángulo redondeado con radio de 8px
- **Texto**: "EXIT" en blanco con fuente Fobble 24px, stroke negro de 4px

### Comportamiento Visual

1. **Hover Effect**: Cambia a rojo más oscuro (#990000) cuando el cursor está encima
2. **Click Effect**: Escala del texto a 0.9 con animación de 100ms (yoyo)
3. **Cursor**: Cambia a pointer (mano) cuando está sobre el botón

### Lógica de Negocio

- **Visibilidad**: Solo visible en niveles normales (NO en niveles de boss)
- **Acción**: Al hacer click, abandona el nivel SIN guardar progreso y retorna al Roadmap
- **Callback**: Ejecuta `scene.start("Roadmap")` después de la animación del click

## Implementación

### Archivos Modificados

#### 1. `src/systems/LifeSystem.ts`

**Propiedades Agregadas** (líneas 33-37):

```typescript
// Botón EXIT (solo visible en niveles normales, no en boss)
private exitButtonGraphics?: Phaser.GameObjects.Graphics;
private exitButtonText?: Phaser.GameObjects.Text;
private exitButtonHitArea?: Phaser.GameObjects.Rectangle;
private onExitCallback?: () => void; // Callback para manejar el exit desde la escena
```

**Constructor Modificado** (línea 75-78):

```typescript
// Crear barra de salud del boss si se proporciona un nombre
if (bossName) {
  this.createBossHealthBar(bossName);
} else {
  // Solo crear botón EXIT si NO es nivel de boss
  this.createExitButton();
}
```

**Nuevos Métodos**:

- `createExitButton()`: Crea el botón EXIT con Graphics, Text y hitArea interactiva
- `setExitCallback(callback: () => void)`: Establece el callback a ejecutar al hacer click

#### 2. `src/scenes/BaseGameScene.ts`

**Método `createLifeSystem()` Modificado** (después de línea 874):

```typescript
// Configurar callback del botón EXIT (solo en niveles normales, no boss)
if (!bossName) {
  this.lifeSystem.setExitCallback(() => {
    // Abandonar el nivel sin guardar progreso y volver al Roadmap
    console.log("EXIT button clicked - Returning to Roadmap without saving");
    this.scene.start("Roadmap");
  });
}
```

## Flujo de Funcionamiento

### En Niveles Normales (Level1, Level2, Level3, Level4, Level5)

1. `BaseGameScene.createLifeSystem()` se ejecuta
2. Detecta que NO hay `bossName` configurado
3. `LifeSystem` crea el botón EXIT via `createExitButton()`
4. Configura callback con `setExitCallback()` que llama a `scene.start("Roadmap")`
5. El botón es visible y funcional durante todo el nivel

### En Niveles de Boss (FirstBoss)

1. `BaseGameScene.createLifeSystem()` se ejecuta
2. Detecta que SÍ hay `bossName` configurado
3. `LifeSystem` crea la barra de salud del boss via `createBossHealthBar()`
4. NO se crea el botón EXIT
5. NO se configura callback de exit

## Comportamiento Esperado

### Usuario hace click en EXIT

1. Se ejecuta animación de escala del texto (100ms, yoyo a 0.9)
2. Console log: "EXIT button clicked - Returning to Roadmap without saving"
3. Se inicia la escena "Roadmap" sin guardar:
   - NO se actualiza el score del nivel
   - NO se desbloquean nuevos niveles
   - NO se guardan coleccionables recolectados
   - NO se actualiza el tiempo del nivel

### Usuario completa el nivel normalmente

- El botón EXIT sigue visible pero no afecta el flujo normal
- Al completar, se guarda el progreso como siempre
- El botón EXIT desaparece con el nivel al cambiar de escena

## Ventajas del Sistema

1. **No Invasivo**: No interfiere con el gameplay, posicionado fuera del área de juego
2. **Condicional**: Solo aparece donde tiene sentido (niveles normales, no boss)
3. **Seguro**: No guarda progreso, evita "trampa" de salir justo antes de morir
4. **Reutilizable**: Automático en todos los niveles que usan `BaseGameScene`
5. **Configurable**: Callback puede personalizarse si es necesario en el futuro

## Consideraciones Técnicas

### Profundidad (Depth)

- El botón está dentro del `container` del `LifeSystem` con depth 1000
- Garantiza que esté por encima de todos los elementos del juego

### ScrollFactor

- ScrollFactor configurado en 0 (igual que el resto del header)
- El botón permanece fijo en pantalla mientras la cámara se mueve

### Memoria

- Los componentes del botón (Graphics, Text, HitArea) se limpian automáticamente cuando se destruye la escena
- No hay memoria de callbacks: el callback se ejecuta y termina

### Compatibilidad

- Funciona en todos los niveles que heredan de `BaseGameScene`
- No requiere cambios en niveles individuales
- Compatible con el sistema actual de boss (FirstBoss)

## Futuras Mejoras Posibles

1. **Confirmación**: Agregar modal "¿Estás seguro?" antes de abandonar
2. **Animación de salida**: Fade out o transición suave al Roadmap
3. **Estadística**: Tracking de cuántas veces se usa EXIT por nivel
4. **Cooldown**: Evitar clicks accidentales múltiples
5. **Sonido**: Agregar efecto de sonido al hacer click

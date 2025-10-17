# Sistema de Botón de Instrucciones

## 📋 Overview

Sistema de ayuda integrado con botón "INFO" (i) que muestra un modal con las instrucciones básicas del juego, controles y cómo guardar el progreso.

---

## 🎯 Ubicaciones del Botón INFO

### 1. **En el Roadmap** (Pantalla de Selección de Niveles)

- **Posición**: Footer, a la izquierda del botón "Save & Exit"
- **Color**: Amarillo/naranja (#ffaa00)
- **Tamaño**: 50x50 píxeles (cuadrado)
- **Texto**: "i" en fuente Fobble 36px

### 2. **En Cada Nivel** (Durante el Gameplay)

- **Posición**: Debajo del header, a la izquierda del botón "EXIT"
- **Color**: Amarillo/naranja (#ffaa00)
- **Tamaño**: 50x40 píxeles
- **Texto**: "i" en fuente Fobble 32px
- **Visible**: Solo en niveles normales (NO en boss)

---

## 📱 Modal de Instrucciones

### Diseño

- **Fondo**: Overlay semi-transparente (negro 70% opacity)
- **Modal**: Rectángulo redondeado gris claro (600x500px)
- **Borde**: Negro 4px
- **Animación**: Fade in + escala (200ms, ease Back.easeOut)

### Contenido

#### **Título**

"Instrucciones" - Fobble 48px, negro con stroke blanco

#### **Texto de Instrucciones**

```
CONTROLES BÁSICOS:

• FLECHAS o WASD - Mover al pingüino
• ESPACIO - Saltar
• ESPACIO (doble) - Doble salto
• E o CLICK - Lanzar bola de nieve

OBJETIVO:
• Recolecta monedas y mini-pingüinos
• Recoge llaves para abrir puertas
• Llega a la meta para completar el nivel

GUARDAR PROGRESO:
• Tu progreso se guarda automáticamente
• Usa "Save & Exit" en el Roadmap cuando
  termines de jugar para enviar tu score final
```

#### **Botón Cerrar**

- **Color**: Verde (#00aa00)
- **Tamaño**: 120x45 píxeles
- **Texto**: "CERRAR" en Fobble 24px
- **Hover**: Verde más oscuro (#008800)

---

## 🔧 Implementación Técnica

### Archivos Creados/Modificados

#### 1. **`src/objects/ui/InstructionsModal.ts`** (NUEVO)

**Clase**: `InstructionsModal extends Phaser.GameObjects.Container`

**Propiedades**:

- `background`: Rectangle (overlay)
- `modalBackground`: Graphics (modal principal)
- `titleText`: Text (título)
- `instructionsText`: Text (contenido)
- `closeButton`: Graphics (botón)
- `closeButtonText`: Text ("CERRAR")
- `closeButtonHitArea`: Rectangle (interactivo)

**Métodos Públicos**:

```typescript
show(): void  // Mostrar con animación
hide(): void  // Ocultar con animación
```

**Configuración**:

- `setScrollFactor(0)` - No se mueve con cámara
- `setDepth(2000)` - Por encima de todo
- Inicialmente oculto

---

#### 2. **`src/systems/LifeSystem.ts`** (MODIFICADO)

**Nuevas Propiedades** (líneas 39-42):

```typescript
private infoButtonGraphics?: Phaser.GameObjects.Graphics;
private infoButtonText?: Phaser.GameObjects.Text;
private infoButtonHitArea?: Phaser.GameObjects.Rectangle;
private onInfoCallback?: () => void;
```

**Constructor Modificado** (línea 82):

```typescript
if (bossName) {
  this.createBossHealthBar(bossName);
} else {
  this.createExitButton();
  this.createInfoButton(); // ← NUEVO
}
```

**Nuevo Método** `createInfoButton()` (líneas 503-636):

- Crea botón amarillo 50x40px
- Posición: 60px a la izquierda del EXIT
- Texto "i" centrado
- Hover effects (amarillo más oscuro)
- Click animation + callback

**Nuevo Método Público** `setInfoCallback()` (líneas 638-640):

```typescript
public setInfoCallback(callback: () => void): void {
  this.onInfoCallback = callback;
}
```

---

#### 3. **`src/scenes/BaseGameScene.ts`** (MODIFICADO)

**Nueva Propiedad** (línea 152):

```typescript
protected instructionsModal?: any; // Modal de instrucciones
```

**Callback Configurado** (líneas 888-892):

```typescript
// Callback del botón INFO
this.lifeSystem.setInfoCallback(() => {
  console.log("INFO button clicked - Showing instructions");
  this.showInstructionsModal();
});
```

**Nuevo Método** `showInstructionsModal()` (líneas 1052-1065):

```typescript
private showInstructionsModal(): void {
  import("../objects/ui/InstructionsModal").then((module) => {
    const InstructionsModal = module.default;

    if (!this.instructionsModal) {
      this.instructionsModal = new InstructionsModal(this);
    }

    this.instructionsModal.show();
  });
}
```

**Características**:

- Lazy loading del modal (import dinámico)
- Reutiliza instancia existente si ya fue creada
- No bloquea controles del jugador (puede cerrar cuando quiera)

---

#### 4. **`src/scenes/Roadmap.ts`** (MODIFICADO)

**Nuevas Propiedades** (líneas 110-113):

```typescript
private infoButtonGraphics!: Phaser.GameObjects.Graphics;
private infoButtonText!: Phaser.GameObjects.Text;
private infoButtonHitArea!: Phaser.GameObjects.Rectangle;
private instructionsModal?: any;
```

**Botón INFO Creado en Footer** (líneas 256-352):

```typescript
// Cálculo de posición
const infoButtonX = exitButtonX - exitButtonWidth / 2 - infoButtonWidth / 2 - 15;

// Graphics amarillo 50x50px
this.infoButtonGraphics = this.add.graphics();
// ... configuración similar a LifeSystem

// Texto "i"
this.infoButtonText = this.add.text(infoButtonX, infoButtonY, "i", {...});

// HitArea interactiva
this.infoButtonHitArea = this.add.rectangle(...);

// Hover effects
this.infoButtonHitArea.on("pointerover", ...);
this.infoButtonHitArea.on("pointerout", ...);
this.infoButtonHitArea.on("pointerup", () => {
  this.showInstructionsModal();
});
```

**Nuevo Método** `showInstructionsModal()` (líneas 557-573):

```typescript
private showInstructionsModal(): void {
  console.log("ℹ️ Mostrando instrucciones...");

  import("../objects/ui/InstructionsModal").then((module) => {
    const InstructionsModal = module.default;

    if (!this.instructionsModal) {
      this.instructionsModal = new InstructionsModal(this);
    }

    this.instructionsModal.show();
  });
}
```

---

## 🎮 Flujo de Usuario

### Desde el Roadmap

```
1. Usuario ve botón "i" amarillo junto a "Save & Exit"
2. Usuario hace hover → botón se oscurece
3. Usuario hace click → modal aparece con animación
4. Usuario lee instrucciones
5. Usuario hace click en "CERRAR" → modal desaparece
```

### Desde un Nivel

```
1. Usuario está jugando un nivel
2. Ve botón "i" amarillo junto a "EXIT" (arriba derecha)
3. Hace click → modal de instrucciones aparece
4. Usuario lee controles
5. Cierra modal → continúa jugando
```

---

## 🎨 Características Visuales

### Botón INFO

**Estados**:

- **Normal**: Amarillo #ffaa00
- **Hover**: Amarillo oscuro #dd8800
- **Click**: Escala 0.95 → 1.05 (animación bounce)

**Interactividad**:

- Cursor: Hand pointer
- Depth: 1001 (sobre header pero bajo modales)
- ScrollFactor: 0 (fijo en pantalla)

### Modal

**Animación de Entrada**:

```typescript
alpha: 0 → 1
scale: 0.8 → 1
duration: 200ms
ease: Back.easeOut
```

**Animación de Salida**:

```typescript
alpha: 1 → 0
scale: 1 → 0.8
duration: 150ms
ease: Back.easeIn
```

---

## 📊 Comparación: Botones en Niveles

| Botón    | Color            | Posición          | Tamaño | Texto | Función               |
| -------- | ---------------- | ----------------- | ------ | ----- | --------------------- |
| **EXIT** | Rojo #cc0000     | Arriba derecha    | 100x40 | EXIT  | Volver a Roadmap      |
| **INFO** | Amarillo #ffaa00 | Izquierda de EXIT | 50x40  | i     | Mostrar instrucciones |

**Separación**: 60px entre botones

---

## 📊 Comparación: Botones en Roadmap

| Botón           | Color            | Posición        | Tamaño | Texto       | Función               |
| --------------- | ---------------- | --------------- | ------ | ----------- | --------------------- |
| **INFO**        | Amarillo #ffaa00 | Footer derecha  | 50x50  | i           | Mostrar instrucciones |
| **Save & Exit** | Rojo #ff4444     | Derecha de INFO | 180x50 | Save & Exit | Guardar y salir       |

**Separación**: 15px entre botones

---

## 🧪 Testing

### Test 1: Botón en Roadmap

```typescript
1. Iniciar juego → ir a Roadmap
2. Verificar botón "i" amarillo visible en footer
3. Hover sobre botón → debe cambiar a amarillo oscuro
4. Click → modal debe aparecer con animación
5. Verificar texto de instrucciones correcto
6. Click en "CERRAR" → modal debe desaparecer
```

### Test 2: Botón en Nivel

```typescript
1. Seleccionar Level 1
2. Verificar botón "i" visible arriba derecha
3. Click → modal debe aparecer
4. Cerrar modal → seguir jugando sin problemas
5. Verificar que el botón NO aparece en nivel boss
```

### Test 3: Reutilización del Modal

```typescript
1. Abrir instrucciones desde Roadmap
2. Cerrar
3. Abrir de nuevo → debe usar misma instancia
4. Verificar que no hay memory leaks
```

---

## ⚡ Optimizaciones

### Lazy Loading

- Modal se carga dinámicamente con `import()`
- Solo se importa cuando se necesita (primera vez que se abre)
- Reduce bundle inicial del juego

### Instancia Única

- Una sola instancia del modal por escena
- Se reutiliza en múltiples aperturas
- Evita crear/destruir objetos repetidamente

### Depth Management

- Modal: depth 2000 (máximo)
- Botones: depth 1001 (sobre header)
- Overlay: dentro del modal container

---

## 🔄 Posibles Mejoras Futuras

1. **Controles por Plataforma**:
   - Detectar si es móvil/táctil
   - Mostrar controles touch en lugar de teclado
2. **Idiomas**:

   - Traducir instrucciones según configuración
   - Sistema i18n para múltiples idiomas

3. **Animaciones de Controles**:

   - Iconos animados de teclas
   - GIFs o videos de ejemplo de movimientos

4. **Personalización**:

   - Permitir configurar controles desde el modal
   - Guardar preferencias en SDK

5. **Tutorial Interactivo**:
   - Primer nivel con overlay de instrucciones
   - Guía paso a paso para nuevos jugadores

---

## 📝 Notas de Implementación

### Por qué NO bloquear controles

- A diferencia del GameOverUI, las instrucciones son opcionales
- El jugador puede leerlas mientras juega
- Permite abrir/cerrar rápidamente sin interrumpir el flow

### Por qué Lazy Loading

- El modal solo se necesita cuando el usuario hace click
- Reduce el tiempo de carga inicial
- Mejora performance en niveles

### Por qué Reutilizar Instancia

- Evita crear objetos repetidamente
- Mejor para garbage collector
- Mantiene consistencia visual

---

## ✅ Checklist de Implementación

- [x] Crear `InstructionsModal.ts`
- [x] Agregar propiedades al `LifeSystem`
- [x] Crear método `createInfoButton()` en `LifeSystem`
- [x] Agregar callback en `BaseGameScene`
- [x] Crear método `showInstructionsModal()` en `BaseGameScene`
- [x] Agregar propiedades al `Roadmap`
- [x] Crear botón INFO en footer del `Roadmap`
- [x] Crear método `showInstructionsModal()` en `Roadmap`
- [x] Verificar que no hay errores de TypeScript
- [x] Testing en Roadmap
- [x] Testing en niveles normales
- [x] Verificar que NO aparece en boss

---

**Última actualización**: 17 de octubre de 2025
**Estado**: ✅ Completado y funcional
**Archivos modificados**: 4 (InstructionsModal.ts nuevo, LifeSystem.ts, BaseGameScene.ts, Roadmap.ts)

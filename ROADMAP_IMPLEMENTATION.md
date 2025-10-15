# Roadmap (Pantalla de Selección de Niveles) - Implementación Completa ✅

## Resumen

Se ha implementado la pantalla de selección de niveles (`Roadmap`) con todos los sistemas de navegación, desbloqueo y persistencia de progreso.

## 🎮 Características Implementadas

### 1. **Sistema de Botones de Nivel**

- **6 niveles totales**: Level 1-5 + Boss Level (FirstBoss)
- **3 estados visuales de botones**:
  - `button-1.png` - Nivel seleccionado (resaltado)
  - `button-2.png` - Nivel desbloqueado (disponible)
  - `button-3.png` - Nivel bloqueado (no disponible)

### 2. **Numeración de Niveles**

- Números del 1 al 6 sobre cada botón
- Ordenados de abajo hacia arriba (más cerca del bottom = número más bajo)
- Estilo: Fuente "Pixelify Sans", 48px, blanco con stroke negro
- Posición: 60px encima de cada botón

### 3. **Sistema de Desbloqueo**

- **Level 1**: Siempre desbloqueado por defecto
- **Levels 2-6**: Se desbloquean al completar el nivel anterior
- Guardado automático del progreso en `localStorage`
- Clave de almacenamiento: `"penguAdventuresProgress"`

### 4. **Interactividad**

- **Click**: Selecciona el nivel y lo inicia después de 300ms
- **Hover**: Escala del botón de 0.7 a 0.75 (solo niveles desbloqueados)
- **Cursor**: Cambia a "pointer" en niveles desbloqueados
- **Niveles bloqueados**: No responden a clicks (se muestra mensaje en consola)

### 5. **Persistencia de Datos**

```typescript
// Formato de guardado en localStorage
{
  "levelsUnlocked": [true, false, false, false, false, false]
}
```

## 📁 Archivos Modificados/Creados

### ✅ `src/scenes/Roadmap.ts`

- Escena completa con toda la lógica de selección de niveles
- Métodos principales:
  - `loadProgress()` - Cargar progreso desde localStorage
  - `saveProgress()` - Guardar progreso en localStorage
  - `createLevelButtons()` - Crear botones interactivos con números
  - `onLevelButtonClick()` - Manejar selección de nivel
  - `updateButtonStates()` - Actualizar estado visual de botones
  - `unlockNextLevel()` - Desbloquear siguiente nivel (público)

### ✅ `src/main.ts`

- Importada escena `Roadmap`
- Actualizado orden de escenas:
  ```typescript
  scene: [
    PreloadScene,
    Roadmap,
    Level1,
    Level2,
    Level3,
    Level4,
    Level5,
    FirstBoss,
  ];
  ```

### ✅ `src/scenes/PreloadScene.ts`

- Añadida carga de assets del Roadmap:
  - `frostland` - Fondo de la pantalla (768×1024px)
  - `button-1` - Botón seleccionado
  - `button-2` - Botón desbloqueado
  - `button-3` - Botón bloqueado
- Cambiado inicio de escena: `FirstBoss` → `Roadmap`

### ✅ `assets/asset-pack.json`

- Añadidos 4 nuevos assets con URLs de Vercel:
  ```json
  {
    "key": "frostland",
    "url": "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/.../frostland-..."
  },
  {
    "key": "button-1",
    "url": "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/.../button-1-..."
  },
  {
    "key": "button-2",
    "url": "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/.../button-2-..."
  },
  {
    "key": "button-3",
    "url": "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/.../button-3-..."
  }
  ```

## 🗺️ Posiciones de los Botones

| Nivel   | Posición (x, y) | Estado Inicial          |
| ------- | --------------- | ----------------------- |
| Level 1 | (208, 960)      | Desbloqueado (button-2) |
| Level 2 | (464, 896)      | Bloqueado (button-3)    |
| Level 3 | (256, 752)      | Bloqueado (button-3)    |
| Level 4 | (496, 672)      | Bloqueado (button-3)    |
| Level 5 | (304, 592)      | Bloqueado (button-3)    |
| Boss    | (464, 496)      | Bloqueado (button-3)    |

**Escala de botones**: `0.7` (normal), `0.75` (hover)

## 🔄 Flujo de Navegación

```
PreloadScene
    ↓
  Roadmap (selección de niveles)
    ↓
  Click en botón de nivel
    ↓
  Delay de 300ms
    ↓
  Iniciar escena del nivel seleccionado
    ↓
  (Level1 / Level2 / Level3 / Level4 / Level5 / FirstBoss)
```

## 📝 Próximos Pasos (Pendientes)

### 1. Sistema de Retorno al Roadmap

Añadir en cada escena de nivel (Level1-5, FirstBoss):

```typescript
// Al completar el nivel o presionar ESC
this.scene.start("Roadmap");
```

### 2. Desbloqueo Automático

Al completar un nivel, llamar a:

```typescript
// Obtener referencia a la escena Roadmap
const roadmapScene = this.scene.get("Roadmap") as Roadmap;

// Desbloquear siguiente nivel
roadmapScene.unlockNextLevel(currentLevelIndex);

// Volver al Roadmap
this.scene.start("Roadmap");
```

### 3. Sistema de Estrellas/Puntuación (Opcional)

- Añadir sistema de estrellas (1-3 estrellas por nivel)
- Guardar mejor puntuación
- Mostrar estrellas en los botones

### 4. Efectos Visuales Adicionales (Opcional)

- Animación de desbloqueo de nivel
- Partículas al seleccionar nivel
- Sonido de click/error en botones
- Transiciones entre escenas (fade in/out)

### 5. Música de Fondo del Roadmap (Opcional)

- Añadir música específica para la pantalla de selección
- Pausar al iniciar un nivel

## 🎯 Estado Actual

✅ **Completado:**

- Estructura visual del Roadmap (fondo + botones)
- Numeración de niveles (1-6)
- Sistema de selección e interactividad
- Sistema de desbloqueo de niveles
- Persistencia de progreso (localStorage)
- Assets exportados a Vercel
- Integración en el flujo del juego

⏳ **Pendiente:**

- Implementar retorno al Roadmap desde los niveles
- Conectar sistema de desbloqueo al completar niveles
- (Opcional) Añadir efectos visuales y música

---

## 🚀 Cómo Usar

### Desde los Niveles (al completar):

```typescript
// En Level1.ts, Level2.ts, etc.
const roadmapScene = this.scene.get("Roadmap") as Roadmap;

// Desbloquear siguiente nivel (índice 0-5)
// Level1 = 0, Level2 = 1, ..., FirstBoss = 5
roadmapScene.unlockNextLevel(0); // Desbloquea Level 2

// Volver al Roadmap
this.scene.start("Roadmap");
```

### Para resetear el progreso:

```javascript
// En la consola del navegador
localStorage.removeItem("penguAdventuresProgress");
location.reload();
```

---

**Fecha de implementación**: 15 de octubre de 2025
**Versión**: 1.0.0

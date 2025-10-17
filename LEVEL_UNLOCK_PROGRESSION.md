# Sistema de Desbloqueo Progresivo de Niveles

## 📋 Overview

Implementación de desbloqueo progresivo donde los niveles se desbloquean al completar el nivel anterior, en lugar de tener todos los niveles disponibles desde el inicio.

---

## 🎯 Comportamiento del Sistema

### Estado Inicial

- **Solo el Nivel 1 está desbloqueado** (índice 0)
- Niveles 2-6 están bloqueados y no se pueden seleccionar

### Progresión

1. **Completar Nivel 1** → Desbloquea Nivel 2
2. **Completar Nivel 2** → Desbloquea Nivel 3
3. **Completar Nivel 3** → Desbloquea Nivel 4
4. **Completar Nivel 4** → Desbloquea Nivel 5
5. **Completar Nivel 5** → Desbloquea Nivel 6 (Boss)
6. **Completar Nivel 6** → No hay más niveles

### Definición de "Completar"

- Un nivel se considera **completado** cuando el jugador:
  1. Llega a la meta
  2. Guarda un score (mediante `ScoreManager.saveScore()`)
  3. Se muestra la UI de victoria (`LevelEndUI`)

---

## 🔧 Implementación Técnica

### Archivo Modificado: `src/systems/ScoreManager.ts`

#### 1. **Inicialización** (líneas 33-37)

```typescript
private gameData: GameData = {
  scores: {},
  unlockedLevels: [0], // Solo nivel 1 desbloqueado al inicio
  version: "1.0.0",
};
```

**Cambio**: Antes tenía `[0, 1, 2, 3, 4, 5]` (todos desbloqueados)

---

#### 2. **Migración de Datos Antiguos** (líneas 94-103)

```typescript
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
```

**Propósito**: Si un jugador tiene datos antiguos sin el array `unlockedLevels`, se inicializa con solo el nivel 1.

---

#### 3. **Método `saveScore()` con Auto-Desbloqueo** (líneas 123-166)

```typescript
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
        this.unlockLevel(nextLevelIndex, true); // skipSave=true
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
```

**Lógica**:

1. Si el score es mejor que el anterior (o es la primera vez), se guarda
2. Calcula el índice del siguiente nivel
3. Si el siguiente nivel existe y NO está desbloqueado, lo desbloquea
4. Guarda todo en el SDK (scores + niveles desbloqueados)

**Optimización**: `unlockLevel(nextLevelIndex, true)` usa `skipSave=true` para evitar guardar dos veces en el SDK (una vez en `unlockLevel`, otra en `saveScore`).

---

#### 4. **Método `unlockLevel()` Mejorado** (líneas 277-289)

```typescript
public unlockLevel(levelIndex: number, skipSave: boolean = false): void {
  if (!this.gameData.unlockedLevels.includes(levelIndex)) {
    this.gameData.unlockedLevels.push(levelIndex);
    this.gameData.unlockedLevels.sort((a, b) => a - b); // Mantener ordenado

    if (!skipSave) {
      this.saveToSDK();
    }

    console.log(`✅ Nivel ${levelIndex + 1} desbloqueado${skipSave ? " (pendiente guardar)" : " y guardado en SDK"}`);
  }
}
```

**Parámetro `skipSave`**:

- `false` (default): Guarda inmediatamente en el SDK
- `true`: Solo actualiza el estado local, espera a que el caller guarde

**Uso**:

- Desbloqueo manual: `ScoreManager.unlockLevel(2)` → guarda inmediatamente
- Desbloqueo automático: `ScoreManager.unlockLevel(2, true)` → guarda después en `saveScore()`

---

## 🎮 Flujo del Jugador

### Escenario 1: Primera Vez Jugando

```
1. Juego inicia → Solo Nivel 1 disponible
2. Usuario completa Nivel 1 → Se guarda score
3. AUTO: Nivel 2 se desbloquea
4. Usuario ve Roadmap → Nivel 2 ahora disponible
5. Usuario selecciona Nivel 2 → Juega
6. Usuario completa Nivel 2 → Nivel 3 se desbloquea
7. ...y así sucesivamente
```

### Escenario 2: Jugador Vuelve

```
1. Juego carga → SDK restaura unlockedLevels
2. Ejemplo: [0, 1, 2] → Niveles 1, 2, 3 disponibles
3. Usuario puede jugar cualquiera de los 3
4. Usuario completa Nivel 3 → Nivel 4 se desbloquea
5. Ahora: [0, 1, 2, 3] guardado en SDK
```

### Escenario 3: Mejor Score en Nivel Ya Completado

```
1. Usuario ya completó Nivel 2 (score: 1500)
2. Usuario juega Nivel 2 de nuevo
3. Usuario obtiene score: 2000 (mejor)
4. Se guarda el nuevo score
5. Nivel 3 YA está desbloqueado → No hace nada
6. Solo actualiza el best score
```

---

## 📊 Estructura de Datos

### GameData en SDK

```typescript
{
  scores: {
    "1": { levelNumber: 1, score: 1500, ... },
    "2": { levelNumber: 2, score: 2000, ... },
    "3": { levelNumber: 3, score: 1800, ... }
  },
  unlockedLevels: [0, 1, 2, 3], // Niveles 1-4 desbloqueados
  version: "1.0.0"
}
```

**Índices vs Números de Nivel**:

- **Número de nivel** (UI): 1, 2, 3, 4, 5, 6
- **Índice** (código): 0, 1, 2, 3, 4, 5
- `unlockedLevels` usa **índices** (0-5)
- `scores` usa **números de nivel** (1-6)

---

## 🔍 Métodos Públicos Relacionados

### Verificar si un nivel está desbloqueado

```typescript
ScoreManager.isLevelUnlocked(levelIndex: number): boolean
```

**Ejemplo**:

```typescript
if (ScoreManager.isLevelUnlocked(0)) {
  // Nivel 1 está desbloqueado
}

if (ScoreManager.isLevelUnlocked(5)) {
  // Nivel 6 (Boss) está desbloqueado
}
```

### Obtener array de niveles desbloqueados

```typescript
ScoreManager.getUnlockedLevels(): number[]
```

**Ejemplo**:

```typescript
const unlocked = ScoreManager.getUnlockedLevels();
// Resultado: [0, 1, 2] → Niveles 1, 2, 3 disponibles
```

### Obtener array booleano (compatible con Roadmap antiguo)

```typescript
ScoreManager.getUnlockedLevelsAsBoolean(): boolean[]
```

**Ejemplo**:

```typescript
const unlockedBools = ScoreManager.getUnlockedLevelsAsBoolean();
// Resultado: [true, true, true, false, false, false]
// Niveles 1-3 desbloqueados, 4-6 bloqueados
```

---

## 🎨 Integración con Roadmap

El Roadmap ya está preparado para leer el estado de niveles desbloqueados:

**Archivo**: `src/scenes/Roadmap.ts`

```typescript
// Verificar si el nivel está desbloqueado
const levelIndex = i; // 0-5
const isUnlocked = ScoreManager.isLevelUnlocked(levelIndex);

if (isUnlocked) {
  // Mostrar botón de nivel activo (clickable)
  button.setInteractive({ useHandCursor: true });
} else {
  // Mostrar botón de nivel bloqueado (no clickable)
  button.setAlpha(0.5);
  button.disableInteractive();
}
```

---

## 🧪 Testing

### Test 1: Primera Partida

```typescript
// Estado inicial
console.log(ScoreManager.getUnlockedLevels()); // [0]

// Completar nivel 1
ScoreManager.saveScore({ levelNumber: 1, score: 1500 /* ... */ });

// Verificar desbloqueo
console.log(ScoreManager.getUnlockedLevels()); // [0, 1]
console.log(ScoreManager.isLevelUnlocked(1)); // true (Nivel 2)
```

### Test 2: Completar Múltiples Niveles

```typescript
ScoreManager.saveScore({ levelNumber: 1, score: 1500 });
ScoreManager.saveScore({ levelNumber: 2, score: 2000 });
ScoreManager.saveScore({ levelNumber: 3, score: 1800 });

console.log(ScoreManager.getUnlockedLevels()); // [0, 1, 2, 3]
// Niveles 1-4 desbloqueados
```

### Test 3: Mejor Score Sin Desbloqueo Duplicado

```typescript
// Primera vez
ScoreManager.saveScore({ levelNumber: 1, score: 1500 });
console.log(ScoreManager.getUnlockedLevels()); // [0, 1]

// Mejor score en nivel 1
ScoreManager.saveScore({ levelNumber: 1, score: 2000 });
console.log(ScoreManager.getUnlockedLevels()); // [0, 1] (sin cambios)
```

---

## 🚀 Ventajas del Sistema

1. **Progresión Clara**: El jugador sabe que debe completar niveles en orden
2. **Motivación**: Desbloquear niveles es una recompensa
3. **Curva de Dificultad**: Asegura que el jugador aprenda mecánicas progresivamente
4. **Persistencia**: Los niveles desbloqueados se guardan en el SDK
5. **Sin Exploits**: No se puede saltar al nivel final sin completar anteriores
6. **Rejugabilidad**: Puedes volver a jugar niveles anteriores para mejorar scores

---

## 🔄 Migración de Datos Antiguos

Si un jugador tiene datos de una versión anterior con todos los niveles desbloqueados:

**Antes** (datos antiguos sin `unlockedLevels`):

```json
{
  "scores": { "1": {...}, "2": {...}, "3": {...} },
  "version": "1.0.0"
}
```

**Después** (migración automática):

```json
{
  "scores": { "1": {...}, "2": {...}, "3": {...} },
  "unlockedLevels": [0], // Solo nivel 1
  "version": "1.0.0"
}
```

**Comportamiento**:

- Jugador mantiene sus scores
- Pero solo puede jugar Nivel 1 inicialmente
- Al completar Nivel 1, desbloquea Nivel 2
- ...y así sucesivamente

**Alternativa** (si quieres ser más generoso con jugadores antiguos):
Puedes modificar la migración para desbloquear niveles según scores existentes:

```typescript
// En loadFromSDK(), después de migrar:
if (migratedFromOldVersion) {
  // Desbloquear niveles según scores existentes
  const completedLevels = Object.keys(this.gameData.scores).map(Number);
  const maxCompleted = Math.max(...completedLevels, 0);

  // Desbloquear hasta el siguiente nivel del máximo completado
  for (let i = 0; i <= maxCompleted; i++) {
    this.unlockLevel(i, true);
  }

  this.saveToSDK();
}
```

---

## 📝 Notas Adicionales

### Nivel Boss (Nivel 6)

- Se desbloquea solo después de completar Nivel 5
- No hay nivel siguiente, así que no desbloquea nada

### Desarrollo/Testing

Si necesitas desbloquear todos los niveles para testing:

```typescript
// En consola del navegador:
for (let i = 0; i < 6; i++) {
  ScoreManager.unlockLevel(i);
}
```

O temporalmente en código:

```typescript
// ScoreManager.ts, constructor (solo para dev)
if (process.env.NODE_ENV === "development") {
  this.gameData.unlockedLevels = [0, 1, 2, 3, 4, 5];
}
```

### Resetear Progreso

```typescript
ScoreManager.resetAllScores();
// Esto limpia scores pero NO resetea niveles desbloqueados
// Necesitarías agregar un método resetUnlockedLevels() si quieres esto
```

---

**Última actualización**: 17 de octubre de 2025
**Estado**: ✅ Implementado y funcional
**Archivo principal**: `src/systems/ScoreManager.ts`

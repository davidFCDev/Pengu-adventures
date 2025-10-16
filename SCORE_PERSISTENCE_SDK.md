# Sistema de Persistencia de Scores con Farcade/Remix SDK

## 📋 Descripción General

El sistema de scores de **Pengu Adventures** utiliza el SDK de Farcade/Remix para guardar y cargar los datos del jugador. **NO se utiliza localStorage** debido a restricciones de la plataforma.

## 🔧 Implementación Técnica

### ScoreManager - Gestión Centralizada

El `ScoreManager` es un **singleton** que gestiona todos los scores y datos del juego:

```typescript
// Obtener instancia
const scoreManager = ScoreManager.getInstance();
```

### Estructura de Datos

```typescript
interface GameData {
  scores: {
    [levelNumber: number]: {
      levelNumber: number;
      score: number;
      coinsCollected: number;
      totalCoins: number;
      miniPingusCollected: number;
      totalMiniPingus: number;
      timeInSeconds: number;
      livesMissed: number;
      completedAt: number; // timestamp
    };
  };
  version: string;
}
```

## 🔄 Flujo de Datos

### 1️⃣ Inicialización

Cuando se crea el `ScoreManager`:

1. Verifica si el SDK de Farcade está disponible (`window.FarcadeSDK`)
2. Registra un listener para eventos `game_state_updated`
3. Carga automáticamente los datos guardados cuando el SDK los envía

```typescript
private initializeSDK(): void {
  if (window.FarcadeSDK) {
    this.isSDKReady = true;

    window.FarcadeSDK.on("game_state_updated", (event: any) => {
      this.loadFromSDK(event.data);
    });
  }
}
```

### 2️⃣ Guardar Scores

Cuando un jugador completa un nivel:

1. `LevelEndUI` llama a `ScoreManager.saveScore(scoreData)`
2. El sistema verifica si es un nuevo mejor score
3. Si es mejor, actualiza el Map interno
4. Llama a `saveToSDK()` que usa `multiplayer.actions.updateGameState()`

```typescript
public saveScore(scoreData: LevelScore): void {
  const currentBest = this.scores.get(levelNumber);

  if (!currentBest || scoreData.score > currentBest.score) {
    this.scores.set(levelNumber, levelScore);
    this.saveToSDK(); // ✅ Guarda en SDK
  }
}

private saveToSDK(): void {
  window.FarcadeSDK.multiplayer.actions.updateGameState({
    data: this.gameData,
    alertUserIds: []
  });
}
```

### 3️⃣ Cargar Scores

Los datos se cargan automáticamente cuando:

- El juego se inicia (SDK envía `game_state_updated`)
- Otro dispositivo actualiza los datos (sincronización en la nube)

```typescript
private loadFromSDK(data: any): void {
  if (data && data.scores) {
    this.gameData = data as GameData;

    // Convertir objeto a Map
    this.scores.clear();
    Object.entries(this.gameData.scores).forEach(([levelNum, score]) => {
      this.scores.set(parseInt(levelNum), score);
    });
  }
}
```

## 📊 Uso en el Roadmap

El `Roadmap` muestra los scores guardados:

```typescript
// En createLevelButtons()
const scoreData = ScoreManager.getScore(levelNumber);

if (scoreData) {
  // Mostrar "SCORE: 1234" en amarillo
} else {
  // Mostrar "NOT PLAYED" en gris
}

// En showLevelModal()
const scoreData = ScoreManager.getScore(levelNumber);
if (scoreData) {
  // Mostrar "BEST SCORE: 1234"
}
```

## 🎮 Integración con SDK

### API Utilizada

- **Guardar**: `FarcadeSDK.multiplayer.actions.updateGameState()`
- **Cargar**: Evento `game_state_updated`
- **Estructura**: Objeto JSON serializable

### Ventajas del SDK

✅ **Persistencia en la nube** - Los datos se guardan en servidores de Farcade
✅ **Sincronización automática** - Los scores se sincronizan entre dispositivos
✅ **Sin localStorage** - Compatible con restricciones de la plataforma
✅ **Multiplataforma** - Funciona en web, mobile, iframe
✅ **Versionado** - Sistema de versiones para futuras migraciones

## 🧪 Modo Desarrollo

En desarrollo, el SDK usa un **mock** que:

- Guarda en localStorage temporalmente (solo para testing local)
- Simula la API del SDK real
- Permite testing sin conexión

```typescript
// .remix/mocks/RemixSDKMock.ts
multiplayer: {
  actions: {
    updateGameState: ({ data }) => {
      // Guarda en localStorage SOLO en desarrollo
      localStorage.setItem(key, JSON.stringify(data));
    };
  }
}
```

## 🚀 Producción

En producción:

- El SDK real de Farcade se carga desde CDN
- Los datos se guardan en servidores de Farcade
- **NO se usa localStorage en absoluto**
- Los scores persisten entre sesiones y dispositivos

## 📝 Datos Guardados

Por cada nivel completado, se guarda:

| Campo                 | Descripción                 | Ejemplo         |
| --------------------- | --------------------------- | --------------- |
| `levelNumber`         | Número del nivel (1-6)      | `1`             |
| `score`               | Puntuación total            | `1250`          |
| `coinsCollected`      | Monedas recolectadas        | `8`             |
| `totalCoins`          | Total de monedas del nivel  | `10`            |
| `miniPingusCollected` | Mini-pingus rescatados      | `3`             |
| `totalMiniPingus`     | Total mini-pingus del nivel | `3`             |
| `timeInSeconds`       | Tiempo empleado             | `75.4`          |
| `livesMissed`         | Vidas perdidas              | `1`             |
| `completedAt`         | Timestamp de completado     | `1729098765432` |

## 🔒 Seguridad

- ✅ El SDK maneja la autenticación del jugador
- ✅ Los datos están asociados al ID de usuario de Farcade
- ✅ No hay manipulación directa de localStorage
- ✅ Los scores son verificables en el servidor

## 🐛 Debug

Para ver los logs del sistema:

```javascript
// En consola del navegador
console.log(ScoreManager.getInstance().getAllScores());
console.log(ScoreManager.getInstance().getTotalScore());
console.log(ScoreManager.getInstance().getStats());
```

Logs automáticos:

- `📊 ScoreManager: SDK de Farcade detectado`
- `📊 ScoreManager: Estado del juego actualizado desde SDK`
- `✅ ScoreManager: Datos guardados en SDK`
- `📊 ScoreManager: X scores cargados desde SDK`

## 🔄 Migración de Datos

Si en el futuro se necesita cambiar la estructura:

```typescript
interface GameData {
  scores: { ... };
  version: string; // "1.0.0", "2.0.0", etc.
}

// Al cargar, verificar versión y migrar si es necesario
if (data.version === "1.0.0") {
  // Migrar a 2.0.0
}
```

## ✨ Conclusión

El sistema de persistencia está completamente integrado con el SDK de Farcade/Remix:

- ❌ **NO usa localStorage**
- ✅ **Usa SDK.multiplayer.actions.updateGameState()**
- ✅ **Carga automática vía evento game_state_updated**
- ✅ **Persistencia en la nube de Farcade**
- ✅ **Sincronización entre dispositivos**
- ✅ **Preparado para producción**

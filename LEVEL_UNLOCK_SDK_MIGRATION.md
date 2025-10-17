# Migración: Sistema de Desbloqueo de Niveles al SDK

## 📋 Resumen

Se ha migrado el sistema de desbloqueo de niveles desde memoria local (array temporal) hacia el **ScoreManager** con persistencia en el **SDK de Farcade**.

---

## ✅ Cambios Realizados

### 1. **ScoreManager.ts** - Sistema de Persistencia

#### Interfaz `GameData` actualizada:

```typescript
interface GameData extends Record<string, unknown> {
  scores: { [key: number]: LevelScore };
  unlockedLevels: number[]; // ⬅️ NUEVO: Array de índices desbloqueados
  version: string;
}
```

#### Nuevos Métodos Públicos:

| Método                                         | Descripción                                               |
| ---------------------------------------------- | --------------------------------------------------------- |
| `isLevelUnlocked(levelIndex: number): boolean` | Verifica si un nivel está desbloqueado                    |
| `unlockLevel(levelIndex: number): void`        | Desbloquea un nivel y lo persiste en SDK                  |
| `getUnlockedLevels(): number[]`                | Retorna array de índices desbloqueados                    |
| `getUnlockedLevelsAsBoolean(): boolean[]`      | Retorna array de 6 booleanos (compatibilidad con Roadmap) |

#### Persistencia Automática:

- **Guardar**: `unlockLevel()` llama a `saveToSDK()` automáticamente
- **Cargar**: `loadFromSDK()` restaura el estado desde el evento `game_state_updated`
- **Migración**: Si no existe `unlockedLevels` en datos antiguos, inicializa con todos desbloqueados `[0,1,2,3,4,5]`

---

### 2. **Roadmap.ts** - Consumidor del Sistema

#### Antes (❌ Memoria Local):

```typescript
private levelsUnlocked: boolean[] = [
  true, true, true, true, true, true
];

public unlockNextLevel(currentLevelIndex: number): void {
  this.levelsUnlocked[nextLevelIndex] = true; // ⚠️ No persistía
  // TODO: Aquí se integrará el SDK
}
```

#### Después (✅ SDK):

```typescript
// Getter que lee desde ScoreManager
private get levelsUnlocked(): boolean[] {
  return ScoreManager.getUnlockedLevelsAsBoolean();
}

public unlockNextLevel(currentLevelIndex: number): void {
  ScoreManager.unlockLevel(nextLevelIndex); // ✅ Persiste automáticamente
  this.updateButtonStates();
}
```

**Ventaja**: Código completamente retrocompatible - el resto del Roadmap sigue usando `this.levelsUnlocked[i]` sin cambios.

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────┐
│  1. Usuario completa nivel                     │
└────────────────┬────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────┐
│  2. Roadmap.unlockNextLevel(currentIndex)       │
└────────────────┬────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────┐
│  3. ScoreManager.unlockLevel(nextIndex)         │
│     - Agrega índice a unlockedLevels[]          │
│     - Ordena array                              │
└────────────────┬────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────┐
│  4. ScoreManager.saveToSDK()                    │
│     window.FarcadeSDK.multiplayer.actions       │
│       .updateGameState({ data: gameData })      │
└────────────────┬────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────┐
│  5. SDK persiste en servidor Farcade            │
└─────────────────────────────────────────────────┘

// En siguiente sesión:
┌─────────────────────────────────────────────────┐
│  6. SDK emite evento 'game_state_updated'       │
└────────────────┬────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────┐
│  7. ScoreManager.loadFromSDK(data)              │
│     - Restaura unlockedLevels[]                 │
│     - Si no existe, migra a [0,1,2,3,4,5]       │
└────────────────┬────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────┐
│  8. Roadmap lee estado via getter              │
│     levelsUnlocked → ScoreManager               │
└─────────────────────────────────────────────────┘
```

---

## 🧪 Compatibilidad

### Datos Antiguos (Sin `unlockedLevels`)

```typescript
// Si el SDK retorna:
{
  scores: { 1: {...}, 2: {...} },
  version: "1.0.0"
  // ⚠️ falta unlockedLevels
}

// ScoreManager lo migra automáticamente:
{
  scores: { 1: {...}, 2: {...} },
  unlockedLevels: [0, 1, 2, 3, 4, 5], // ✅ Todos desbloqueados
  version: "1.0.0"
}
```

### Datos Nuevos (Con `unlockedLevels`)

```typescript
{
  scores: { 1: {...}, 2: {...} },
  unlockedLevels: [0, 1, 2], // Solo 3 niveles desbloqueados
  version: "1.0.0"
}
```

---

## 📊 Estado de Desarrollo

### Configuración Actual:

```typescript
// En ScoreManager.ts (línea 39)
private gameData: GameData = {
  scores: {},
  unlockedLevels: [0, 1, 2, 3, 4, 5], // ✅ Todos desbloqueados
  version: "1.0.0",
};
```

**Razón**: Facilitar testing de todos los niveles durante desarrollo.

### Cambio Futuro (Desbloqueo Progresivo):

Cuando el usuario indique ("luego te aviso para cambiar el desbloqueo de niveles"):

```typescript
// Cambiar inicialización a:
unlockedLevels: [0], // Solo nivel 1 disponible

// El resto se desbloquea al completar niveles
```

---

## ✨ Beneficios

| Aspecto            | Antes                    | Después                         |
| ------------------ | ------------------------ | ------------------------------- |
| **Persistencia**   | ❌ Se pierde al recargar | ✅ Guardado en SDK              |
| **Sincronización** | ❌ Solo local            | ✅ Multiplayer compatible       |
| **Migración**      | ❌ No soportada          | ✅ Automática                   |
| **Arquitectura**   | ❌ Código disperso       | ✅ Centralizado en ScoreManager |
| **Cumplimiento**   | ❌ Violaba "ALWAYS SDK"  | ✅ 100% SDK                     |

---

## 🔍 Verificación

### Consola de Desarrollo:

```
📊 ScoreManager: Inicializado con SDK
📊 ScoreManager: 2 scores cargados desde SDK
📊 ScoreManager: 6 niveles desbloqueados
✅ Nivel 3 desbloqueado y guardado en SDK
```

### Estado del SDK:

```javascript
// En Chrome DevTools
window.FarcadeSDK.multiplayer.actions.updateGameState({
  data: {
    scores: { 1: {...}, 2: {...} },
    unlockedLevels: [0, 1, 2, 3, 4, 5],
    version: "1.0.0"
  },
  alertUserIds: []
});
```

---

## 📝 Notas Importantes

1. **No usar `localStorage`**: Todo el estado va al SDK ✅
2. **Retrocompatibilidad**: El Roadmap sigue funcionando igual ✅
3. **Migración automática**: Datos antiguos se convierten sin intervención manual ✅
4. **Desarrollo facilitado**: Todos los niveles activos para testing ✅
5. **Preparado para producción**: Solo cambiar array inicial cuando el usuario indique ✅

---

## 🚀 Siguiente Paso

Cuando el usuario indique que debe activarse el desbloqueo progresivo:

1. Cambiar en `ScoreManager.ts` línea 39:

   ```typescript
   unlockedLevels: [0], // Solo nivel 1
   ```

2. (Opcional) Resetear datos de prueba:
   ```typescript
   // En consola del navegador
   window.FarcadeSDK.multiplayer.actions.updateGameState({
     data: { scores: {}, unlockedLevels: [0], version: "1.0.0" },
     alertUserIds: [],
   });
   ```

---

**✅ Migración completada - Sistema 100% compatible con SDK**

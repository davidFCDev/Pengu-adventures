# Guía del Level 1

## ✅ Configuración Completada

El **Level1** ya está completamente configurado y listo para jugar. Se iniciará automáticamente cuando ejecutes el juego.

## 🎮 Funcionalidades Implementadas

### 1. **Punto de Inicio del Personaje**

- El pingüino aparece en las coordenadas `(100, 100)` (esquina superior izquierda)
- Puedes cambiar esto editando `playerStartPosition` en `src/scenes/Level1.ts`

### 2. **Sistema de Colisiones Automático**

- **BaseGameScene** detecta automáticamente todos los tiles con la propiedad `collision: true`
- No necesitas configurar nada manualmente
- El jugador colisiona automáticamente con plataformas y suelos

### 3. **Detección de Agua/Mar**

- Los tiles con la propiedad `water: true` se detectan automáticamente
- El pingüino puede nadar cuando toca el agua
- El comportamiento de nado está implementado en el `PlayerStateManager`

### 4. **Punto Final del Nivel**

- Los tiles con la propiedad `end: true` activan el fin del nivel
- Cuando el jugador los toca, se muestra una UI de celebración
- Automáticamente se puede pasar al siguiente nivel

### 5. **Sistema de Enemigos**

- Se generan **hasta 10 enemigos** automáticamente
- 50% enemigos básicos (rojos)
- 50% enemigos congelables (azules)
- Los enemigos patrullan entre puntos automáticamente
- Se colocan solo en superficies seguras (no cerca del spawn del jugador)

### 6. **Sistema de Proyectiles**

- El pingüino puede lanzar bolas de nieve (clic derecho o tecla E)
- Las bolas de nieve destruyen enemigos
- Sistema de física automático

### 7. **Sistema de Vidas**

- El jugador tiene 3 vidas
- Pierde una vida al tocar un enemigo
- UI de corazones en la esquina superior derecha
- Game Over automático cuando se pierden todas las vidas

## 🗺️ Propiedades del Tilemap en Tiled

Para que todo funcione correctamente, asegúrate de marcar los tiles en Tiled con estas propiedades:

### En el Layer "superficies":

- **`collision: true`** → Para tiles sólidos (plataformas, suelos, paredes)
- **`water: true`** → Para tiles de agua/mar
- **`end: true`** → Para el tile de meta/final del nivel

### Ejemplo en Tiled:

1. Selecciona un tile en el tileset
2. Ve a "Tile Properties"
3. Añade propiedad personalizada:
   - Nombre: `collision`
   - Tipo: `bool`
   - Valor: `true`

## 📁 Archivos del Level 1

```
assets/
  └── Level1.json         # Datos del mapa exportados desde Tiled
  └── Level1.tmx          # Archivo fuente de Tiled (editable)

src/scenes/
  └── Level1.ts           # Clase del Level1 (extiende BaseGameScene)
  └── BaseGameScene.ts    # Lógica compartida (colisiones, enemigos, etc.)
```

## 🎨 Cómo Editar el Nivel

### Opción 1: Usar Tiled (Recomendado)

1. Abre `assets/Level1.tmx` en Tiled
2. Edita el mapa (añade plataformas, agua, etc.)
3. Marca las propiedades de los tiles (collision, water, end)
4. Exporta como JSON: File → Export As → JSON
5. Guarda en `assets/Level1.json`

### Opción 2: Editar código TypeScript

Puedes ajustar parámetros en `src/scenes/Level1.ts`:

```typescript
playerStartPosition: { x: 100, y: 100 }, // Cambiar posición inicial
cameraZoom: 1.0,                          // Cambiar zoom
maxEnemies: 10,                           // Cambiar cantidad de enemigos
enemyTypeRatio: { basic: 0.5, freezable: 0.5 } // Ratio de tipos
```

## 🔄 Cambiar el Nivel por Defecto

Para volver a usar TestingMapScene para pruebas:

**En `src/scenes/PreloadScene.ts`:**

```typescript
// Cambiar esta línea:
this.scene.start("Level1");

// Por esta:
this.scene.start("TestingMapScene");
```

## 🐛 Solución de Problemas

### El nivel no se ve

- ✅ Verifica que `assets/Level1.json` existe
- ✅ Verifica que se carga en `PreloadScene.ts`
- ✅ Revisa la consola del navegador por errores

### Las colisiones no funcionan

- ✅ Asegúrate de que los tiles tienen la propiedad `collision: true` en Tiled
- ✅ Verifica que el layer se llama "superficies"

### Los enemigos no aparecen

- ✅ Verifica que `enableEnemies: true` en la configuración
- ✅ Asegúrate de que hay suficientes plataformas grandes (mínimo 5 tiles de ancho)

### El agua no funciona

- ✅ Los tiles deben tener la propiedad `water: true`
- ✅ El player debe estar tocando físicamente el tile de agua

## 🎯 Próximos Pasos

1. **Diseña el nivel** en Tiled con plataformas, agua y meta
2. **Marca las propiedades** correctas en los tiles
3. **Exporta a JSON** y prueba en el juego
4. **Ajusta la dificultad** cambiando cantidad de enemigos
5. **Crea Level2** duplicando `Level1.ts` y cambiando los parámetros

¡El Level1 está listo para jugar! 🐧❄️

# 🛠️ Guía de Mantenimiento del Archivo Level1.ts

## ⚠️ Problema: El Phaser Editor Regenera el Archivo

Cada vez que guardas en el Phaser Editor, el archivo `Level1.ts` se regenera y **pierde**:

- La extensión de `BaseGameScene`
- El export de la clase
- La configuración del constructor
- Todo el código personalizado

## ✅ Solución: Pasos a Seguir Después de Guardar en el Editor

### 1. Cambiar la Declaración de la Clase

**El editor genera:**

```typescript
class Level1 extends Phaser.Scene {
	constructor() {
		super("Level1");
```

**Debes cambiarlo a:**

```typescript
class Level1 extends BaseGameScene {
	constructor() {
		// Configuración del nivel
		const config: GameSceneConfig = {
			tilemapKey: "Level1",
			surfaceLayerName: "superficies",
			backgroundLayerName: "fondo",
			objectsLayerName: "objects",
			tilesets: [
				{
					name: "spritesheet-tiles-default",
					imageKey: "spritesheet-tiles-default",
				},
				{
					name: "spritesheet-backgrounds-default",
					imageKey: "spritesheet-backgrounds-default",
				},
			],
			playerStartPosition: { x: 100, y: 100 },
			musicKey: "level1_music", // Música del nivel
		};

		super("Level1", config);
```

### 2. Agregar Propiedades de Sistemas

Después de las propiedades del tilemap, agregar:

```typescript
private level1!: Phaser.Tilemaps.Tilemap;
private level!: Phaser.Tilemaps.Tilemap;
private level_1!: Phaser.Tilemaps.Tilemap;
private coinSystem!: CoinSystem;           // ⬅️ Agregar esto
private miniPinguSystem!: MiniPinguSystem; // ⬅️ Agregar esto
```

### 3. Reemplazar el Código de Usuario

**El editor genera:**

```typescript
/* START-USER-CODE */

// Write your code here

create() {
	this.editorCreate();
}

/* END-USER-CODE */
```

**Debes reemplazarlo con:**

```typescript
/* START-USER-CODE */

/**
 * Método create - Se ejecuta automáticamente al iniciar la escena
 */
create() {
	// Llamar al create de BaseGameScene (esto ya llama a createMap() internamente)
	super.create();

	// Crear los coleccionables DESPUÉS de que BaseGameScene haya creado todo
	this.createCoins();
	this.createMiniPingus();

	// Emitir evento para compatibilidad con editor
	this.events.emit("scene-awake");
}

/**
 * Método abstracto requerido por BaseGameScene
 */
protected createMap(): void {
	// Llamar al método del editor que crea todo
	this.editorCreate();

	// Asignar el tilemap principal para que BaseGameScene pueda acceder
	this.tilemap = this.level;

	// Asignar los layers para que BaseGameScene pueda usarlos
	this.surfaceLayer = this.tilemap.getLayer("superficies")!.tilemapLayer;
	this.backgroundLayer = this.level1.getLayer("fondo")?.tilemapLayer;
	this.objectsLayer = this.level_1.getLayer("objects")?.tilemapLayer;

	// IMPORTANTE: Eliminar las imágenes estáticas del editor
	// El editor crea imágenes de monedas y mini-pingüinos que no son interactivas
	// Nuestros sistemas (CoinSystem y MiniPinguSystem) crearán las versiones funcionales
	this.children.getChildren().forEach((child) => {
		if (child instanceof Phaser.GameObjects.Image) {
			const image = child as Phaser.GameObjects.Image;
			// Eliminar imágenes de monedas del editor
			if (image.texture.key === "PT_TOKEN_MASTER_001") {
				image.destroy();
			}
			// Eliminar imágenes de mini-pingüinos del editor
			if (image.texture.key === "mini-pingu") {
				image.destroy();
			}
		}
	});
}

/**
 * Crear sistema de monedas
 */
private createCoins(): void {
	this.coinSystem = new CoinSystem(this, {
		textureKey: "PT_TOKEN_MASTER_001",
		scale: 0.03,
		depth: 10,
		floatDistance: 5,
		floatDuration: 1000,
	});

	// Extraer posiciones de las monedas del editorCreate()
	const coinPositions = [
		// Copiar las posiciones de las imágenes PT_TOKEN_MASTER_001 del editorCreate
		{ x: 128, y: 1024 },
		{ x: 128, y: 768 },
		// ... etc
	];

	this.coinSystem.createCoins(coinPositions);

	this.time.delayedCall(100, () => {
		if (this.player) {
			this.coinSystem.setupPlayerCollision(this.player);
		}
	});
}

/**
 * Crear sistema de mini-pingüinos
 */
private createMiniPingus(): void {
	this.miniPinguSystem = new MiniPinguSystem(this, {
		textureKey: "mini-pingu",
		scale: 1.0,
		depth: 10,
		bounceDistance: 10,
		bounceDuration: 800,
	});

	// Extraer posiciones de los mini-pingüinos del editorCreate()
	const miniPinguPositions = [
		// Copiar las posiciones de las imágenes "mini-pingu" del editorCreate
		{ x: 1184, y: 128 },
		{ x: 2080, y: 480 },
		{ x: 4000, y: 1408 },
	];

	this.miniPinguSystem.createMiniPingus(miniPinguPositions);

	this.time.delayedCall(100, () => {
		if (this.player) {
			this.miniPinguSystem.setupPlayerCollision(this.player);
		}
	});
}

/* END-USER-CODE */
```

### 4. Agregar el Export al Final

**El editor genera:**

```typescript
/* END OF COMPILED CODE */

// You can write more code here
```

**Debes cambiarlo a:**

```typescript
/* END OF COMPILED CODE */

// Exportar la clase para poder importarla en main.ts
export { Level1 };
```

### 5. Actualizar los Imports

Al inicio del archivo, asegúrate de tener:

```typescript
import { CoinSystem } from "../systems/CoinSystem";
import { MiniPinguSystem } from "../systems/MiniPinguSystem";
import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";
```

## 📝 Checklist Post-Guardado

- [ ] ✅ Cambiar `extends Phaser.Scene` a `extends BaseGameScene`
- [ ] ✅ Reemplazar `super("Level1")` con la configuración completa
- [ ] ✅ Agregar imports de `CoinSystem` y `MiniPinguSystem`
- [ ] ✅ Agregar propiedades privadas `coinSystem` y `miniPinguSystem`
- [ ] ✅ Reemplazar el método `create()` con la versión completa
- [ ] ✅ Agregar métodos `createMap()`, `createCoins()` y `createMiniPingus()`
- [ ] ✅ Actualizar posiciones de monedas y mini-pingüinos si cambiaron en el editor
- [ ] ✅ Agregar `export { Level1 }` al final
- [ ] ✅ Verificar que la textura "mini-pingu" esté cargada en PreloadScene

## ⚠️ Importante: Texturas Requeridas

Asegúrate de que en `PreloadScene.ts` esté cargada la textura de mini-pingüino:

```typescript
// Cargar imagen de mini-pingüino coleccionable
this.load.image("mini-pingu", "assets/mini-pingu.png");
```

Si ves un cuadro negro en lugar del mini-pingüino, es porque la textura no se ha cargado.

## 🔄 Actualizar Posiciones de Coleccionables

Cuando agregues o muevas monedas/mini-pingüinos en el editor:

1. **Busca en `editorCreate()`** las líneas como:

   ```typescript
   const image_1 = this.add.image(128, 1024, "PT_TOKEN_MASTER_001");
   ```

2. **Extrae la posición** (128, 1024) y agrégala al array `coinPositions`

3. Para mini-pingüinos, busca:

   ```typescript
   this.add.image(1184, 128, "mini-pingu");
   ```

4. **Extrae la posición** y agrégala al array `miniPinguPositions`

## 🎯 Nota Importante

**NO** modifiques el código dentro de `editorCreate()`. El Phaser Editor regenera ese método completo cada vez que guardas.

Solo extrae las posiciones de los objetos y cópialas a los arrays en `createCoins()` y `createMiniPingus()`.

# 📁 **TEMPLATES Y EJEMPLOS DE NIVELES**

Esta carpeta contiene los templates y ejemplos para crear nuevos niveles.

---

## 📋 **ARCHIVOS DISPONIBLES**

### 🏗️ **LevelTemplate.ts**

**🎯 TEMPLATE PRINCIPAL - Usar para crear nuevos niveles**

- ✅ **Template actualizado** con todos los métodos helper
- ✅ **Documentación completa** con instrucciones paso a paso
- ✅ **Configuración moderna** usando `setupTilesets()` y `createStandardLayers()`
- ✅ **Ejemplos comentados** de música, efectos, interactivos
- ✅ **Checklist integrado** para verificar implementación

**Cómo usar:**

```bash
# 1. Copiar el template
cp src/scenes/LevelTemplate.ts src/scenes/MiNuevoNivel.ts

# 2. Editar y personalizar
# - Cambiar clase "LevelTemplate" → "MiNuevoNivel"
# - Cambiar tilemapKey: "mi_mapa" → "mi_mapa_real"
# - Ajustar configuración según necesidades
```

### 🎮 **TestingMapScene.ts**

**📚 EJEMPLO DE REFERENCIA - Nivel funcional completo**

- ✅ **Ejemplo real** de implementación
- ✅ **Nivel funcional** con todas las mecánicas
- ✅ **Código optimizado** usando métodos helper
- ✅ **Referencia práctica** para casos complejos

**Usar como:**

- 📖 Ejemplo de implementación correcta
- 🔍 Referencia para debugging
- 🎯 Inspiración para niveles complejos

---

## 🚀 **FLUJO RECOMENDADO**

### Para crear un nuevo nivel:

1. **Usar LevelTemplate.ts** como base
2. **Consultar TestingMapScene.ts** si necesitas ejemplos específicos
3. **Seguir LEVEL_CREATION_GUIDE.md** para documentación completa

### Jerarquía de aprendizaje:

```
LevelTemplate.ts        ← Empezar aquí (template limpio)
     ↓
TestingMapScene.ts      ← Consultar como ejemplo (código real)
     ↓
LEVEL_CREATION_GUIDE.md ← Documentación completa (guía detallada)
```

---

## ✅ **TEMPLATES ELIMINADOS**

- ❌ **LevelTemplateSceneNew.ts** - Eliminado (obsoleto, no usaba helpers)
- ❌ **TEMPLATE_LEVEL.ts** - Eliminado (reemplazado por LevelTemplate.ts)

**Razón:** Consolidación para evitar confusión y mantener solo el template más actualizado.

---

## 🎯 **RECOMENDACIONES**

- **Siempre usar LevelTemplate.ts** como punto de partida
- **Nunca modificar BaseGameScene.ts** (es la clase base universal)
- **Consultar TestingMapScene.ts** solo como referencia
- **Seguir la guía LEVEL_CREATION_GUIDE.md** para casos complejos

¡Happy Level Creation! 🎮✨

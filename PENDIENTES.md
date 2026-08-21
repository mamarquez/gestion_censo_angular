# Pendientes

Lista de trabajo pendiente detectada en el análisis del frontend. Prioridades: 🔴 urgente,
🟡 medio, ⚪ bajo.

## 🔴 Urgente

Ninguno detectado. El único bug real conocido (`pTemplate="rowexpansion"` obsoleto en PrimeNG 19)
ya está corregido y era el único de su tipo en el proyecto (revisados los ~95 usos de `pTemplate=`
contra los nombres válidos en PrimeNG 19).

## 🟡 Medio

## ⚪ Bajo

- [ ] **Uso de Angular Signals casi inexistente.** Piloto completado y verificado en navegador:
  `views/provincias/list/provincia.component.ts` migrado de propiedades planas + `ChangeDetectorRef`
  a `signal()` (`provincia`, `provincias`, `cargando`, `modalVisible`). Queda replicar el mismo
  patrón en el resto de componentes `list/` (~57 archivos) que aún usan el estilo antiguo.

## 🟡 Pendiente de confirmar (última sesión)

- [ ] **Alta de usuario sin validación de longitud de `nombreUsuario` en el frontend.** El backend
  exige 5-50 caracteres a nivel de entidad JPA; el formulario (`datos.component.ts`, tab de
  `usuarios/edit`) solo tiene `Validators.required`. Un nombre corto llega a enviarse y falla con un
  error interno del backend en vez de marcarse en el formulario. Añadir
  `Validators.minLength(5)`/`maxLength(50)`.
- [ ] **Decisión pendiente: asignación de roles al crear usuario.** Flujo actual: crear usuario primero
  (tab Datos) → se habilita la tab Roles con el id ya real. Alternativa no implementada: permitir
  seleccionar roles en el propio formulario de alta y enviarlos en el mismo `POST`. Requiere cambios
  también en el backend (`UsuarioImpl.add()` no procesa `dto.roles()` todavía).
- [ ] Confirmar en navegador (no verificado tras el último cambio):
  - Punto nuevo añadido al mapa de una ruta muestra su id real tras guardarse (antes se quedaba en
    "?" indefinidamente).
  - "Características" de una instalación devuelve resultados tras el rename a `idInstalacion`
    (camelCase) del filtro.
  - Modal genérico `EditModalComponent` marca "Nombre" en rojo si se deja vacío (usado por Nivel
    dotación, entre otras entidades).

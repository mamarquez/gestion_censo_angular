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
  - Modal genérico `EditModalComponent` marca "Nombre" en rojo si se deja vacío (usado por Nivel
    dotación, entre otras entidades).

## ✅ Corregido (sesión 2026-09-06)

- [x] **`app.routes.ts`: 5 rutas `loadComponent` rotas, `ng build` fallaba.** Migración previa a lazy
  loading escribió mal 5 paths (`admin/admin-layout.component` en vez de
  `admin-layout/admin-layout.component`, etc.). Layout admin, listado/edición de instalaciones y
  alta/edición de usuarios quedaban inaccesibles en cualquier build de producción. Corregido
  comparando contra el último commit válido (`git diff cd5e1c6`).
- [x] **`app.routes.ts`: 4 componentes cargados eager rompían patrón lazy.**
  `EditInstalacionDeportivaComponent`, `ForbiddenComponent`, `ServerErrorComponent`,
  `NotFoundComponent` usaban `component:` directo con import estático en cabecera. Migrados a
  `loadComponent`.
- [x] **"Características" de una instalación → 500.** `Unknown column
  'ic1_0.id_instalacion_espacio_complementario' in 'field list'`. La entidad JPA
  `InstalacionCaracteristica` declaraba esa columna pero nunca existió en la tabla real
  `instalaciones_caracteristicas` (confirmado en todos los scripts `.sql` del repo). Corregido con
  `ALTER TABLE` en BD local añadiendo columna + FK hacia `instalaciones_espacios_complementarios`.
  **Pendiente:** aplicar el mismo `ALTER TABLE` en otros entornos (staging/producción) y añadir un
  script de migración versionado en `scripts/` del backend — no existe todavía.

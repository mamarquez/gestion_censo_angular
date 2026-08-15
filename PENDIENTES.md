# Pendientes

Lista de trabajo pendiente detectada en el análisis del frontend. Prioridades: 🔴 urgente,
🟡 medio, ⚪ bajo.

## 🔴 Urgente

Ninguno detectado. El único bug real conocido (`pTemplate="rowexpansion"` obsoleto en PrimeNG 19)
ya está corregido y era el único de su tipo en el proyecto (revisados los ~95 usos de `pTemplate=`
contra los nombres válidos en PrimeNG 19).

## 🟡 Medio

- [ ] **Modelos sin `createdAt`/`updatedAt`.** Ningún modelo TS revisado (`Rol`, `Pavimento`,
  `Instalacion`, `UsuarioModel`) declara estos campos, pese a que `ModeloBase` los expone en el
  backend. Confirmar si el backend los envía y se están descartando sin uso, o si simplemente no
  son necesarios en la UI (existe una vista `auditorias` separada que podría cubrir ese caso de
  uso).

## ⚪ Bajo

- [ ] **Uso de Angular Signals casi inexistente.** Solo `src/app/app.ts` y
  `admin-layout.component.ts` los usan (2 de 60 archivos); el resto usa propiedades de clase planas
  + `ChangeDetectorRef`. No es un bug, pero es una inconsistencia de estilo dado que el proyecto es
  Angular 20. Adoptar signals de forma más consistente (especialmente para estado de
  loading/tablas) sería una mejora de mantenibilidad, no una urgencia.

## Resuelto en esta sesión (referencia)

- [x] **`EditRolComponent` era código huérfano.** Sustituido por
  [`src/app/views/roles/form/rol-form.component.ts`](src/app/views/roles/form/rol-form.component.ts),
  una pantalla nueva de alta/edición de rol (nombre, descripción, activo) reutilizada para crear
  (`roles/nuevo`) y editar (`roles/:id`), registradas en `app.routes.ts`. `RolService` ganó los
  métodos `rol(id)` y `update(id, rol)` que faltaban (el backend ya los exponía en
  `RolController`/`RolImpl`, solo faltaban en el frontend). El componente y la ruta comentada
  antiguos se eliminaron.

- [x] `rol.component.html`: `pTemplate="rowexpansion"` → `pTemplate="expandedrow"` (nombre de template
  correcto en PrimeNG 19). Sin este fix, la fila expandida de permisos por rol nunca se renderizaba
  y no había ningún error visible en consola ni en Network.
- [x] **Tipados defensivos confusos.** `instalacion.ts`: `telefonos?: InstalacionTelefono[] | []` →
  `InstalacionTelefono[]`, `gestor?: Gestor | []` → `Gestor`. La unión con `[]` no aportaba nada
  sobre simplemente `| undefined`; verificado que no había usos en el código que dependieran de la
  forma anterior.
- [x] **Sin `ngOnDestroy`/gestión de suscripciones en ningún componente.** Se aplicó el patrón
  `inject(DestroyRef)` + `.pipe(takeUntilDestroyed(this.destroyRef))` (ya usado en los componentes
  `select-*`) a los 38 componentes restantes que llamaban a `.subscribe()` sin gestión, cubriendo
  las ~130 llamadas reales del proyecto. Verificado de forma independiente: cada archivo tiene el
  mismo número de `.subscribe(` que de `takeUntilDestroyed(this.destroyRef)`, salvo
  `complementario.component.ts`, donde el único `.subscribe()` sin cubrir está dentro de un bloque
  de código comentado (`editar()`, código muerto, excluido a propósito). `tsc --noEmit` limpio en
  todo el proyecto tras el cambio.
- [x] **Rutas comentadas hacia componentes que no existen.** El único caso realmente incorrecto era
  el comentario en [`app.routes.ts:155`](src/app/app.routes.ts#L155) (sección `comunidades`), que
  referenciaba `EditUsuarioComponent` (de otro dominio, copy-paste erróneo) — corregido a
  `EditComunidadComponent`. Las otras 7 rutas comentadas (`EditMunicipioComponent`,
  `EditMenuComponent`, `EditProvinciaComponent`, `EditTipoGestorPropiedadComponent`,
  `EditPropietarioComponent`, `EditPavimentoComponent`, `EditConfiguracionComponent`) son TODOs
  legítimos de funcionalidad aún no implementada y se dejan tal cual.
- [x] **"Añadir permiso" enviaba un body incompatible con el backend.**
  `RolPermisoService.crear(idRol, idTipoRol)` enviaba `{ idRol, idTipoRol }` (campos planos), pero
  el backend espera un `RolPermisoRecord` completo (`{ id, rol: {...}, tipoRol: {...} }`). Corregido
  para enviar `{ id: null, rol: { id: idRol }, tipoRol: { id: idTipoRol } }`.
- [x] **Combo de tipos de permiso roto y limitado a tipos ya asignados.** `TipoRolService.getAll()`
  llamaba a `GET /v1/roles-permisos` esperando recibir `TipoRolModel[]` (`{id, nombre}`), pero ese
  endpoint devuelve `RolPermisoModel[]` (`{id, rol, tipoRol}`) — permisos ya asignados, no el
  catálogo de tipos. Un primer parche derivaba el catálogo de esa misma respuesta (deduplicando por
  `tipoRol.id`), pero eso significaba que un tipo de permiso sin ningún rol asignado (p. ej. tras
  borrar el único permiso que lo usaba) desaparecía del combo para siempre. Solución definitiva:
  nuevo endpoint `GET /v1/roles-tipos` en el backend (`RolTipoController` + `RolTipoService` +
  `RolTipoImpl` + `RolTipoMapper` + `RolTipoRecord`, reutilizando el `RolTipoRepository` ya
  existente) que expone el catálogo completo de `tipos_roles`; `TipoRolService.getAll()` apunta
  ahora ahí directamente.
- [x] **El combo mostraba permisos que el rol ya tenía asignados.** `modal-rol-permiso.component.ts`
  ahora recibe `idsTipoRolAsignados` (input) desde `rol.component.ts`
  (`idsTipoRolAsignados(idRol)`, derivado de `permisosPorRol`) y filtra `tiposDisponibles`
  excluyendo esos ids. De paso se eliminó el cacheo de "cargar el catálogo solo la primera vez"
  (`if (this.tiposDisponibles.length === 0)`), que habría mostrado datos obsoletos de otro rol al
  reabrir el modal para un rol distinto; ahora se recarga cada vez que se abre. También se quitó un
  `console.log` de depuración.

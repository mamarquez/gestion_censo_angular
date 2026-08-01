# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

```bash
npm start          # ng serve, http://localhost:4200/, recarga automática
npm run build      # ng build (producción por defecto), salida en dist/gestion-censo
npm run watch      # ng build --watch --configuration development
npm test           # ng test (Karma, no Vitest pese a lo que diga el README)
```

Para ejecutar un único test, usa las opciones de filtrado de Karma/Jasmine (`fdescribe`/`fit` en el spec, o `ng test -- --include='**/nombre.spec.ts'`).

No hay `ng lint` configurado ni ESLint en `package.json`. El análisis estático se hace vía SonarQube (`sonar.bat`, apunta a `http://192.168.1.143:9090`, requiere `coverage/lcov.info` generado previamente con `ng test --code-coverage`).

Generar componentes con el schematic estándar: `ng generate component views/<nombre>`.

## Arquitectura

Angular 20 standalone (sin NgModules), PrimeNG 19 (tema Aura) como librería de UI, RxJS. Todo el código vive bajo `src/app`.

### Enrutamiento y layout

- `app.routes.ts` es el único punto de entrada de rutas. `/auth/*` carga perezosamente `auth/auth.routes.ts` (login, forgot/reset/change-password, session-expired). Todo lo demás cuelga de una ruta raíz con `AdminLayoutComponent` como shell y `canMatch: [authGuard]` protegiendo el acceso.
- **`authGuard`** (`auth/guards/auth.guard.ts`) tiene un `return true` incondicional al principio marcado como "MODO PRUEBAS" que anula toda comprobación de autenticación real (el resto del guard, que sí valida `AuthService.isAuthenticated()` y redirige a login, queda inalcanzable). Ten esto en cuenta antes de depurar temas de sesión/redirects: probablemente el guard no está aplicando ninguna protección ahora mismo.
- Cada entidad de negocio (provincias, municipios, roles, instalaciones, etc.) es una ruta plana bajo el layout admin, casi siempre `component:` directo salvo `usuarios`, que además define una subruta `:id` hacia `EditUsuarioComponent` (patrón listado + edición en ruta separada, a diferencia del resto de vistas que editan inline o vía diálogo).

### Patrón de vista CRUD (`src/app/views/*`)

La mayoría de entidades en `views/` (provincias, roles, medidas, caracteristicas, auditorias, gestores, estadosusos, tiposgestorespropiedades, etc.) siguen el mismo esqueleto — usa `provincia.component.ts` como referencia canónica:

- Componente standalone que importa módulos de PrimeNG a la carta (`TableModule`, `ButtonModule`, `ConfirmDialogModule`, etc.) más `ReactiveFormsModule`.
- Un `FormGroup` de filtros (`buscar()`/`limpiar()`) que se envía como query params vía `buildHttpParams()`.
- Listado con `cargar()` inicial en `ngOnInit`, estado `cargando` para spinners, y `ChangeDetectorRef` (`markForCheck`/`detectChanges`) manejado a mano en cada callback de suscripción — no se usa `async` pipe ni signals para las listas.
- `cambiarEstado(id)` (PATCH, toggle activo/inactivo) y `confirmarBorrado()` + `borrarRegistro()` (DELETE) vía `DialogService.confirmar(...)`, que envuelve `ConfirmationService` de PrimeNG.
- Mensajes de éxito/error con `MessageService` (toast de PrimeNG), inyectado y provisto localmente en cada componente (no es singleton global de la app, cada vista añade su propio `MessageService`/`ConfirmationService` en `providers`).
- Es habitual encontrar lógica de borrado comentada con un `TODO`/bloque `/* ... */` pendiente de activar contra backend real — revisa si el bloque está comentado antes de asumir que la función borra de verdad.
- Acciones de tabla (editar/activar-desactivar/borrar) se delegan al componente compartido `utils/acciones-tabla/` (`AccionesTablaComponent`), que expone `@Input() editarRoute`/`activo` y `@Output() toggleEstado`/`borrar`.

### Servicios HTTP (`src/app/services/*`)

Un servicio por entidad, todos con la misma forma (ver `usuario.service.ts`): `providedIn: 'root'`, URL base `${AUTH.API}/<entidad>`, y cuatro métodos típicos — `getAll(filtros?)`, `get(id)`, `cambiarEstado(id)` (PATCH), `borrarRegistro(id)` (DELETE). Las respuestas tipan contra `ApiResponseWrapper<T>` (listados, con `message`/`data`/`success`/`fieldErrors`) o `ApiResponse<T>` (acciones puntuales, solo `message`/`data`).

`AUTH.API` en `auth/auth.constants.ts` apunta a `http://localhost:8080/api-instalaciones/v1` — backend local, no hay entorno de `environments/` para esta URL.

### Autenticación

- `auth/interceptors/auth.interceptor.ts` añade `Authorization: Bearer <token>` (vía `TokenService`) a toda petición cuya URL no esté en `AUTH.PUBLIC_ENDPOINTS`, y sobre error HTTP hace logout+redirect en 401 y redirect a "access-denied" en 403.
- `AUTH.ROUTES` y `AUTH.PUBLIC_ENDPOINTS` centralizan las rutas de auth; usarlos en vez de hardcodear paths de login/logout.

### Utilidades transversales

- `utils/params.util.ts#buildHttpParams` es el conversor estándar de un objeto de filtros de formulario a `HttpParams`: descarta `null`/`undefined`/`''`, y trata el campo `activo` como tri-estado ('1'/'0' → boolean, '2' → se omite para "Todos"). Reutilízalo en vez de construir `HttpParams` a mano en nuevas vistas.
- `services/dialog.service.ts#DialogService.confirmar(...)` es el wrapper único sobre `ConfirmationService` de PrimeNG para diálogos de confirmación (borrado, cambios de estado peligrosos, etc.).

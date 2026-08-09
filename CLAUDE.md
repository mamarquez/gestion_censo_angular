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

Generar componentes con el schematic estándar: `ng generate component views/<entidad>/list` o `views/<entidad>/edit` (ver convención de carpetas abajo).

## Arquitectura

Angular 20 standalone (sin NgModules), PrimeNG 19 (tema Aura) como librería de UI, RxJS. Todo el código vive bajo `src/app`.

### Enrutamiento y layout

- `app.routes.ts` es el único punto de entrada de rutas. `/auth/*` carga perezosamente `auth/auth.routes.ts` (login, forgot/reset/change-password, session-expired). Todo lo demás cuelga de una ruta raíz con `AdminLayoutComponent` como shell y `canMatch: [authGuard]` protegiendo el acceso.
- **`authGuard`** (`auth/guards/auth.guard.ts`) tiene un `return true` incondicional al principio marcado como "MODO PRUEBAS" que anula toda comprobación de autenticación real (el resto del guard, que sí valida `AuthService.isAuthenticated()` y redirige a login, queda inalcanzable). Ten esto en cuenta antes de depurar temas de sesión/redirects: probablemente el guard no está aplicando ninguna protección ahora mismo.
- La mayoría de entidades definen su ruta como `children: [{ path: '', component: XxxComponent }]` con una segunda entrada `{ path: ':id', component: EditXxxComponent }` comentada como placeholder — solo `instalaciones` y `usuarios` tienen la edición por ruta realmente activada hoy. Antes de asumir que una entidad soporta edición por `:id`, comprueba si esa línea sigue comentada en `app.routes.ts`.
- Hay algunas rutas duplicadas por descuido en `app.routes.ts` (p. ej. `caracteristicas` aparece dos veces con el mismo componente) — no es intencional, es fruto de ediciones sucesivas sin limpiar.

### Convención de carpetas por entidad (`src/app/views/<entidad>/`)

Cada entidad vive en `views/<entidad>/`, y dentro casi siempre hay una subcarpeta `list/` (listado + filtros, sigue siendo la ruta base `''`) y, si tiene edición dedicada, una subcarpeta `edit/` (formulario en ruta `:id`). Ejemplos: `usuarios/list` + `usuarios/edit`, `instalaciones/list` + `instalaciones/edit`, `provincias/list` + `provincias/edit` (esta última sin ruta `:id` activada todavía). Entidades más simples solo tienen `list/`.

### Patrón de vista CRUD (`views/<entidad>/list/*`)

La mayoría de listados siguen el mismo esqueleto — usa `provincias/list/provincia.component.ts` como referencia canónica:

- Componente standalone que importa módulos de PrimeNG a la carta (`TableModule`, `ButtonModule`, `ConfirmDialogModule`, etc.) más `ReactiveFormsModule`.
- Un `FormGroup` de filtros (`buscar()`/`limpiar()`) que se envía como query params vía `buildHttpParams()`.
- Listado con `cargar()` inicial en `ngOnInit`, estado `cargando` para spinners, y `ChangeDetectorRef` (`markForCheck`/`detectChanges`) manejado a mano en cada callback de suscripción — no se usa `async` pipe ni signals para las listas (salvo excepciones puntuales, ver componentes `select-*` más abajo).
- `cambiarEstado(id)` (PATCH, toggle activo/inactivo) y `confirmarBorrado()` + `borrarRegistro()` (DELETE) vía `DialogService.confirmar(...)`, que envuelve `ConfirmationService` de PrimeNG.
- Mensajes de éxito/error con `MessageService` (toast de PrimeNG), inyectado y provisto localmente en cada componente (no es singleton global de la app, cada vista añade su propio `MessageService`/`ConfirmationService` en `providers`).
- Es habitual encontrar lógica de borrado/cambio de estado comentada con un bloque `/* ... */` pendiente de activar contra backend real — revisa si el bloque está comentado antes de asumir que la función borra o cambia estado de verdad. Esto es un patrón recurrente: cuando algo "no funciona", la primera sospecha razonable es que su cuerpo real sigue comentado.
- Acciones de tabla (editar/activar-desactivar/borrar/visible) se delegan al componente compartido `utils/acciones-tabla/` (`AccionesTablaComponent`), que expone `@Input() editarRoute`, `@Input() activo` y `@Input() visible` (ambos opcionales — si no se pasan, el botón correspondiente no se renderiza; **no les pongas un valor por defecto no-opcional como `activo = true`**, porque entonces la condición de "opcional" deja de funcionar) y `@Output() toggleEstado`/`toggleVisible`/`borrar`.

### Instalaciones y sus tabs (`views/instalaciones/edit/*`)

`instalaciones` es la entidad más compleja: `EditInstalacionComponent` es un shell con navegación por pestañas manuales (`tabActiva`, sin `router-outlet` ni lazy loading) que monta un componente hijo distinto por tab bajo `views/instalaciones/edit/tabs/<tab>/` (`datos`, `geoposicion`, `telefonos`, `deportivos`, `caracteristicas`, `complementarios`). Patrón a tener en cuenta al tocar cualquiera de estos tabs o al añadir uno nuevo:

- Cada tab es un componente standalone independiente que **no** lee el `:id` de instalación de un `@Input()` sino de `ActivatedRoute` directamente (`this.route.snapshot.paramMap.get('id')`), aunque esté anidado varios niveles dentro del shell — asume que la ruta padre (`instalaciones/:id`) sigue siendo la misma para todos los tabs.
- Cada tab expone `@Output() cargandoChange = new EventEmitter<boolean>()`, que el shell (`EditInstalacionComponent.onCargandoChange`) usa para mostrar `<app-loader>` mientras carga. El primer `emit(true)` ocurre de forma síncrona dentro de `ngOnInit`/`cargarDatos()`, lo cual puede disparar `NG0100 ExpressionChangedAfterItHasBeenCheckedError` si el padre asigna el valor directamente en el mismo ciclo — por eso `onCargandoChange` en el shell difiere la asignación con `Promise.resolve().then(...)` en vez de mutar `cargando` de forma síncrona. Si añades un tab nuevo, replica el `@Output() cargandoChange` con el mismo nombre para que el shell lo capte vía `(cargandoChange)="onCargandoChange($event)"` en la plantilla.
- Espacios deportivos tiene un segundo nivel de edición propio: `edit-espacio-deportivo/edit-instalacion-deportiva.component.ts`, con ruta independiente `instalacionesespacios/:id` (fuera del árbol de tabs de la instalación), que a su vez embebe `<app-list-caracteristicas [idEspacioDeportivo]="...">` (`components/caracteristicas/`) para listar características propias de ese espacio deportivo.
- Los nombres de campo entre frontend (TS/HTML) y backend (Java/JPA) para las relaciones de `instalacionescaracteristicas` han sufrido varios renombres a medias (`id_instalacion_espacio_deportivo` → `instalacionEspacioDeportivo`, etc.) repartidos entre la entidad JPA, el `Specification`/filtro, el mapper MapStruct y el DTO de request. Si un filtro por relación (`instalacionEspacioDeportivo`, `idInstalacion`, etc.) empieza a devolver de más o lanza `PathElementException`/`NoSuchMethodError` en el backend, sospecha primero de un nombre de campo desincronizado entre esas cuatro capas antes de tocar el frontend.

### Componentes select reutilizables (`src/app/components/select-*`)

`select-comunidad`, `select-provincia`, `select-municipio` envuelven `p-select` de PrimeNG implementando `ControlValueAccessor` (con `NG_VALUE_ACCESSOR` en `providers`), para poder usarse con `formControlName` desde fuera como si fueran un input nativo. Detalles importantes:

- **La plantilla interna nunca usa `formControlName` sobre el `p-select`** — usa `[ngModel]="value"` + `(onChange)="seleccionar($event)"` manual. Este es el único patrón que funciona de forma fiable con `optionValue` en este proyecto; usar `formControlName` directo sobre `p-select` con `optionValue` dentro de estos wrappers causa selección inestable (el dropdown se cierra y reabre solo). Si necesitas un `p-select` con `optionValue` fuera de un `ControlValueAccessor` propio (p. ej. dentro de un modal), replica el mismo patrón `[ngModel]` + `(onChange)` en vez de `formControlName` directo.
- `select-municipio` vive en la carpeta `components/select-municipio/` pero sus archivos se llaman `select-provincia.component.ts`/`.html` (residuo de copy-paste, nombre de archivo engañoso — la clase exportada sí es `SelectMunicipioComponent` con selector `app-select-municipio`).
- Ninguno de los tres implementa cascada real entre sí (comunidad → provincia → municipio): cada uno carga su catálogo completo de forma independiente en su propio `ngOnInit`, sin filtrar por la selección del padre en la jerarquía, pese a que visualmente aparecen encadenados en formularios como `instalaciones/edit/tabs/datos`.
- `select-comunidad` expone `comunidades`/`cargandoComunidades` como Angular `signal()`; los otros dos (`select-provincia`, `select-municipio`) usan propiedades planas. Si tocas la plantilla de `select-comunidad`, recuerda invocar la señal (`comunidades()`), no pasarla directa a `[options]`.

### Servicios HTTP (`src/app/services/*`)

Un servicio por entidad, todos con la misma forma (ver `usuario.service.ts`): `providedIn: 'root'`, URL base `${AUTH.API}/<entidad>`, y cuatro métodos típicos — `getAll(filtros?)`, `get(id)`, `cambiarEstado(id)` (PATCH), `borrarRegistro(id)` (DELETE). Las respuestas tipan contra `ApiResponseWrapper<T>` (listados, con `message`/`data`/`success`/`fieldErrors`) o `ApiResponse<T>` (acciones puntuales, solo `message`/`data`) — la elección entre ambos wrappers es inconsistente entre servicios, no asumas cuál usa uno nuevo sin mirarlo.

`AUTH.API` en `auth/auth.constants.ts` apunta a `http://localhost:8080/api-instalaciones/v1` — backend local, no hay entorno de `environments/` para esta URL.

### Autenticación

- `auth/interceptors/auth.interceptor.ts` añade `Authorization: Bearer <token>` (vía `TokenService`) a toda petición cuya URL no esté en `AUTH.PUBLIC_ENDPOINTS`, y sobre error HTTP hace logout+redirect en 401 y redirect a "access-denied" en 403.
- `AUTH.ROUTES` y `AUTH.PUBLIC_ENDPOINTS` centralizan las rutas de auth; usarlos en vez de hardcodear paths de login/logout.

### Utilidades transversales

- `utils/params.util.ts#buildHttpParams` es el conversor estándar de un objeto de filtros de formulario a `HttpParams`: descarta `null`/`undefined`/`''`, y trata el campo `activo` como tri-estado ('1'/'0' → boolean, '2' → se omite para "Todos"). Reutilízalo en vez de construir `HttpParams` a mano en nuevas vistas.
- `services/dialog.service.ts#DialogService.confirmar(...)` es el wrapper único sobre `ConfirmationService` de PrimeNG para diálogos de confirmación (borrado, cambios de estado peligrosos, etc.).
- `src/formularios.css` (registrado como estilo global en `angular.json`, junto a `src/styles.css`) centraliza clases de layout de formulario reutilizadas en varias vistas: `.fields-row` (grid de 12 columnas, **no** flexbox — `justify-content` no tiene el efecto esperado sobre un solo hijo, usa flex inline si necesitas alinear algo suelto), `.col-1`…`.col-12`, `.field-checkbox`, y el switch visual `.switch-native`/`.slider-native` con variantes `.rojo`/`.verde`. Antes de este archivo existían copias duplicadas de las reglas del switch en `styles.css` y en varios `*.component.css` por componente — si ves un switch que no coge color, sospecha primero de una copia local con `background-color` fija pisando la regla de `formularios.css`, en vez de asumir que falta la clase `.rojo`/`.verde`.

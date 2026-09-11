# CLAUDE.md

Archivo da guía a Claude Code (claude.ai/code) para trabajar código en repo.

## Regla general

Si algo no confirmado en código, BD real o usuario: no inventar ni asumir. Preguntar usuario en vez adivinar (endpoint, nombre campo, entidad, esquema tabla, decisión producto, etc).

## Estilo de respuesta

Responder siempre español modo caveman (terso, sin artículos ni relleno, sustancia técnica intacta). Aplica toda sesión, sin excepción.

## Memoria de sesión (MemPalace)

Al iniciar sesión repo: ejecutar `mempalace wake-up` (CLI instalado en `C:\Users\dunca\.local\bin`, no PATH por defecto — usar ruta completa o `$env:PATH = "$env:USERPROFILE\.local\bin;$env:PATH"` antes) para cargar contexto sesiones previas antes empezar trabajar.

## Comandos

```bash
npm start          # ng serve, http://localhost:4200/, recarga automática
npm run build      # ng build (producción por defecto), salida en dist/gestion-censo
npm run watch      # ng build --watch --configuration development
npm test           # ng test (Karma, no Vitest pese a lo que diga el README)
```

Para ejecutar único test: usar filtrado Karma/Jasmine (`fdescribe`/`fit` en spec, o `ng test -- --include='**/nombre.spec.ts'`).

No hay `ng lint` configurado ni ESLint en `package.json`. Análisis estático vía SonarQube (`sonar.bat`, apunta `http://192.168.1.143:9090`, requiere `coverage/lcov.info` generado antes con `ng test --code-coverage`).

Generar componentes con schematic estándar: `ng generate component views/<entidad>/list` o `views/<entidad>/edit` (ver convención carpetas abajo).

## Arquitectura

Angular 20 standalone (sin NgModules), PrimeNG 19 (tema Aura) como librería UI, RxJS. Todo código vive bajo `src/app`.

### Enrutamiento y layout

- `app.routes.ts` único punto entrada rutas. `/auth/*` carga perezosa `auth/auth.routes.ts` (login, forgot/reset/change-password, session-expired). Resto cuelga ruta raíz con `AdminLayoutComponent` como shell y `canMatch: [authGuard]` protegiendo acceso.
- **`authGuard`** (`auth/guards/auth.guard.ts`) tiene `return true` incondicional al inicio, marcado "MODO PRUEBAS", anula toda comprobación autenticación real (resto guard, que sí valida `AuthService.isAuthenticated()` y redirige login, queda inalcanzable). Ojo antes depurar temas sesión/redirects: probable guard no aplica protección ahora mismo.
- Mayoría entidades definen ruta como `children: [{ path: '', component: XxxComponent }]` con segunda entrada `{ path: ':id', component: EditXxxComponent }` comentada como placeholder — solo `instalaciones` y `usuarios` tienen edición por ruta realmente activada hoy. Antes asumir entidad soporta edición por `:id`: comprobar si línea sigue comentada en `app.routes.ts`.
- Hay rutas duplicadas por descuido en `app.routes.ts` (p. ej. `caracteristicas` aparece dos veces mismo componente) — no intencional, fruto ediciones sucesivas sin limpiar.

### Convención de carpetas por entidad (`src/app/views/<entidad>/`)

Cada entidad vive en `views/<entidad>/`, dentro casi siempre subcarpeta `list/` (listado + filtros, sigue ruta base `''`) y, si tiene edición dedicada, subcarpeta `edit/` (formulario ruta `:id`). Ejemplos: `usuarios/list` + `usuarios/edit`, `instalaciones/list` + `instalaciones/edit`, `provincias/list` + `provincias/edit` (esta última sin ruta `:id` activada todavía). Entidades más simples solo tienen `list/`.

### Patrón de vista CRUD (`views/<entidad>/list/*`)

Mayoría listados siguen mismo esqueleto — usar `provincias/list/provincia.component.ts` como referencia canónica:

- Componente standalone, importa módulos PrimeNG a la carta (`TableModule`, `ButtonModule`, `ConfirmDialogModule`, etc.) más `ReactiveFormsModule`.
- `FormGroup` de filtros (`buscar()`/`limpiar()`), enviado como query params vía `buildHttpParams()`.
- Listado con `cargar()` inicial en `ngOnInit`, estado `cargando` para spinners, `ChangeDetectorRef` (`markForCheck`/`detectChanges`) manejado a mano en cada callback suscripción — no usa `async` pipe ni signals para listas (salvo excepciones puntuales, ver componentes `select-*` abajo).
- `cambiarEstado(id)` (PATCH, toggle activo/inactivo) y `confirmarBorrado()` + `borrarRegistro()` (DELETE) vía `DialogService.confirmar(...)`, envuelve `ConfirmationService` PrimeNG.
- Mensajes éxito/error con `MessageService` (toast PrimeNG), inyectado y provisto local cada componente (no singleton global app, cada vista añade propio `MessageService`/`ConfirmationService` en `providers`).
- Habitual encontrar lógica borrado/cambio estado comentada con bloque `/* ... */` pendiente activar contra backend real — revisar si bloque comentado antes asumir función borra o cambia estado de verdad. Patrón recurrente: cuando algo "no funciona", primera sospecha razonable = cuerpo real sigue comentado.
- Acciones tabla (editar/activar-desactivar/borrar/visible) delegadas a componente compartido `utils/acciones-tabla/` (`AccionesTablaComponent`), expone `@Input() editarRoute`, `@Input() activo` y `@Input() visible` (ambos opcionales — si no pasan, botón correspondiente no renderiza; **no poner valor por defecto no-opcional como `activo = true`**, porque condición "opcional" deja funcionar) y `@Output() toggleEstado`/`toggleVisible`/`borrar`.

### Instalaciones y sus tabs (`views/instalaciones/edit/*`)

`instalaciones` = entidad más compleja: `EditInstalacionComponent` shell con navegación pestañas manuales (`tabActiva`, sin `router-outlet` ni lazy loading), monta componente hijo distinto por tab bajo `views/instalaciones/edit/tabs/<tab>/` (`datos`, `geoposicion`, `telefonos`, `deportivos`, `caracteristicas`, `complementarios`). Patrón tener cuenta al tocar estos tabs o añadir uno nuevo:

- Cada tab componente standalone independiente, **no** lee `:id` instalación de `@Input()` sino de `ActivatedRoute` directo (`this.route.snapshot.paramMap.get('id')`), aunque anidado varios niveles dentro shell — asume ruta padre (`instalaciones/:id`) sigue misma para todos tabs.
- Cada tab expone `@Output() cargandoChange = new EventEmitter<boolean>()`, shell (`EditInstalacionComponent.onCargandoChange`) usa para mostrar `<app-loader>` mientras carga. Primer `emit(true)` ocurre síncrono dentro `ngOnInit`/`cargarDatos()`, puede disparar `NG0100 ExpressionChangedAfterItHasBeenCheckedError` si padre asigna valor directo mismo ciclo — por eso `onCargandoChange` en shell difiere asignación con `Promise.resolve().then(...)` en vez mutar `cargando` síncrono. Si añades tab nuevo: replicar `@Output() cargandoChange` mismo nombre para shell captarlo vía `(cargandoChange)="onCargandoChange($event)"` en plantilla.
- Espacios deportivos tiene segundo nivel edición propio: `edit-espacio-deportivo/edit-instalacion-deportiva.component.ts`, ruta independiente `instalacionesespacios/:id` (fuera árbol tabs instalación), a su vez embebe `<app-list-caracteristicas [idEspacioDeportivo]="...">` (`components/caracteristicas/`) para listar características propias ese espacio deportivo.
- Nombres campo entre frontend (TS/HTML) y backend (Java/JPA) para relaciones `instalacionescaracteristicas` sufrieron varios renombres a medias (`id_instalacion_espacio_deportivo` → `instalacionEspacioDeportivo`, etc.) repartidos entre entidad JPA, `Specification`/filtro, mapper MapStruct y DTO request. Si filtro por relación (`instalacionEspacioDeportivo`, `idInstalacion`, etc.) empieza devolver de más o lanza `PathElementException`/`NoSuchMethodError` en backend: sospechar primero nombre campo desincronizado entre esas cuatro capas antes tocar frontend.

### Componentes select reutilizables (`src/app/components/select-*`)

`select-comunidad`, `select-provincia`, `select-municipio` envuelven `p-select` PrimeNG implementando `ControlValueAccessor` (con `NG_VALUE_ACCESSOR` en `providers`), para usarse con `formControlName` desde fuera como input nativo. Detalles importantes:

- **Plantilla interna nunca usa `formControlName` sobre `p-select`** — usa `[ngModel]="value"` + `(onChange)="seleccionar($event)"` manual. Único patrón funciona fiable con `optionValue` en proyecto; usar `formControlName` directo sobre `p-select` con `optionValue` dentro estos wrappers causa selección inestable (dropdown cierra y reabre solo). Si necesitas `p-select` con `optionValue` fuera `ControlValueAccessor` propio (p. ej. dentro modal): replicar mismo patrón `[ngModel]` + `(onChange)` en vez `formControlName` directo.
- `select-municipio` vive carpeta `components/select-municipio/` pero archivos llamados `select-provincia.component.ts`/`.html` (residuo copy-paste, nombre archivo engañoso — clase exportada sí es `SelectMunicipioComponent` con selector `app-select-municipio`).
- Ninguno tres implementa cascada real entre sí (comunidad → provincia → municipio): cada uno carga catálogo completo independiente en propio `ngOnInit`, sin filtrar por selección padre en jerarquía, pese visualmente aparecer encadenados en formularios como `instalaciones/edit/tabs/datos`.
- `select-comunidad` expone `comunidades`/`cargandoComunidades` como Angular `signal()`; otros dos (`select-provincia`, `select-municipio`) usan propiedades planas. Si tocas plantilla `select-comunidad`: recordar invocar señal (`comunidades()`), no pasar directa a `[options]`.

### Servicios HTTP (`src/app/services/*`)

Un servicio por entidad, todos misma forma (ver `usuario.service.ts`): `providedIn: 'root'`, URL base `${AUTH.API}/<entidad>`, cuatro métodos típicos — `getAll(filtros?)`, `get(id)`, `cambiarEstado(id)` (PATCH), `borrarRegistro(id)` (DELETE). Respuestas tipan contra `ApiResponseWrapper<T>` (listados, con `message`/`data`/`success`/`fieldErrors`) o `ApiResponse<T>` (acciones puntuales, solo `message`/`data`) — elección entre ambos wrappers inconsistente entre servicios, no asumir cuál usa uno nuevo sin mirar.

`AUTH.API` en `auth/auth.constants.ts` apunta `http://localhost:8080/api-instalaciones/v1` — backend local, no hay entorno `environments/` para esta URL.

### Autenticación

- `auth/interceptors/auth.interceptor.ts` añade `Authorization: Bearer <token>` (vía `TokenService`) a toda petición cuya URL no esté en `AUTH.PUBLIC_ENDPOINTS`; sobre error HTTP: logout+redirect en 401 y redirect "access-denied" en 403.
- `AUTH.ROUTES` y `AUTH.PUBLIC_ENDPOINTS` centralizan rutas auth; usar en vez hardcodear paths login/logout.

### Utilidades transversales

- `utils/params.util.ts#buildHttpParams` = conversor estándar objeto filtros formulario a `HttpParams`: descarta `null`/`undefined`/`''`, trata campo `activo` como tri-estado ('1'/'0' → boolean, '2' → omite para "Todos"). Reutilizar en vez construir `HttpParams` a mano en vistas nuevas.
- `services/dialog.service.ts#DialogService.confirmar(...)` = wrapper único sobre `ConfirmationService` PrimeNG para diálogos confirmación (borrado, cambios estado peligrosos, etc.).
- `src/formularios.css` (registrado estilo global en `angular.json`, junto `src/styles.css`) centraliza clases layout formulario reutilizadas en varias vistas: `.fields-row` (grid 12 columnas, **no** flexbox — `justify-content` no tiene efecto esperado sobre un solo hijo, usar flex inline si necesitas alinear algo suelto), `.col-1`…`.col-12`, `.field-checkbox`, switch visual `.switch-native`/`.slider-native` con variantes `.rojo`/`.verde`. Antes este archivo existían copias duplicadas reglas switch en `styles.css` y varios `*.component.css` por componente — si ves switch que no coge color: sospechar primero copia local con `background-color` fija pisando regla `formularios.css`, en vez asumir falta clase `.rojo`/`.verde`.
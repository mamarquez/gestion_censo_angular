# Gestión Censo

Frontend Angular para el sistema de gestión del censo de instalaciones deportivas. Aplicación
standalone (sin `NgModule`) que consume la API REST [instalaciones-api](../../../java/instalaciones-api).

## Stack técnico

- **Angular 20** (componentes standalone, signals puntuales)
- **PrimeNG 20** (tema Aura) — librería de componentes UI
- **RxJS**
- **@ngx-translate/core** — internacionalización de textos (pipe `translate`)
- **Leaflet** — mapas interactivos (geoposición y rutas de instalación)
- **proj4** — conversión de coordenadas geográficas (UTM/GMS)
- **CKEditor 5** — editor de texto enriquecido
- Karma + Jasmine para tests unitarios

## Requisitos

- Node.js y npm (`packageManager: npm@10.9.8`)
- La API backend [instalaciones-api](../../../java/instalaciones-api) corriendo en local (por
  defecto en `http://localhost:8080/api-instalaciones`)

## Puesta en marcha

```bash
npm install
npm start
```

`npm start` ejecuta `ng serve`. La app queda disponible en `http://localhost:4200/` por defecto,
con recarga automática.

## Comandos habituales

| Comando | Acción |
|---|---|
| `npm start` | `ng serve` — servidor de desarrollo |
| `npm run build` | `ng build` — compilación de producción, salida en `dist/gestion-censo` |
| `npm run watch` | `ng build --watch --configuration development` |
| `npm test` | `ng test` — tests unitarios (Karma + Jasmine) |

Para ejecutar un único test, usa `fdescribe`/`fit` en el spec, o
`ng test -- --include='**/nombre.spec.ts'`.

No hay `ng lint` configurado ni ESLint en `package.json`. El análisis estático se hace vía
SonarQube (`sonar.bat`, requiere `coverage/lcov.info` generado con `ng test --code-coverage`).

## Configuración de la API

La URL base de la API y las rutas de autenticación se configuran en
[`src/app/auth/auth.constants.ts`](src/app/auth/auth.constants.ts) (constante `AUTH.API`). Por
defecto apunta a `http://localhost:8080/api-instalaciones/v1` — no hay carpeta `environments/`
para esta URL, hay que editar la constante directamente.

## Autenticación

- `auth/interceptors/auth.interceptor.ts` añade `Authorization: Bearer <token>` a toda petición
  cuya URL no esté en `AUTH.PUBLIC_ENDPOINTS`, y gestiona logout+redirect en 401 y redirect a
  "access-denied" en 403.
- `auth/guards/auth.guard.ts` protege las rutas del layout de administración.
  **Importante:** actualmente tiene un `return true` incondicional marcado como "MODO PRUEBAS"
  que anula la comprobación real de sesión — el resto del guard (que sí valida
  `AuthService.isAuthenticated()`) queda inalcanzable.
- Pantallas de auth: login, forgot/reset/change-password, session-expired, access-denied
  (bajo `src/app/auth/`, cargadas de forma perezosa vía `/auth/*`).

## Estructura

Código fuente bajo `src/app/`:

- **`auth/`** — login, cambio/recuperación de contraseña, guards e interceptores.
- **`layouts/`** — layout de administración (header, sidebar, footer, loader).
- **`views/`** — pantallas por entidad de dominio, cada una normalmente con una subcarpeta
  `list/` (listado + filtros) y, si tiene edición dedicada, `edit/` (formulario en ruta `:id`).
- **`components/`** — componentes reutilizables (selects encadenados, mapas, modales).
- **`services/`** — un servicio HTTP por entidad, consumiendo la API REST del backend.
- **`models/`** — modelos/interfaces TypeScript que reflejan los DTOs (`records`) de la API.
- **`interface/`** — interfaces genéricas compartidas (wrapper de respuesta de la API).
- **`utils/`** — utilidades transversales (construcción de `HttpParams`, mensajes de toast,
  componente de acciones de tabla).
- **`pipe/`** — pipes personalizados (p. ej. truncado de texto).

### Entidades gestionadas

`instalaciones`, `usuarios`, `roles`, `provincias`, `municipios`, `comunidades` (autónomas),
`menus`, `tiposgestorespropiedades`, `propietarios`, `gestores`, `caracteristicas`, `auditorias`,
`pavimentos`, `configuraciones`, `medidas`, `actividadesdeportivas`, `centroseducativos`,
`cerramientos`, `conservaciones`, `nivelesenergeticos`, `niveleseducativos`,
`nivelesdotaciones`, `iluminaciones`, `estadosusos`.

Solo **`instalaciones`**, **`usuarios`** y **`roles`** tienen edición por ruta (`:id`) realmente
activada hoy; el resto de entidades definen la ruta pero la dejan comentada como placeholder en
[`app.routes.ts`](src/app/app.routes.ts).

### Patrón de vista CRUD (`views/<entidad>/list/*`)

La mayoría de listados siguen el mismo esqueleto (`provincias/list/provincia.component.ts` como
referencia canónica):

- Componente standalone con módulos de PrimeNG a la carta + `ReactiveFormsModule`.
- Un `FormGroup` de filtros (`buscar()`/`limpiar()`), enviado como query params vía
  `utils/params.util.ts#buildHttpParams`.
- Listado con `cargar()` inicial en `ngOnInit`, spinner con `cargando`, y
  `ChangeDetectorRef` gestionado a mano en cada suscripción.
- `cambiarEstado(id)` (PATCH) y `confirmarBorrado()` + `borrarRegistro()` (DELETE) vía
  `services/dialog.service.ts#DialogService.confirmar(...)`.
- Mensajes de éxito/error con `MessageService` de PrimeNG, provisto localmente por cada vista.
- Acciones de tabla (editar/activar-desactivar/borrar/visible) delegadas al componente compartido
  `utils/acciones-tabla/` (`AccionesTablaComponent`).

### Instalaciones — la entidad más compleja

`views/instalaciones/edit/editInstalacion.component.ts` es un shell con navegación por pestañas
manuales (sin `router-outlet`), que monta un componente hijo distinto por tab bajo
`views/instalaciones/edit/tabs/`:

| Tab | Contenido |
|---|---|
| `datos` | Datos generales de la instalación |
| `geoposicion` | Coordenadas GMS/UTM/NMEA con conversión vía `proj4` |
| `telefonos` | Teléfonos de contacto |
| `caracteristicas` | Características asociadas |
| `deportivos` | Espacios deportivos (con edición propia de segundo nivel) |
| `complementarios` | Espacios complementarios |
| `rutas` | Rutas de senderismo/running/BTT con mapa Leaflet, cálculo de distancia y tiempos |
| `imagenes` | Galería de imágenes de la instalación (subida, visibilidad, ampliación) |

Cada tab lee el `:id` de instalación directamente de `ActivatedRoute` (no vía `@Input()`), y
expone `@Output() cargandoChange` para que el shell muestre `<app-loader>` mientras carga.

### Componentes select reutilizables (`src/app/components/select-*`)

`select-comunidad`, `select-provincia`, `select-municipio` (y variantes para deportivo,
complementario, tipo de gestor) envuelven `p-select` de PrimeNG implementando
`ControlValueAccessor`, usables con `formControlName` como un input nativo.

## Configuración de estilos

`src/formularios.css` (registrado junto a `src/styles.css` en `angular.json`) centraliza clases de
layout de formulario reutilizadas en varias vistas: `.fields-row` (grid de 12 columnas),
`.col-1`…`.col-12`, `.field-checkbox`, y el switch visual `.switch-native`/`.slider-native`.

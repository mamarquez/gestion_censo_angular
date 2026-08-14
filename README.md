# gestion_censo_angular

Frontend ("Gestión Censo") para el sistema de gestión de instalaciones deportivas. Aplicación
Angular standalone que consume la API REST [instalaciones-api](../../../java/instalaciones-api).

## Stack técnico

- Angular 20
- PrimeNG 19 (componentes UI)
- RxJS
- Componentes standalone (sin `NgModule`)

## Requisitos

- Node.js y npm (`packageManager: npm@10.9.8`)
- La API backend [instalaciones-api](../../../java/instalaciones-api) corriendo en local (por
  defecto en `http://localhost:8080/api-instalaciones`)

## Puesta en marcha

```bash
npm install
npm start
```

`npm start` ejecuta `ng serve`. La app queda disponible en `http://localhost:4200/` por defecto.

## Comandos habituales

- Arrancar en desarrollo: `npm start` (`ng serve`)
- Compilar: `npm run build` (`ng build`)
- Compilar en modo watch: `npm run watch`
- Ejecutar tests: `npm test` (`ng test`, Karma + Jasmine)

## Configuración de la API

La URL base de la API y rutas de autenticación se configuran en
[`src/app/auth/auth.constants.ts`](src/app/auth/auth.constants.ts) (constante `AUTH.API`). Por
defecto apunta a `http://localhost:8080/api-instalaciones/v1`.

## Estructura

Código fuente bajo `src/app/`:

- `auth/` — login, cambio/recuperación de contraseña, guards e interceptores de autenticación.
- `layouts/` — layout de administración (header, sidebar, footer, loader).
- `views/` — pantallas por entidad de dominio (instalaciones, municipios, provincias, roles,
  usuarios, etc.), cada una normalmente con una subcarpeta `list/` (y `edit/` cuando aplica).
- `components/` — componentes reutilizables específicos de dominio (p. ej. modales).
- `services/` — servicios HTTP que consumen la API REST del backend, uno por entidad.
- `models/` — modelos/interfaces TypeScript que reflejan los DTOs (`records`) de la API.
- `interface/` — interfaces genéricas compartidas (p. ej. el wrapper de respuesta de la API).
- `utils/` — utilidades y componentes de soporte transversales (tablas, mensajes, etc.).

Cada vista de listado sigue un patrón similar: un `FormGroup` de filtros, una tabla PrimeNG
(`p-table`) alimentada por el servicio correspondiente, y acciones estándar (alta, edición, cambio
de estado, borrado) delegadas a los servicios de `services/`.

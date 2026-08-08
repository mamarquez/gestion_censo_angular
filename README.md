# Gestión Censo

Aplicación de gestión del censo de instalaciones deportivas municipales (provincias, municipios, instalaciones, espacios deportivos y complementarios, características, teléfonos, usuarios, roles, etc.), construida con Angular 20 (standalone, sin NgModules) y PrimeNG 19 (tema Aura).

Consulta [CLAUDE.md](./CLAUDE.md) para el detalle de arquitectura, patrones de vista CRUD y utilidades transversales del proyecto.

## Requisitos

- Node.js y npm (ver `packageManager` en `package.json`)
- Backend Java disponible en `http://localhost:8080/api-instalaciones/v1` (definido en `src/app/auth/auth.constants.ts`, sin `environments/` para esta URL)

## Servidor de desarrollo

```bash
npm start
```

Abre `http://localhost:4200/`. Recarga automática al modificar los ficheros fuente.

## Compilación

```bash
npm run build      # producción por defecto, salida en dist/gestion-censo
npm run watch      # build en modo watch, configuración development
```

## Tests

```bash
npm test           # ng test (Karma/Jasmine)
```

Para ejecutar un único test, usa `fdescribe`/`fit` en el spec correspondiente, o `ng test -- --include='**/nombre.spec.ts'`.

No hay `ng lint` ni ESLint configurados. El análisis estático se realiza vía SonarQube (`sonar.bat`), que requiere `coverage/lcov.info` generado previamente con `ng test --code-coverage`.

## Generación de componentes

```bash
ng generate component views/<nombre>
```

## Recursos adicionales

Para más información sobre Angular CLI, consulta la [documentación oficial](https://angular.dev/tools/cli).

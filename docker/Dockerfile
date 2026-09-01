# syntax=docker/dockerfile:1

# ---- Etapa de build ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Etapa de servido (Nginx) ----
FROM nginx:1.27-alpine AS runtime

# Config de Nginx con fallback SPA para Angular Router
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Bundle generado por Angular (@angular/build:application -> carpeta "browser")
COPY --from=build /app/dist/gestion-censo/browser /usr/share/nginx/html

# Script que sustituye la URL de la API en los JS ya compilados, en tiempo de arranque,
# a partir de la variable de entorno API_URL. Evita tener que recompilar el frontend
# para apuntar a un backend distinto en cada despliegue.
COPY docker/docker-entrypoint.sh /docker-entrypoint.d/40-configure-api-url.sh
RUN chmod +x /docker-entrypoint.d/40-configure-api-url.sh

EXPOSE 80

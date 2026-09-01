#!/bin/sh
# Sustituye, en tiempo de arranque, la URL de la API que quedó compilada en los bundles
# JS de Angular (src/app/auth/auth.constants.ts no usa environments/, la URL viene fija).
# Permite apuntar a un backend distinto en cada despliegue sin recompilar el frontend.
set -eu

DEFAULT_API_URL="http://localhost:8080/api-instalaciones/v1"
TARGET_API_URL="${API_URL:-$DEFAULT_API_URL}"
HTML_DIR="/usr/share/nginx/html"

if [ "$TARGET_API_URL" != "$DEFAULT_API_URL" ]; then
    echo "Configurando API_URL -> $TARGET_API_URL"

    find "$HTML_DIR" -maxdepth 1 -type f -name '*.js' | while read -r archivo; do
        sed -i "s#$DEFAULT_API_URL#$TARGET_API_URL#g" "$archivo"
    done
else
    echo "API_URL no definida (o igual al valor por defecto); se mantiene $DEFAULT_API_URL"
fi

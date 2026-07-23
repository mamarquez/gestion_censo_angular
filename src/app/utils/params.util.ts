import { HttpParams } from '@angular/common/http';

/**
 * Convierte un objeto de filtros arbitrario en un objeto HttpParams válido de Angular,
 * mapeando automáticamente los selectores de estado booleano ('1' -> true, '0' -> false)
 * e ignorando valores '2', vacíos, nulls o undefined.
 *
 * @param filtros Objeto con los filtros del formulario
 * @returns Instancia de HttpParams lista para enviar en HttpClient
 */
export function buildHttpParams(filtros: any): HttpParams {
  let params = new HttpParams();

  if (!filtros) return params;

  Object.keys(filtros).forEach((key) => {
    const value = filtros[key];

    // Ignorar nulos, undefined y cadenas vacías
    if (value === null || value === undefined || value === '') {
      return;
    }

    // Tratamiento especial para el filtro de 'activo' o selectores booleanos tipo '0', '1', '2'
    if (key === 'activo') {
      if (value === '1' || value === true) {
        params = params.set(key, 'true');
      } else if (value === '0' || value === false) {
        params = params.set(key, 'false');
      }
      // Si llega '2' u otro valor, no se adjunta para devolver "Todos"
      return;
    }

    // Para el resto de campos (textos, IDs, números), asignamos directamente
    params = params.set(key, value.toString().trim());
  });

  return params;
}

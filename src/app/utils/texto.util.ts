/**
 * Trunca un texto a la longitud indicada, añadiendo "…" si se ha recortado.
 *
 * @param texto texto a truncar (admite `null`/`undefined`)
 * @param longitud longitud máxima antes de truncar (por defecto 150)
 * @returns el texto truncado, o cadena vacía si `texto` es `null`/`undefined`
 */
export function truncar(texto: string | null | undefined, longitud = 150): string {
  if (!texto) {
    return '';
  }

  return texto.length > longitud ? `${texto.slice(0, longitud)}…` : texto;
}

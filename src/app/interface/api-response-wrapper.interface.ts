export interface ApiResponseWrapper<T> {
  message: string;
  data: T;
  success: boolean;
  fieldErrors: any;
  /** Página actual (0-index). Solo presente en listados paginados. */
  paginaActual?: number;
  /** Tamaño de página solicitado. Solo presente en listados paginados. */
  tamanoPagina?: number;
  /** Número total de registros que cumplen el filtro. Solo presente en listados paginados. */
  totalRegistros?: number;
  /** Número total de páginas disponibles. Solo presente en listados paginados. */
  totalPaginas?: number;
}

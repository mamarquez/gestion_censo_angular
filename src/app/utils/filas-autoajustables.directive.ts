import { Directive, ElementRef, HostListener, OnInit, inject, output } from '@angular/core';

/**
 * Calcula cuántas filas de una `p-table` caben en el espacio vertical disponible de la
 * ventana y las emite por `filasChange`, recalculando en cada resize.
 *
 * Uso: `<p-table appFilasAutoajustables (filasChange)="filasPorPagina = $event" [rows]="filasPorPagina" ...>`
 */
@Directive({
  standalone: true,
  selector: '[appFilasAutoajustables]'
})
export class FilasAutoajustablesDirective implements OnInit {

  private static readonly ALTURA_FILA_PX = 38;
  private static readonly ALTURA_RESERVADA_PX = 90; // cabecera de tabla + paginador
  private static readonly ANCHO_MOVIL_PX = 768;
  private static readonly FILAS_MINIMAS_ESCRITORIO = 5;
  private static readonly FILAS_MINIMAS_MOVIL = 5;

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  filasChange = output<number>();

  ngOnInit(): void {
    // La tabla aún no ha renderizado sus filas en este punto del ciclo de vida;
    // se difiere al siguiente tick para que getBoundingClientRect() sea fiable.
    setTimeout(() => this.calcularFilas());
  }

  @HostListener('window:resize')
  onResize(): void {
    this.calcularFilas();
  }

  private calcularFilas(): void {
    const top = this.elementRef.nativeElement.getBoundingClientRect().top;
    const esMovil = window.innerWidth <= FilasAutoajustablesDirective.ANCHO_MOVIL_PX;
    const filasMinimas = esMovil
      ? FilasAutoajustablesDirective.FILAS_MINIMAS_MOVIL
      : FilasAutoajustablesDirective.FILAS_MINIMAS_ESCRITORIO;

    const espacioDisponible = window.innerHeight - top - FilasAutoajustablesDirective.ALTURA_RESERVADA_PX;
    const filas = Math.floor(espacioDisponible / FilasAutoajustablesDirective.ALTURA_FILA_PX);

    this.filasChange.emit(Math.max(filas, filasMinimas));
  }
}

/**
 * Combina el número de filas calculado dinámicamente con el listado fijo de opciones
 * del selector "filas por página" de `p-table`, insertándolo si no coincide con ninguna.
 */
export function opcionesFilasPorPagina(filasActuales: number, opcionesFijas: number[] = [10, 20, 50, 100]): number[] {
  return opcionesFijas.includes(filasActuales)
    ? opcionesFijas
    : [filasActuales, ...opcionesFijas].sort((a, b) => a - b);
}

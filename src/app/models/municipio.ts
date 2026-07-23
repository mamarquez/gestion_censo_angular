export class Municipio {
  id!: number;
  cpro!: string;
  cmun!: string;
  dc!: string;
  nombre!: string;
  activo!: boolean;

  // Configuración de validaciones
  public static readonly campos = {
    cpro: { minLength: 3, maxLength: 3 },
    cmun: { minLength: 2, maxLength: 2 },
    dc: { minLength: 1, maxLength: 1 },
    nombre: { maxLength: 255 }
  };
}

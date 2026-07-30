export class TipoGestorPropiedad {
  id?: number;
  nombre!: string;
  mostrar?: string;
  activo!: boolean;

  // Configuración de validaciones
  public static readonly campos = {
    nombre: { maxLength: 255 },
    mostrar: { maxLength: 50 }
  };
}

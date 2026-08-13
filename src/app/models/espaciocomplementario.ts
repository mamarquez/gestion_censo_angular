export class EspacioComplementario {
  id!: number;
  nombre!: string;
  descripcion!: string;
  activo!: boolean;

  // Configuración de validaciones
  public static readonly campos = {
    id: { type: 'number' },
    nombre: { maxLength: 100 }
  };
}

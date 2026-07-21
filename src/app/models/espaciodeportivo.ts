export class EspacioDeportivo {
  id!: number;
  nombre!: string;
  valor!: string;
  activo!: boolean;

  // Configuración de validaciones
  public static readonly campos = {
    nombre: { maxLength: 100 },
    valor: { maxLength: 15 }
  };
}

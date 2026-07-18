export class Medida {
  id!: number;
  nombre!: string;
  valor!: string;
  activo!: boolean;

  // Configuración de validaciones
  static campos = {
    nombre: { maxLength: 100 },
    valor: { maxLength: 15 }
  };
}

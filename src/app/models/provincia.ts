export class Provincia {
  id!: number;
  nombre!: string;
  activo!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  // Configuración de validaciones
  static campos = {
    nombre: { maxLength: 75 }
  };
}

export class Municipio {
  id!: number;
  ine!: string;
  nombre!: string;
  activo!: boolean;

  // Configuración de validaciones
  static campos = {
    ine: { maxLength: 5 },
    nombre: { maxLength: 50 }
  };
}

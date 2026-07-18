export class Menu {
  id!: number;
  nombre!: string;
  description?: string;

  // Configuración de validaciones
  static campos = {
    nombre: { maxLength: 50 }
  };
}

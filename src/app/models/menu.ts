export class Menu {
    id!: number;
	nombre!: string;
	description?: string;
	created_at!: Date;
	updated_at? :Date;

  // Configuración de validaciones
  static campos = {
    nombre: { maxLength: 50 }
  };
}
export class Usuario {
    id!: number;
	usuario!: string;
	password!: string;
	nombre!: string;
	apellido1!: string;
	apellido2!: string;
	descripcion?: string;
	activo!: boolean;
	email!: string;
	created_at!: Date;
	deleted_at?: Date;
	updated_at?: Date;
	token?: string;
	ultimo_acceso?: Date;

  // Configuración de validaciones
  static campos = {
    nombre: { maxLength: 50 }
  };
}
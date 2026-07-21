import { Usuario } from './usuario';

export class Auditoria {
  id!: number;
  tabla!: string;
  registroId!: number;
  operacion!: string;
  usuario!: Usuario;
  fecha!: Date;
  valorAnterior!: JSON;
  valorNuevo!: JSON;

  // Configuración de validaciones
  public static readonly campos = {
    tabla: { maxLength: 50 },
    operacion: { maxLength: 10 }
  };
}

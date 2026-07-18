export class Auditoria {
  id!: number;
  tabla!: string;
  registro_Id!: number;
  operacion!: string;
  usuario_Id!: number;
  fecha!: Date;
  valor_anterior?: JSON;
  valor_nuevo!: JSON;

  // Configuración de validaciones
  static campos = {
    tabla: { maxLength: 50 },
    operacion: { maxLength: 10 }
  };
}

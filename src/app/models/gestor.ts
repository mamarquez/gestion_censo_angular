import {TipoGestorPropiedad} from './TipoGestorPropiedad';

export class Gestor {
  id!: number;
  tipoGestor?: TipoGestorPropiedad;
  nombre!: string;
  descripcion?: string;
  activo!: boolean;

  // Configuración de validaciones
  public static readonly campos = {
    nombre: { maxLength: 255 }
  };
}

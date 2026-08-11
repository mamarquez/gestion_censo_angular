import { Instalacion } from './instalacion';

export class InstalacionEspacioDeportivo {
  id?: number;
  instalacion!: Instalacion;
  nombre!: string;
  descripcion?: string;
  visible!: boolean;
  activo!: boolean;
}

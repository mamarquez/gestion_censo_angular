import { Instalacion } from './instalacion';

export class InstalacionRuta {
  id?: number;
  instalacion!: Instalacion;
  nombre!: string;
  descripcion?: string;
  visible!: boolean;
  activo!: boolean;
}

import { Instalacion } from './instalacion';

export class InstalacionTelefono {
  id?: number;
  id_instalacion!: Instalacion;
  numero!: string;
  contacto?: string;
  notas?: string;
  visible!: boolean;
}

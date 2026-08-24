export class InstalacionRuta {
  id?: number;
  idInstalacion!: number;
  nombre!: string;
  descripcion?: string;
  visible!: boolean;
  distanciaMetros?: number;
  desnivelPositivoMetros?: number;
  tiempoSenderismoMinutos?: number;
  tiempoRunningMinutos?: number;
  tiempoBttMinutos?: number;
  distanciaKm?: number;
  tiempoSenderismoFormateado?: string;
  tiempoRunningFormateado?: string;
  tiempoBttFormateado?: string;
}

import proj4 from 'proj4';

export interface GradosMinutosSegundos {
  grados: string;
  minutos: string;
  segundos: string;
}

export interface CoordenadaUtm {
  x: string;
  y: string;
  huso: string;
  banda: string;
}

const BANDAS_UTM = 'CDEFGHJKLMNPQRSTUVWX';

export function decimalAGms(decimal: number): GradosMinutosSegundos {
  const absoluto = Math.abs(decimal);
  const grados = Math.floor(absoluto);
  const minutosDecimales = (absoluto - grados) * 60;
  const minutos = Math.floor(minutosDecimales);
  const segundos = (minutosDecimales - minutos) * 60;

  return {
    grados: String(decimal < 0 ? -grados : grados),
    minutos: String(minutos),
    segundos: segundos.toFixed(2)
  };
}

export function husoUtm(longitud: number): number {
  return Math.floor((longitud + 180) / 6) + 1;
}

export function bandaUtm(latitud: number): string {
  if (latitud < -80 || latitud > 84) {
    return '';
  }

  const indice = Math.min(BANDAS_UTM.length - 1, Math.floor((latitud + 80) / 8));
  return BANDAS_UTM[indice];
}

export function latLngAUtm(latitud: number, longitud: number): CoordenadaUtm {
  const huso = husoUtm(longitud);
  const banda = bandaUtm(latitud);
  const hemisferio = latitud < 0 ? ' +south' : '';
  const proyeccion = `+proj=utm +zone=${huso}${hemisferio} +datum=WGS84 +units=m +no_defs`;

  const [x, y] = proj4('WGS84', proyeccion, [longitud, latitud]);

  return {
    x: x.toFixed(2),
    y: y.toFixed(2),
    huso: String(huso),
    banda
  };
}

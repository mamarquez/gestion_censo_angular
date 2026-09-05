import { bandaUtm, decimalAGms, husoUtm, latLngAUtm } from './coordenadas.util';

describe('coordenadas.util', () => {
  describe('decimalAGms', () => {
    it('convierte un decimal positivo a grados/minutos/segundos', () => {
      const resultado = decimalAGms(40.416775);

      expect(resultado.grados).toBe('40');
      expect(resultado.minutos).toBe('25');
      expect(Number(resultado.segundos)).toBeCloseTo(0.39, 1);
    });

    it('conserva el signo negativo en los grados para longitudes negativas', () => {
      const resultado = decimalAGms(-3.70379);

      expect(resultado.grados).toBe('-3');
      expect(Number(resultado.minutos)).toBeGreaterThanOrEqual(0);
    });

    it('devuelve grados=0 para un valor de 0', () => {
      const resultado = decimalAGms(0);

      expect(resultado.grados).toBe('0');
      expect(resultado.minutos).toBe('0');
    });
  });

  describe('husoUtm', () => {
    it('calcula el huso 30 para Madrid (~-3.7 longitud)', () => {
      expect(husoUtm(-3.70379)).toBe(30);
    });

    it('calcula el huso 1 para longitud -180', () => {
      expect(husoUtm(-180)).toBe(1);
    });

    it('calcula el huso 60 para longitud 179.9', () => {
      expect(husoUtm(179.9)).toBe(60);
    });
  });

  describe('bandaUtm', () => {
    it('calcula la banda T para Madrid (~40.4 latitud)', () => {
      expect(bandaUtm(40.416775)).toBe('T');
    });

    it('devuelve cadena vacía para latitudes fuera de rango UTM (< -80)', () => {
      expect(bandaUtm(-85)).toBe('');
    });

    it('devuelve cadena vacía para latitudes fuera de rango UTM (> 84)', () => {
      expect(bandaUtm(85)).toBe('');
    });
  });

  describe('latLngAUtm', () => {
    it('convierte Madrid a coordenadas UTM huso 30 banda T', () => {
      const resultado = latLngAUtm(40.416775, -3.70379);

      expect(resultado.huso).toBe('30');
      expect(resultado.banda).toBe('T');
      expect(Number(resultado.x)).toBeGreaterThan(0);
      expect(Number(resultado.y)).toBeGreaterThan(0);
    });

    it('usa el hemisferio sur para latitudes negativas', () => {
      const resultado = latLngAUtm(-33.45, -70.66);

      expect(Number(resultado.x)).toBeGreaterThan(0);
      expect(Number(resultado.y)).toBeGreaterThan(0);
    });
  });
});

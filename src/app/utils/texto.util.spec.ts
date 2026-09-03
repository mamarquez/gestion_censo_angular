import { truncar } from './texto.util';

describe('truncar', () => {
  it('devuelve el texto sin cambios si no supera la longitud máxima', () => {
    expect(truncar('Hola mundo', 150)).toBe('Hola mundo');
  });

  it('trunca el texto y añade "…" si supera la longitud máxima', () => {
    const texto = 'a'.repeat(200);
    const resultado = truncar(texto, 150);

    expect(resultado.length).toBe(151); // 150 caracteres + el "…"
    expect(resultado.endsWith('…')).toBeTrue();
    expect(resultado.startsWith('a'.repeat(150))).toBeTrue();
  });

  it('usa 150 como longitud por defecto cuando no se indica', () => {
    const texto = 'b'.repeat(151);
    expect(truncar(texto)).toBe(`${'b'.repeat(150)}…`);
  });

  it('no trunca un texto cuya longitud es exactamente el límite', () => {
    const texto = 'c'.repeat(150);
    expect(truncar(texto, 150)).toBe(texto);
  });

  it('devuelve cadena vacía si el texto es null', () => {
    expect(truncar(null)).toBe('');
  });

  it('devuelve cadena vacía si el texto es undefined', () => {
    expect(truncar(undefined)).toBe('');
  });

  it('devuelve cadena vacía si el texto es cadena vacía', () => {
    expect(truncar('')).toBe('');
  });
});

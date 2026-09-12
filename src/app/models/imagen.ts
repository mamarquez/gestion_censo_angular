export interface Imagen {
    id?: number;
    idInstalacion: number;
    nombre: string;
    descripcion?: string;
    /** Calculada en frontend a partir de `nombre` (ver ImagenComponent.cargar), no viene del backend. */
    imagenUrl?: string;
    visible: boolean;
    contenido?: string;
}
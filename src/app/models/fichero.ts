export interface Fichero {
    id?: number;
    idInstalacion: number;
    nombre: string;
    descripcion?: string;
    url?: string;
    visible: boolean;
    contenido?: string;
}
export interface Imagen {
    id?: number;
    idInstalacion: number;
    nombre: string;
    descripcion?: string;
    url?: string;
    visible: boolean;
    /** Contenido del archivo en Base64 (data URL), solo usado al crear una imagen nueva */
    contenido?: string;
}
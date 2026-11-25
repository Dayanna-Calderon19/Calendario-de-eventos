export interface Usuario {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface ActualizarPerfilRequest {
  nombres: string;
  apellidos: string;
}

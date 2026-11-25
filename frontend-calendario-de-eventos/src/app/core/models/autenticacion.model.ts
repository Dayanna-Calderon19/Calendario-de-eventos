import { Usuario } from './usuario.model';

export interface RegistroUsuarioRequest {
  nombres: string;
  apellidos: string;
  correo: string;
  contrasena: string;
  confirmacionContrasena: string;
}

export interface InicioSesionRequest {
  correo: string;
  contrasena: string;
}

export interface RecuperarContrasenaRequest {
  correo: string;
}

export interface RestablecerContrasenaRequest {
  token: string;
  nuevaContrasena: string;
  confirmacionContrasena: string;
}

export interface AutenticacionResponse {
  tokenAcceso: string;
  tipoToken: string;
  expiraEnMs: number;
  usuario: Usuario;
}

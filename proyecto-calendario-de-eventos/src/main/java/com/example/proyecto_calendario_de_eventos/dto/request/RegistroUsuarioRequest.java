package com.example.proyecto_calendario_de_eventos.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegistroUsuarioRequest(
		@NotBlank(message = "Los nombres son obligatorios.")
		@Size(min = 2, max = 100, message = "Los nombres deben tener entre 2 y 100 caracteres.")
		String nombres,

		@NotBlank(message = "Los apellidos son obligatorios.")
		@Size(min = 2, max = 100, message = "Los apellidos deben tener entre 2 y 100 caracteres.")
		String apellidos,

		@NotBlank(message = "El correo electrónico es obligatorio.")
		@Email(message = "El correo electrónico no tiene un formato válido.")
		@Size(max = 255, message = "El correo electrónico no debe superar los 255 caracteres.")
		String correo,

		@NotBlank(message = "La contraseña es obligatoria.")
		@Pattern(
				regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d]).{8,100}$",
				message = "La contraseña debe tener entre 8 y 100 caracteres e incluir mayúscula, minúscula, número y carácter especial."
		)
		String contrasena,

		@NotBlank(message = "La confirmación de contraseña es obligatoria.")
		String confirmacionContrasena
) {
}

package com.example.proyecto_calendario_de_eventos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RestablecerContrasenaRequest(
		@NotBlank(message = "El token de recuperación es obligatorio.")
		String token,

		@NotBlank(message = "La nueva contraseña es obligatoria.")
		@Pattern(
				regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d]).{8,100}$",
				message = "La contraseña debe tener entre 8 y 100 caracteres e incluir mayúscula, minúscula, número y carácter especial."
		)
		String nuevaContrasena,

		@NotBlank(message = "La confirmación de contraseña es obligatoria.")
		String confirmacionContrasena
) {
}

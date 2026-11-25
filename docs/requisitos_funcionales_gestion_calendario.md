# Requisitos funcionales del sistema de gestión de calendario

## 1. Objetivo y alcance

Aplicación web personal para administrar calendario, eventos, tareas, recordatorios y notificaciones. Cada usuario gestiona sus propios datos. La primera versión prioriza una experiencia de calendario clara, responsive y segura.

## 2. Actores

- **Usuario registrado:** administra su perfil, calendario, eventos, tareas, recordatorios y preferencias.
- **Sistema:** valida datos, calcula estados, genera notificaciones y ejecuta procesos programados.

## 3. Requisitos funcionales

### 3.1 Autenticación y usuarios

- [x] **RF-001** El sistema debe permitir registrar una cuenta con nombres, apellidos, correo electrónico y contraseña.
- [x] **RF-002** El sistema debe permitir iniciar sesión con correo y contraseña.
- [x] **RF-003** El sistema debe permitir cerrar sesión e invalidar o revocar la sesión según el mecanismo implementado.
- [x] **RF-004** El sistema debe permitir solicitar la recuperación de contraseña mediante correo electrónico.
- [x] **RF-005** El sistema debe permitir establecer una nueva contraseña mediante un mecanismo de recuperación válido y temporal.
- [x] **RF-006** El sistema debe permitir consultar los datos del perfil del usuario autenticado.
- [x] **RF-007** El sistema debe permitir actualizar los datos editables del perfil.
- [x] **RF-008** El sistema debe impedir el registro de dos cuentas con el mismo correo electrónico normalizado.
- [x] **RF-009** El sistema debe mantener protegidas las rutas y operaciones privadas para usuarios no autenticados.
- [x] **RF-010** El sistema debe mantener los datos de cada usuario aislados de los datos de otros usuarios.

### 3.2 Calendario interactivo

- [x] **RF-011** El sistema debe mostrar el calendario en vista mensual.
- [x] **RF-012** El sistema debe mostrar el calendario en vista semanal.
- [x] **RF-013** El sistema debe mostrar el calendario en vista diaria.
- [x] **RF-014** El sistema debe ofrecer una vista de agenda o listado cronológico.
- [x] **RF-015** El sistema debe permitir navegar al periodo anterior.
- [x] **RF-016** El sistema debe permitir navegar al periodo siguiente.
- [x] **RF-017** El sistema debe permitir regresar rápidamente a la fecha actual.
- [x] **RF-018** El sistema debe permitir seleccionar un día del calendario.
- [x] **RF-019** Al pasar el cursor sobre un evento, el sistema debe mostrar un tooltip con información resumida.
- [x] **RF-020** Al seleccionar un día, el sistema debe mostrar un panel lateral con los eventos y tareas de esa fecha.
- [x] **RF-021** El panel lateral debe permitir iniciar la creación de un evento para el día seleccionado.
- [x] **RF-022** Al seleccionar un evento, el sistema debe mostrar su información detallada.
- [x] **RF-023** El calendario debe distinguir visualmente los tipos de evento mediante colores o indicadores.
- [x] **RF-024** El calendario debe mostrar indicadores cuando un día tenga eventos o tareas.
- [x] **RF-025** El sistema debe permitir reprogramar eventos mediante arrastrar y soltar, si la vista lo admite.
- [x] **RF-026** El calendario debe actualizarse después de crear, editar, reprogramar o eliminar un elemento.
- [x] **RF-027** El calendario debe destacar visualmente el día actual.
- [x] **RF-028** El calendario debe representar correctamente los elementos de día completo y los intervalos horarios.

### 3.3 Gestión de eventos

- [x] **RF-029** El sistema debe permitir crear eventos desde el calendario.
- [x] **RF-030** El sistema debe permitir crear eventos mediante un formulario.
- [x] **RF-031** Cada evento debe tener un título.
- [x] **RF-032** Cada evento debe permitir registrar una descripción.
- [x] **RF-033** Cada evento debe tener un tipo válido, por ejemplo evento, cita o fecha importante.
- [x] **RF-034** Cada evento debe permitir definir fecha y hora de inicio.
- [x] **RF-035** Cada evento debe permitir definir fecha y hora de finalización.
- [x] **RF-036** El sistema debe permitir marcar un evento como de día completo.
- [x] **RF-037** El sistema debe permitir asignar un color al evento.
- [x] **RF-038** El sistema debe permitir registrar una ubicación opcional.
- [x] **RF-039** El sistema debe permitir editar un evento existente.
- [x] **RF-040** El sistema debe permitir eliminar un evento solicitando confirmación.
- [x] **RF-041** El sistema debe permitir consultar el detalle de un evento.
- [ ] **RF-042** El sistema debe permitir duplicar un evento, conservando sus datos pertinentes y permitiendo ajustar las fechas.
- [x] **RF-043** El sistema debe permitir asignar una categoría a un evento.
- [x] **RF-044** El sistema debe mostrar y permitir modificar únicamente eventos pertenecientes al usuario autenticado.

### 3.4 Gestión de tareas

- [x] **RF-045** El sistema debe permitir crear tareas.
- [x] **RF-046** El sistema debe permitir asignar una fecha límite a una tarea.
- [x] **RF-047** El sistema debe permitir asignar prioridad baja, media, alta o urgente.
- [x] **RF-048** El sistema debe permitir asignar estado pendiente, en progreso o completada.
- [x] **RF-049** El sistema debe permitir marcar una tarea como completada.
- [x] **RF-050** El sistema debe permitir cambiar el estado de una tarea.
- [x] **RF-051** El sistema debe identificar las tareas cuya fecha límite ya venció y que siguen sin completarse.
- [x] **RF-052** El sistema debe permitir consultar el detalle de una tarea.
- [x] **RF-053** El sistema debe permitir filtrar tareas por estado y prioridad.
- [x] **RF-054** El sistema debe mostrar el progreso de una tarea cuando se utilice un porcentaje de avance.

### 3.5 Recordatorios y notificaciones

- [x] **RF-055** El sistema debe permitir configurar recordatorios para eventos o tareas.
- [x] **RF-056** El sistema debe permitir elegir la anticipación del recordatorio.
- [x] **RF-057** El sistema debe permitir configurar más de un recordatorio para un elemento cuando corresponda.
- [x] **RF-058** El sistema debe generar notificaciones dentro de la aplicación cuando se active un recordatorio.
- [x] **RF-059** El sistema debe permitir consultar el historial de notificaciones.
- [x] **RF-060** El sistema debe permitir marcar una notificación como leída.
- [x] **RF-061** El sistema debe permitir eliminar notificaciones.
- [x] **RF-062** El sistema debe mostrar los próximos eventos y tareas relevantes.
- [x] **RF-063** El sistema debe destacar las tareas vencidas que continúen pendientes o en progreso.

### 3.6 Búsqueda y filtros

- [x] **RF-064** El sistema debe permitir buscar eventos y tareas por texto del título.
- [x] **RF-065** El sistema debe permitir buscar por contenido de la descripción cuando exista.
- [x] **RF-066** El sistema debe permitir filtrar por tipo de elemento.
- [x] **RF-067** El sistema debe permitir filtrar por categoría.
- [x] **RF-068** El sistema debe permitir filtrar por rango de fechas.
- [x] **RF-069** El sistema debe permitir filtrar tareas por prioridad y estado.
- [x] **RF-070** El sistema debe permitir combinar varios filtros en una misma búsqueda.

### 3.7 Panel y estadísticas

- [x] **RF-071** El sistema debe mostrar un resumen de los elementos programados para el día.
- [x] **RF-072** El sistema debe mostrar el número de eventos del mes seleccionado.
- [x] **RF-073** El sistema debe mostrar la cantidad de tareas pendientes.
- [x] **RF-074** El sistema debe mostrar la cantidad de tareas completadas.
- [x] **RF-075** El sistema debe mostrar la cantidad de tareas vencidas.
- [x] **RF-076** El sistema debe mostrar los próximos eventos.
- [x] **RF-077** El sistema debe calcular el porcentaje de tareas completadas para un periodo seleccionado.

### 3.8 Configuración del usuario

- [x] **RF-078** El sistema debe permitir configurar la zona horaria del usuario.
- [x] **RF-079** El sistema debe permitir elegir formato horario de 12 o 24 horas.
- [x] **RF-080** El sistema debe permitir configurar colores predeterminados o preferencias visuales.
- [x] **RF-081** El sistema debe permitir activar o desactivar las notificaciones de la aplicación.
- [x] **RF-082** El sistema debe permitir elegir el primer día de la semana.
- [x] **RF-083** El sistema debe permitir guardar la vista de calendario preferida.
- [x] **RF-084** El sistema debe permitir solicitar la eliminación de la cuenta y de los datos asociados, informando el alcance y solicitando confirmación.

## 4. Reglas de validación y negocio

### 4.1 Registro y autenticación

- [x] Los nombres y apellidos son obligatorios y admiten entre 2 y 100 caracteres.
- [x] El correo es obligatorio, tiene formato válido y se almacena normalizado.
- [x] El correo debe ser único sin distinguir mayúsculas y minúsculas.
- [x] La contraseña tiene al menos 8 caracteres e incluye mayúscula, minúscula, número y carácter especial.
- [x] La confirmación de contraseña debe coincidir.
- [x] La contraseña se almacena únicamente como hash seguro, nunca en texto plano.
- [x] Los intentos de inicio de sesión deben limitarse para reducir ataques de fuerza bruta.
- [x] La recuperación de contraseña no debe revelar si una dirección de correo está registrada.
- [x] Los tokens de recuperación deben ser temporales, de un solo uso y almacenarse de forma segura.

### 4.2 Eventos

- [x] El título es obligatorio y admite entre 3 y 150 caracteres.
- [x] La descripción es opcional y admite hasta 1000 caracteres.
- [x] El tipo debe pertenecer al catálogo permitido.
- [x] La fecha y hora de inicio son obligatorias, salvo que el modelo de día completo defina otra representación.
- [x] La fecha y hora de fin deben ser posteriores al inicio.
- [x] Los eventos de día completo no deben exigir horas introducidas por el usuario.
- [x] La ubicación es opcional y admite hasta 200 caracteres.
- [x] El color, si se introduce, debe cumplir el formato hexadecimal admitido.
- [x] El usuario solo puede consultar, modificar o eliminar sus propios eventos.
- [ ] Las superposiciones de eventos deben mostrarse como advertencia, no bloquearse por defecto.
- [x] La eliminación debe solicitar confirmación en la interfaz.

### 4.3 Tareas

- [x] El título de la tarea es obligatorio.
- [x] La prioridad solo admite los valores definidos.
- [x] El estado solo admite pendiente, en progreso o completada.
- [x] El progreso debe estar entre 0 y 100.
- [x] Una tarea completada debe tener progreso del 100%.
- [x] Una tarea nueva pendiente debe iniciar con progreso 0%.
- [x] Las tareas vencidas se determinan usando la fecha límite, la zona horaria aplicable y un estado distinto de completada.

### 4.4 Recordatorios

- [x] Todo recordatorio debe estar asociado a un evento o tarea existente y autorizado.
- [x] La fecha de activación debe ser válida.
- [x] Deben evitarse recordatorios duplicados para la misma configuración.
- [x] No deben enviarse recordatorios de elementos eliminados o cancelados.
- [x] Un recordatorio procesado no debe volver a ejecutarse accidentalmente.
- [x] Los cálculos deben respetar la zona horaria del usuario.

### 4.5 Seguridad y propiedad de datos

- [x] Todas las operaciones privadas requieren autenticación.
- [x] El backend obtiene el identificador del propietario desde el contexto de seguridad.
- [x] Las consultas y modificaciones comprueban la propiedad del recurso.
- [x] Las entradas se validan en backend aunque ya hayan sido validadas en frontend.
- [x] Las consultas a base de datos deben ser parametrizadas.
- [x] Los tokens deben verificarse por firma y expiración.
- [x] Las credenciales y secretos no se exponen al navegador ni al repositorio.

## 5. Requisitos no funcionales

- [x] **RNF-001 Usabilidad:** la interfaz debe ser clara y consistente.
- [x] **RNF-002 Responsive:** debe adaptarse a móviles, tabletas y escritorio.
- [ ] **RNF-003 Rendimiento:** las operaciones habituales deben responder en menos de 3 segundos bajo condiciones normales y carga prevista.
- [x] **RNF-004 Seguridad de contraseñas:** las contraseñas deben almacenarse mediante un algoritmo de hash adecuado, como BCrypt.
- [x] **RNF-005 Seguridad de sesión:** la autenticación debe usar tokens con expiración y renovación segura.
- [x] **RNF-006 Privacidad:** los datos de un usuario no deben ser accesibles por otros usuarios.
- [x] **RNF-007 Integridad:** las relaciones deben protegerse mediante restricciones y transacciones.
- [x] **RNF-008 Persistencia:** PostgreSQL será la base de datos relacional.
- [x] **RNF-009 Despliegue:** el entorno debe poder levantarse mediante Docker Compose.
- [x] **RNF-010 Mantenibilidad:** el código debe estar organizado por responsabilidades y funcionalidades.
- [x] **RNF-011 Errores:** la API debe devolver errores consistentes y comprensibles sin exponer detalles internos.
- [x] **RNF-012 Documentación:** la API debe documentarse mediante OpenAPI/Swagger.
- [ ] **RNF-013 Respaldo:** deben existir copias de seguridad y un procedimiento probado de restauración.
- [ ] **RNF-014 Concurrencia:** las operaciones concurrentes no deben corromper los datos.
- [ ] **RNF-015 Transporte seguro:** los entornos publicados deben utilizar HTTPS.
- [ ] **RNF-016 Compatibilidad:** la aplicación debe funcionar en versiones recientes de navegadores principales.
- [ ] **RNF-017 Accesibilidad:** formularios, navegación y controles deben poder utilizarse con teclado y lectores de pantalla.
- [x] **RNF-018 Registro:** los logs no deben contener contraseñas, tokens ni secretos.
- [x] **RNF-019 Fechas:** las fechas deben manejarse de forma coherente entre UTC y la zona horaria del usuario.
- [x] **RNF-020 Extensibilidad:** la arquitectura debe permitir incorporar nuevas funcionalidades sin reescribir los módulos existentes.

## 8. Fases sugeridas de entrega

### Fase 1: base funcional

- [x] Crear repositorio, estructura y configuración de entornos.
- [x] Configurar PostgreSQL, Docker y migraciones Flyway.
- [x] Implementar registro, inicio y cierre de sesión.
- [x] Implementar perfil de usuario.
- [x] Implementar CRUD de eventos.
- [x] Implementar vistas mensual, semanal y diaria.
- [x] Implementar tooltip y panel lateral del día.
- [x] Implementar pruebas de los flujos principales.

### Fase 2: productividad

- [x] Implementar CRUD de tareas.
- [x] Implementar prioridades y estados.
- [x] Implementar categorías.
- [x] Implementar recordatorios.
- [x] Implementar búsqueda y filtros.
- [x] Implementar reprogramación mediante arrastrar y soltar.
- [x] Implementar vista de agenda.

### Fase 3: seguimiento y preferencias

- [x] Implementar notificaciones dentro de la aplicación.
- [x] Implementar panel y estadísticas.
- [x] Implementar preferencias de usuario.
- [ ] Implementar papelera si forma parte del alcance.
- [ ] Implementar exportación si forma parte del alcance.

### Fase 4: calidad y entrega

- [x] Completar pruebas unitarias e integración.
- [x] Verificar autorización y aislamiento entre usuarios.
- [x] Revisar validaciones y manejo de errores.
- [x] Documentar endpoints con OpenAPI.
- [x] Verificar migraciones desde una base vacía.
- [x] Verificar despliegue con Docker Compose.
- [ ] Configurar HTTPS, secretos y backups para el entorno publicado.
- [ ] Ejecutar pruebas de aceptación.

## 9. Criterios generales de aceptación

- [x] Un usuario puede registrarse e iniciar sesión.
- [x] Un usuario no puede consultar ni modificar datos de otro.
- [x] Se pueden crear, consultar, editar y eliminar eventos.
- [x] Los eventos se muestran correctamente en las vistas del calendario.
- [x] El tooltip y el panel lateral muestran información coherente.
- [x] Se pueden crear y actualizar tareas.
- [x] Los recordatorios generan notificaciones según su configuración.
- [x] La búsqueda y los filtros devuelven resultados correctos.
- [x] El panel presenta estadísticas consistentes con los datos.
- [x] Las preferencias se conservan entre sesiones.
- [x] Las migraciones crean y actualizan la base de datos correctamente.
- [x] El proyecto se inicia desde el entorno documentado.
- [x] Las pruebas críticas pasan y no se registran secretos en logs.


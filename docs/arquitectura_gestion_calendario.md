# Arquitectura técnica del sistema de gestión de calendario

## 1. Objetivo

Definir una arquitectura mantenible, segura y escalable para una aplicación web personal de gestión de calendario, eventos, tareas y recordatorios.

## 2. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Angular, TypeScript, CSS |
| Calendario | FullCalendar para Angular |
| Iconografía | Lucide Angular |
| Backend | Java LTS, Spring Boot |
| Seguridad | Spring Security, JWT, BCrypt |
| Persistencia | Spring Data JPA, Hibernate |
| Base de datos | PostgreSQL |
| Migraciones | Flyway |
| Validación | Jakarta Validation |
| Documentación API | Springdoc OpenAPI |
| Pruebas backend | JUnit 5, Mockito |
| Contenedores | Docker, Docker Compose |
| Servidor frontend | Nginx |
| Control de versiones | Git |

Las versiones concretas deben elegirse como versiones estables compatibles entre sí al iniciar el proyecto y fijarse en los archivos de construcción. No se deben usar versiones dinámicas.

## 3. Estructura del repositorio

```text
calendario-de-eventos/
├── proyecto-calendario-de-eventos/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/proyecto_calendario_de_eventos/
│   │   │   │   ├── config/
│   │   │   │   ├── security/
│   │   │   │   ├── controller/
│   │   │   │   ├── dto/
│   │   │   │   │   ├── request/
│   │   │   │   │   └── response/
│   │   │   │   ├── entity/
│   │   │   │   ├── enums/
│   │   │   │   ├── exception/
│   │   │   │   ├── mapper/
│   │   │   │   ├── repository/
│   │   │   │   ├── service/
│   │   │   │   │   └── impl/
│   │   │   │   └── ProyectoCalendarioDeEventosApplication.java
│   │   │   └── resources/
│   │   │       ├── db/migration/
│   │   │       └── application.yml
│   │   └── test/java/com/example/proyecto_calendario_de_eventos/
│   ├── .dockerignore
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   └── pom.xml
├── frontend-calendario-de-eventos/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── models/
│   │   │   │   └── services/
│   │   │   ├── shared/
│   │   │   │   ├── components/
│   │   │   │   ├── directives/
│   │   │   │   ├── pipes/
│   │   │   │   └── utils/
│   │   │   ├── features/
│   │   │   │   ├── autenticacion/
│   │   │   │   ├── calendario/
│   │   │   │   ├── eventos/
│   │   │   │   ├── tareas/
│   │   │   │   ├── recordatorios/
│   │   │   │   ├── notificaciones/
│   │   │   │   ├── categorias/
│   │   │   │   ├── panel/
│   │   │   │   └── configuracion/
│   │   │   ├── layouts/
│   │   │   └── app.config.ts
│   │   ├── environments/
│   │   └── styles/
│   ├── public/
│   ├── .dockerignore
│   ├── .gitignore
│   ├── angular.json
│   ├── package.json
│   ├── nginx.conf
│   └── Dockerfile
├── docs/
│   ├── arquitectura_gestion_calendario.md
│   ├── despliegue_docker.md
│   └── requisitos_funcionales_gestion_calendario.md
├── compose.yaml
└── .gitignore
```

Reemplazar `com.tuempresa.calendario` por el paquete real de la organización. Mantener nombres de carpetas y módulos coherentes durante todo el proyecto.

## 4. Convenciones de nomenclatura

### 4.1 Reglas generales

- Usar español para nombres de dominio, atributos, métodos, funciones, variables, DTO, entidades, rutas internas y mensajes de validación.
- Conservar en inglés los términos técnicos establecidos por los frameworks y convenciones obligatorias: `controller`, `service`, `repository`, `request`, `response`, `config`, `security`, `guard`, `interceptor`, `component`, `interface`, `enum`, `extends`, `implements`, `override`, `constructor`, `OnInit`, entre otros.
- No traducir nombres requeridos por Angular, Java, Spring, TypeScript, HTML, CSS, SQL ni bibliotecas externas.
- Evitar abreviaturas ambiguas. Preferir `fechaInicio` sobre `fecIni`.
- Usar nombres que expresen intención y evitar nombres genéricos como `data`, `obj`, `aux` o `temp`.
- No duplicar información en el nombre: `obtenerEvento` es preferible a `obtenerEventoPorIdEvento`.
- No incluir comentarios en el código fuente. La documentación técnica vive en archivos Markdown, OpenAPI y nombres expresivos.

### 4.2 Java y Spring Boot

| Elemento | Convención | Ejemplo |
|---|---|---|
| Paquetes | minúsculas | `evento`, `recordatorio` |
| Clases | PascalCase | `EventoService` |
| Interfaces | PascalCase | `EventoRepository` |
| Métodos | camelCase en español | `buscarEventosDelUsuario` |
| Atributos | camelCase en español | `fechaInicio` |
| Constantes | MAYUSCULAS_CON_GUION_BAJO | `MAXIMO_TITULO` |
| Enumeraciones | PascalCase; valores MAYUSCULAS | `TipoEvento.CITA` |
| DTO | nombre del recurso + propósito | `CrearEventoRequest` |
| Tablas SQL | snake_case | `eventos` |
| Columnas SQL | snake_case | `fecha_inicio` |

Ejemplos de DTO:
- `RegistroUsuarioRequest`
- `InicioSesionRequest`
- `UsuarioResponse`
- `CrearEventoRequest`
- `ActualizarEventoRequest`
- `EventoResponse`
- `CrearTareaRequest`
- `CambiarEstadoTareaRequest`
- `CrearRecordatorioRequest`
- `NotificacionResponse`
- `ResumenCalendarioResponse`

Los DTO de entrada terminan en `Request`; los de salida en `Response`. No exponer entidades JPA directamente desde los controllers.

### 4.3 Angular y TypeScript

| Elemento | Convención | Ejemplo |
|---|---|---|
| Clases | PascalCase | `CalendarioService` |
| Componentes | nombre descriptivo | `PanelDiaComponent` |
| Servicios | sufijo `Service` | `EventoService` |
| Interfaces | PascalCase | `Evento` |
| Métodos y funciones | camelCase en español | `cargarEventos` |
| Variables y propiedades | camelCase en español | `fechaSeleccionada` |
| Constantes | MAYUSCULAS_CON_GUION_BAJO | `URL_API` |
| Archivos | kebab-case | `panel-dia.component.ts` |
| Selectores | prefijo del proyecto | `app-panel-dia` |

Ejemplos de nombres:
- `calendario-page.component.ts`
- `barra-calendario.component.ts`
- `panel-dia.component.ts`
- `formulario-evento.component.ts`
- `detalle-evento.component.ts`
- `evento.service.ts`
- `autenticacion.service.ts`
- `sesion.guard.ts`
- `autenticacion.interceptor.ts`

Usar `standalone components`, lazy loading por funcionalidad y formularios reactivos. Mantener componentes de presentación separados de los servicios de acceso a datos.

## 5. Arquitectura backend

### 5.1 Responsabilidad por capa

- `controller`: recibe HTTP, valida el contrato de entrada y delega al servicio. No contiene reglas de negocio.
- `dto/request`: define los datos que acepta la API.
- `dto/response`: define los datos que devuelve la API.
- `entity`: representa el modelo persistente JPA.
- `repository`: encapsula consultas y persistencia.
- `service`: define operaciones de negocio.
- `service/impl`: implementa reglas de negocio y transacciones.
- `mapper`: convierte entidades y DTO.
- `security`: configuración de Spring Security, JWT y usuario autenticado.
- `config`: configuración transversal.
- `exception`: excepciones de dominio y manejo uniforme de errores.
- `enums`: estados y tipos controlados.

Flujo habitual:

```text
HTTP request
  -> Controller
  -> Bean Validation
  -> Service
  -> Repository
  -> PostgreSQL
  -> Mapper
  -> Response DTO
  -> HTTP response
```

### 5.2 Dependencias Maven

Crear el proyecto desde Spring Initializr o configurar `pom.xml` con:

- Spring Web
- Spring Data JPA
- Spring Security
- Validation
- PostgreSQL Driver
- Flyway Migration y módulo de soporte PostgreSQL compatible con la versión elegida
- Spring Boot Actuator
- Springdoc OpenAPI
- Biblioteca JWT mantenida y compatible
- Lombok, solo si el equipo decide adoptarlo
- Spring Boot Starter Test
- Mockito, incluido mediante el starter de pruebas cuando corresponda

No agregar dependencias redundantes. Verificar compatibilidad de Flyway con PostgreSQL y la versión de Spring Boot antes de fijar versiones.

Comandos habituales:

```bash
cd backend
./mvnw clean verify
./mvnw spring-boot:run
```

En Windows:

```powershell
.\mvnw.cmd clean verify
.\mvnw.cmd spring-boot:run
```

### 5.3 Configuración de entorno backend

Crear `backend/.env.example`:

```dotenv
APP_PORT=8080
SPRING_PROFILES_ACTIVE=dev

DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestion_calendario
DB_USERNAME=calendario_app
DB_PASSWORD=cambiar_esta_clave

JWT_SECRET=generar_una_clave_aleatoria_larga
JWT_ACCESS_EXPIRATION_MS=900000
JWT_REFRESH_EXPIRATION_MS=604800000

CORS_ALLOWED_ORIGINS=http://localhost:4200
APP_TIME_ZONE=America/Lima
```

Crear `backend/.env` copiando el ejemplo y establecer valores locales propios. Nunca subir `.env` al repositorio. La clave JWT debe ser aleatoria, suficientemente larga y distinta por entorno.

Spring Boot no carga automáticamente cualquier archivo `.env`. Para desarrollo local, exportar las variables en la terminal, usar una configuración de ejecución del IDE o incorporar un mecanismo explícito y controlado. En Docker Compose, declarar `env_file` para el contenedor backend.

### 5.4 `application.yml`

```yaml
server:
  port: ${APP_PORT:8080}

spring:
  application:
    name: gestion-calendario
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:gestion_calendario}
    username: ${DB_USERNAME:calendario_app}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
    properties:
      hibernate:
        format_sql: false
  flyway:
    enabled: true
    locations: classpath:db/migration

app:
  zona-horaria: ${APP_TIME_ZONE:America/Lima}
  jwt:
    secreto: ${JWT_SECRET}
    expiracion-acceso-ms: ${JWT_ACCESS_EXPIRATION_MS:900000}
    expiracion-refresh-ms: ${JWT_REFRESH_EXPIRATION_MS:604800000}
  cors:
    origenes-permitidos: ${CORS_ALLOWED_ORIGINS:http://localhost:4200}
```

No registrar contraseñas, tokens ni datos personales en logs. En producción, exigir variables y secretos reales; no depender de valores por defecto inseguros.

### 5.5 Migraciones de base de datos

Flyway será la única vía para evolucionar el esquema. No usar `ddl-auto: update` ni crear tablas manualmente como mecanismo de despliegue. Hibernate debe validar el esquema.

Ubicación:

```text
src/main/resources/db/migration/
```

Nomenclatura:

```text
V1__crear_tabla_usuarios.sql
V2__crear_tabla_categorias.sql
V3__crear_tabla_eventos.sql
V4__crear_tabla_tareas.sql
V5__crear_tabla_recordatorios.sql
V6__crear_tabla_notificaciones.sql
V7__crear_tabla_configuraciones_usuario.sql
```

Reglas:
- Cada migración aplicada es inmutable.
- Para modificar el esquema, crear una nueva migración.
- Usar claves primarias, claves foráneas, restricciones `NOT NULL`, `UNIQUE` e índices según las consultas.
- Guardar fechas y horas con una estrategia coherente; preferir instantes UTC para eventos temporales y conservar la zona horaria del usuario cuando sea necesaria.
- Añadir índices para `usuario_id`, `fecha_inicio`, `fecha_fin`, `estado` y relaciones consultadas con frecuencia.
- Probar migraciones desde una base vacía y desde la versión anterior.
- No editar migraciones ya ejecutadas en entornos compartidos.

### 5.6 Modelo de datos inicial

Entidades recomendadas:

- `Usuario`: identidad, correo normalizado, contraseña cifrada, estado y fechas de auditoría.
- `Categoria`: nombre, color y propietario.
- `Evento`: propietario, título, descripción, tipo, fechas, zona horaria, ubicación, color, categoría y estado de eliminación.
- `Tarea`: relación con evento o entidad propia según el diseño elegido, prioridad, estado, fecha límite y progreso.
- `Recordatorio`: relación con evento o tarea, fecha de activación, canal y estado de procesamiento.
- `Notificacion`: propietario, contenido, fecha de creación y lectura.
- `ConfiguracionUsuario`: zona horaria, formato horario, primer día de semana y preferencias.
- `ReglaRecurrencia`: regla, fecha final y excepciones, si se incorpora recurrencia.

Usar UUID o identificadores numéricos de forma consistente. Todas las entidades propiedad del usuario deben tener `usuario_id` o una relación inequívoca con el propietario.

### 5.7 Seguridad y errores

- Autenticar mediante JWT y definir expiración de access token.
- Diseñar renovación de sesión con refresh token protegido y revocable.
- Cifrar contraseñas con BCrypt.
- Derivar el propietario desde el contexto autenticado; nunca confiar en un `usuarioId` enviado por el cliente.
- Comprobar propiedad del recurso en cada operación de lectura, modificación y eliminación.
- Aplicar CORS con orígenes explícitos.
- Validar DTO con Jakarta Validation.
- Usar consultas parametrizadas y métodos de repositorio.
- Centralizar errores mediante `@RestControllerAdvice`.
- Devolver errores consistentes sin filtrar trazas internas.
- Aplicar límites de intentos a autenticación y recuperación de contraseña.

## 6. API REST inicial

Prefijo: `/api`

| Método | Ruta | Propósito |
|---|---|---|
| POST | `/auth/registro` | Registrar usuario |
| POST | `/auth/iniciar-sesion` | Iniciar sesión |
| POST | `/auth/cerrar-sesion` | Revocar sesión |
| POST | `/auth/renovar` | Renovar tokens |
| POST | `/auth/recuperar-contrasena` | Solicitar recuperación |
| POST | `/auth/restablecer-contrasena` | Restablecer contraseña |
| GET | `/usuarios/perfil` | Consultar perfil |
| PUT | `/usuarios/perfil` | Actualizar perfil |
| GET | `/eventos` | Consultar eventos |
| GET | `/eventos/calendario` | Consultar eventos por rango |
| POST | `/eventos` | Crear evento |
| GET | `/eventos/{id}` | Consultar detalle |
| PUT | `/eventos/{id}` | Actualizar evento |
| DELETE | `/eventos/{id}` | Eliminar evento |
| PATCH | `/eventos/{id}/reprogramar` | Cambiar fechas |
| GET | `/tareas` | Consultar tareas |
| POST | `/tareas` | Crear tarea |
| PATCH | `/tareas/{id}/estado` | Cambiar estado |
| GET | `/categorias` | Consultar categorías |
| POST | `/categorias` | Crear categoría |
| GET | `/recordatorios` | Consultar recordatorios |
| POST | `/recordatorios` | Crear recordatorio |
| GET | `/notificaciones` | Consultar notificaciones |
| PATCH | `/notificaciones/{id}/leida` | Marcar como leída |
| GET | `/panel/resumen` | Obtener estadísticas |

Definir paginación, ordenamiento, filtros, códigos HTTP y esquemas OpenAPI. Para consultas del calendario, exigir un rango de fechas y limitar el volumen de respuesta.

## 7. Arquitectura frontend

### 7.1 Organización

- `core`: servicios singleton, guards, interceptors, modelos globales y configuración.
- `shared`: componentes, directivas, pipes y utilidades reutilizables sin lógica de negocio específica.
- `features`: módulos funcionales independientes con sus páginas, componentes, modelos y servicios específicos.
- `layouts`: estructuras visuales autenticada y pública.

Cada funcionalidad debe mantener sus elementos cerca de su dominio. Evitar un único componente gigante para el calendario.

### 7.2 Inicialización de Angular

Instalar una versión LTS/estable compatible de Node.js y npm. Crear el proyecto:

```bash
npm install -g @angular/cli
ng new frontend --routing --style=css --standalone
cd frontend
ng serve
```

Elegir CSS durante la inicialización si ese será el estándar del proyecto. Mantener el archivo de bloqueo `package-lock.json` en Git.

### 7.3 Dependencias frontend

Instalar únicamente las dependencias que se utilicen:

```bash
npm install @fullcalendar/angular @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
npm install lucide-angular
```

Para pruebas y calidad, conservar las herramientas que Angular incorpora y evaluar ESLint con configuración compatible con la versión del CLI. No instalar bibliotecas de estado global hasta que la complejidad lo justifique; comenzar con servicios y Signals/RxJS.

### 7.4 Variables de entorno frontend

Angular compila las variables para el navegador; por tanto, nunca incluir secretos, contraseñas, claves privadas ni secretos JWT en el frontend.

Crear `frontend/.env.example`:

```dotenv
API_URL=http://localhost:8080/api
```

Crear `frontend/.env` para el entorno local. Angular CLI no carga automáticamente `.env` como lo hacen algunos bundlers. Para mantener configuración segura y compatible, utilizar archivos de entorno de Angular o un archivo de configuración pública generado al iniciar/desplegar.

Ejemplo `src/environments/environment.development.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

Ejemplo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: '/api'
};
```

Si se requiere que `.env` sea la fuente única, agregar un paso explícito de generación de configuración antes de `ng serve` y `ng build`. No asumir que Angular interpreta `.env` por sí solo.

### 7.5 Estilos globales

Estructura sugerida:

```text
src/styles/
├── _variables.css
├── _reset.css
├── _typography.css
├── _utilities.css
├── _components.css
└── styles.css
```

Definir tokens CSS para colores, tipografía, espaciado, bordes, sombras y tamaños. Mantener estilos globales mínimos; cada componente debe encapsular sus estilos. Diseñar responsive desde móvil y asegurar foco visible, contraste y estados accesibles.

Ejemplo de variables:

```css
:root {
  --color-fondo: #f8fafc;
  --color-superficie: #ffffff;
  --color-texto: #172033;
  --color-texto-secundario: #64748b;
  --color-primario: #4f46e5;
  --color-borde: #e2e8f0;
  --radio-base: 0.75rem;
  --espaciado-base: 1rem;
  --sombra-panel: 0 8px 24px rgb(15 23 42 / 8%);
}
```

### 7.6 Componentes reutilizables

Componentes compartidos recomendados:

- `BotonComponent`: variantes primaria, secundaria, peligrosa y deshabilitada.
- `CampoTextoComponent`: etiqueta, ayuda, error y estado.
- `SelectorComponent`: opciones y validación.
- `ModalComponent`: diálogo accesible con cierre controlado.
- `ConfirmacionComponent`: confirmación de operaciones destructivas.
- `InsigniaEstadoComponent`: estados de evento y tarea.
- `SelectorColorComponent`: selección de color.
- `CargandoComponent`: indicador de carga.
- `EstadoVacioComponent`: mensaje cuando no hay resultados.
- `PaginacionComponent`: navegación de listados, si se necesita.
- `NotificacionToastComponent`: avisos de éxito y error.
- `EncabezadoPaginaComponent`: título y acciones de una página.

Componentes de dominio del calendario:

- `CalendarioPageComponent`
- `BarraCalendarioComponent`
- `VistaCalendarioComponent`
- `TooltipEventoComponent`
- `PanelDiaComponent`
- `FormularioEventoComponent`
- `DetalleEventoComponent`
- `SelectorTipoEventoComponent`

Los componentes reutilizables deben recibir datos mediante `input` y comunicar acciones mediante `output`. No deben acceder directamente a la API si su responsabilidad es únicamente visual.

### 7.7 Servicios, modelos y rutas

Servicios iniciales:
- `AutenticacionService`
- `UsuarioService`
- `EventoService`
- `TareaService`
- `RecordatorioService`
- `NotificacionService`
- `CategoriaService`
- `PanelService`

Modelos TypeScript:
- `Usuario`
- `Evento`
- `Tarea`
- `Recordatorio`
- `Notificacion`
- `Categoria`
- `ConfiguracionUsuario`
- DTO de request y response alineados con la API.

Rutas lazy:
- `/iniciar-sesion`
- `/registro`
- `/calendario`
- `/eventos`
- `/tareas`
- `/notificaciones`
- `/configuracion`

Proteger rutas privadas con guards. Usar un interceptor para adjuntar credenciales y gestionar respuestas de autenticación sin duplicar lógica en cada servicio.

### 7.8 Gestión de sesión

Preferir refresh token en cookie `HttpOnly`, `Secure` y `SameSite` cuando la arquitectura de despliegue lo permita, con protección CSRF adecuada. Evitar guardar refresh tokens en `localStorage`. Evaluar cuidadosamente el almacenamiento del access token y su exposición ante XSS. No registrar tokens en consola.

## 8. Gitignore

### 8.1 Raíz `.gitignore`

```gitignore
.env
.env.*
!.env.example
.DS_Store
Thumbs.db
.idea/
.vscode/
*.log
coverage/
dist/
```

### 8.2 `backend/.gitignore`

```gitignore
.env
.env.*
!.env.example
target/
*.class
*.jar
*.war
.idea/
.vscode/
*.log
```

### 8.3 `frontend/.gitignore`

```gitignore
.env
.env.*
!.env.example
node_modules/
dist/
.angular/
coverage/
*.log
.idea/
.vscode/
```

No ignorar `package-lock.json`, `pom.xml`, `mvnw`, `mvnw.cmd`, migraciones Flyway ni archivos de configuración no secretos.

## 9. Docker y despliegue local

Servicios previstos:
- `db`: PostgreSQL con volumen persistente.
- `backend`: Spring Boot, conectado a PostgreSQL.
- `frontend`: build Angular servido por Nginx.
- Red privada para comunicación entre contenedores.

Ejemplo base de `compose.yaml`:

```yaml
services:
  db:
    image: postgres:16
    restart: unless-stopped
    env_file:
      - ./proyecto-calendario-de-eventos/.env
    entrypoint:
      - /bin/sh
      - -c
      - |
        export POSTGRES_DB="$${DB_NAME:-gestion_calendario}"
        export POSTGRES_USER="$${DB_USERNAME:-calendario_app}"
        export POSTGRES_PASSWORD="$${DB_PASSWORD:-calendario_local_dev_2026}"
        exec docker-entrypoint.sh postgres
    volumes:
      - datos_postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \"$${DB_USERNAME:-calendario_app}\" -d \"$${DB_NAME:-gestion_calendario}\""]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - red_calendario

  backend:
    build: ./proyecto-calendario-de-eventos
    restart: unless-stopped
    env_file:
      - ./proyecto-calendario-de-eventos/.env
    environment:
      DB_HOST: db
    depends_on:
      db:
        condition: service_healthy
    networks:
      - red_calendario

  frontend:
    build: ./frontend-calendario-de-eventos
    restart: unless-stopped
    ports:
      - "4200:80"
    depends_on:
      - backend
    networks:
      - red_calendario

volumes:
  datos_postgres:

networks:
  red_calendario:
    driver: bridge
```

La configuración alinea las variables del Compose con `proyecto-calendario-de-eventos/.env` y define el proxy de Nginx en `frontend-calendario-de-eventos/nginx.conf` para `/api/`. Para la guía detallada de despliegue y verificación, consultar `docs/despliegue_docker.md`.

Comandos:

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f backend
docker compose down
```

No usar `docker compose down -v` salvo que se quiera eliminar deliberadamente el volumen de datos.

## 10. Calidad, pruebas y observabilidad

Backend:
- Pruebas unitarias de servicios con JUnit y Mockito.
- Pruebas de integración de repositorios y endpoints.
- Pruebas de seguridad y autorización por propietario.
- Pruebas de migraciones sobre PostgreSQL.
- Cobertura de validaciones y errores.

Frontend:
- Pruebas unitarias de componentes y servicios.
- Pruebas de formularios y validaciones.
- Pruebas de guards e interceptors.
- Pruebas de interacción del calendario.
- Pruebas end-to-end para flujos críticos.

Calidad transversal:
- Formato y lint automatizados.
- Logs estructurados sin secretos.
- Endpoint de salud.
- OpenAPI actualizado.
- Backups probados mediante restauración.
- Integración continua para compilar y ejecutar pruebas.

## 11. Reglas de diseño y rendimiento

- Paginar listados extensos.
- Consultar el calendario por rangos de fechas.
- Evitar N+1 en JPA y seleccionar solo los datos necesarios.
- Crear índices respaldados por consultas reales.
- Usar transacciones en operaciones que modifican varios registros.
- Mantener controladores delgados.
- No devolver entidades JPA.
- Evitar lógica de negocio en componentes Angular.
- Cargar funcionalidades bajo demanda.
- Evitar suscripciones RxJS sin liberar recursos; preferir mecanismos de ciclo de vida o Signals cuando corresponda.
- Validar fechas y zonas horarias tanto en cliente como en servidor.
- Aplicar borrado lógico cuando se necesite recuperación de datos.

## 12. Orden de implementación

1. Crear repositorio y estructura base.
2. Inicializar Spring Boot y Angular.
3. Configurar variables de entorno y `.gitignore`.
4. Configurar PostgreSQL y Docker Compose.
5. Integrar Flyway y crear migración inicial.
6. Implementar usuarios, autenticación y autorización.
7. Implementar entidades, DTO, mapper, repository y service.
8. Implementar API de eventos y calendario.
9. Implementar componentes compartidos y vistas Angular.
10. Implementar tareas, categorías y recordatorios.
11. Implementar notificaciones, panel y configuración.
12. Completar pruebas, OpenAPI, seguridad y despliegue.

## 13. Criterio de terminado

Una funcionalidad se considera terminada cuando su contrato está definido, la validación está implementada, se comprueba la autorización, existen pruebas relevantes, se integra con la interfaz y funciona en el entorno Docker previsto.

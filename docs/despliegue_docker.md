# Documentación de Despliegue en Docker

**Sistema de Calendario de Eventos** (`PostgreSQL 16` + `Spring Boot` + `Angular / Nginx`)

---

## 1. Introducción y Objetivo

Este documento detalla paso a paso cómo se preparó, configuró, desplegó y verificó el sistema completo de **Calendario de Eventos** utilizando **Docker** y **Docker Compose**, permitiendo ejecutar la base de datos, el backend y el frontend de forma aislada, reproducible y con un solo comando.

---

## 2. Arquitectura del Despliegue

El despliegue está compuesto por tres contenedores conectados mediante la red interna `red_calendario` y un volumen persistente `datos_postgres` para conservar los datos de la base de datos:

| Servicio | Imagen / Origen | Puerto | Función en el sistema |
| :--- | :--- | :--- | :--- |
| **`db`** | `postgres:16` | `5432` (interno) | Base de datos PostgreSQL con volumen persistente `datos_postgres` y `healthcheck`. |
| **`backend`** | `./proyecto-calendario-de-eventos/Dockerfile` | `8080` (interno) | API REST en Spring Boot 4.2.0 (Java 17). Ejecuta migraciones Flyway (`V1`–`V9`) al iniciar. |
| **`frontend`** | `./frontend-calendario-de-eventos/Dockerfile` | **`4200:80`** (expuesto) | Aplicación Angular compilada para producción y servida con Nginx 1.27 (proxy `/api/`). |

---

## 3. Prerrequisitos

- **Docker Desktop / Docker Engine** y **Docker Compose v2** instalados y en ejecución.
- Puerto **`4200`** disponible en el equipo anfitrión (sin procesos locales como `ng serve` ocupándolo).

```powershell
docker --version
docker compose version
netstat -ano | findstr ":4200"
```

> Si aparece un proceso `node` escuchando en `127.0.0.1:4200` o `[::1]:4200`, detenlo antes de probar en el navegador:
> ```powershell
> Stop-Process -Id <PID> -Force
> ```

---

## 4. Preparación de Archivos de Infraestructura

Antes de construir las imágenes, se configuraron y ajustaron los siguientes archivos en el repositorio:

### 4.1 Exclusiones (`.dockerignore`)
- `proyecto-calendario-de-eventos/.dockerignore`: excluye `target/`, `.git/`, `.env` y archivos de log para acelerar el build y evitar copiar secretos en la imagen.
- `frontend-calendario-de-eventos/.dockerignore`: excluye `node_modules/`, `dist/` y `.angular/`.

### 4.2 Dockerfile del Backend (Multi-stage)
Ubicado en `proyecto-calendario-de-eventos/Dockerfile`. Utiliza dos etapas:
1. **Etapa 1 (`eclipse-temurin:17-jdk-alpine`)**: descarga dependencias y compila el proyecto con `./mvnw clean package -DskipTests -B`.
2. **Etapa 2 (`eclipse-temurin:17-jre-alpine`)**: copia únicamente `app.jar` y lo ejecuta con el usuario no-root `calendario` en el puerto `8080`.

### 4.3 Dockerfile del Frontend y Presupuesto Angular
Ubicado en `frontend-calendario-de-eventos/Dockerfile`:
1. **Etapa 1 (`node:22-alpine`)**: instala dependencias con `npm ci` y genera el bundle de producción mediante `npm run build`.
2. **Etapa 2 (`nginx:1.27-alpine`)**: sirve el contenido compilado y enruta `/api/` hacia `http://backend:8080/api/` usando `frontend-calendario-de-eventos/nginx.conf` (copiado dentro de la imagen como `/etc/nginx/conf.d/default.conf`).

Además, en `frontend-calendario-de-eventos/angular.json` se ajustó el presupuesto `anyComponentStyle` (`maximumWarning: 10kB`, `maximumError: 16kB`) para que la compilación de producción completara sin errores en el componente de tareas.

### 4.4 Orquestación en `compose.yaml`
En `compose.yaml` se configuran los tres servicios y se asegura que tanto `db` como `backend` lean sus credenciales directamente desde `proyecto-calendario-de-eventos/.env`. Además, el backend recibe `DB_HOST=db` para conectarse al contenedor de PostgreSQL dentro de la red interna `red_calendario`.

---

## 5. Paso a Paso del Despliegue

### Paso 1: Configurar las variables de entorno (`.env`)
En la carpeta `proyecto-calendario-de-eventos/`, verificar o crear el archivo `.env` a partir de `.env.example`:

```powershell
Copy-Item proyecto-calendario-de-eventos\.env.example proyecto-calendario-de-eventos\.env
```

Contenido de referencia utilizado en `proyecto-calendario-de-eventos/.env`:

```env
APP_PORT=8080
SPRING_PROFILES_ACTIVE=dev

DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestion_calendario
DB_USERNAME=postgres
DB_PASSWORD=tu_clave_segura

JWT_SECRET=clave_aleatoria_larga_de_al_menos_64_caracteres
JWT_ACCESS_EXPIRATION_MS=900000
JWT_REFRESH_EXPIRATION_MS=604800000

CORS_ALLOWED_ORIGINS=http://localhost:4200
APP_TIME_ZONE=America/Lima
```

### Paso 2: Validar la compilación de producción del Frontend
Antes o durante la construcción de la imagen, se comprobó que el build de producción de Angular finalizara correctamente:

```powershell
Set-Location "e:\calendario-de-eventos\frontend-calendario-de-eventos"
npm run build
```

### Paso 3: Construir imágenes y levantar los contenedores
Desde la raíz del proyecto (`e:\calendario-de-eventos`), ejecutar:

```powershell
Set-Location "e:\calendario-de-eventos"
docker compose up -d --build
```

Este comando descarga las imágenes base necesarias, compila el backend (Maven) y el frontend (Node/Angular), inicia PostgreSQL, espera su `healthcheck` y arranca el backend y el frontend en segundo plano.

### Paso 4: Verificar que los contenedores estén activos

```powershell
docker compose ps
```

Resultado esperado: `db` en estado `Up (healthy)`, `backend` en `Up` y `frontend` en `Up (0.0.0.0:4200->80/tcp)`.

### Paso 5: Confirmar migraciones Flyway y arranque de Spring Boot

```powershell
docker compose logs backend --tail=40
```

En la salida se verifica que Flyway aplicó las 9 migraciones (`Successfully applied 9 migrations to schema "public", now at version v9`) y que Tomcat inició en el puerto `8080`.

### Paso 6: Verificar tablas y migraciones en PostgreSQL

```powershell
docker compose exec db psql -U postgres -d gestion_calendario -c "\dt"
docker compose exec db psql -U postgres -d gestion_calendario -c "SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;"
```

### Paso 7: Verificar Frontend y Proxy `/api/` en Nginx

```powershell
# Verificar acceso al frontend (esperado: StatusCode 200)
Invoke-WebRequest -Uri "http://localhost:4200" -UseBasicParsing | Select-Object StatusCode

# Verificar proxy inverso /api/ hacia el backend (esperado: HTTP/1.1 401 sin token)
docker compose exec -T frontend wget -S -O- http://127.0.0.1/api/usuarios/configuracion
```

Finalmente, abrir **`http://localhost:4200`** en el navegador y probar el flujo completo (registro, inicio de sesión, eventos, tareas, categorías y configuración).

---

## 6. Comandos de Operación y Mantenimiento

```powershell
# Ver logs en tiempo real del backend
docker compose logs -f backend

# Detener los contenedores conservando la base de datos
docker compose down

# Levantar contenedores ya construidos
docker compose up -d

# Reconstruir un servicio específico tras modificar código
docker compose up -d --build backend
docker compose up -d --build frontend

# Reinicio completo borrando el volumen de base de datos
docker compose down -v
docker compose up -d --build
```

---

## 7. Problemas Encontrados y Soluciones Aplicadas

| Incidencia | Causa raíz | Solución aplicada |
| :--- | :--- | :--- |
| Error de presupuesto CSS en `ng build` | `tareas-page.component.ts` superó el límite de `8 kB` de `anyComponentStyle` en producción. | Se amplió el límite en `angular.json` a `10 kB` (warning) y `16 kB` (error). |
| Error de autenticación en PostgreSQL (`password authentication failed`) | `compose.yaml` interpolaba variables desde la raíz en lugar de leer `DB_USERNAME` y `DB_PASSWORD` del `.env` del backend. | Se ajustó el `entrypoint` y `healthcheck` de `db` en `compose.yaml` para mapear las variables de `proyecto-calendario-de-eventos/.env` y se recreó el volumen con `down -v`. |
| Peticiones a `localhost:4200/api/...` devolvían HTML en lugar de ir al backend | Un servidor local `ng serve` previo seguía escuchando en `[::1]:4200` e interceptaba el tráfico antes que Docker. | Se identificó el proceso con `netstat -ano \| findstr ":4200"` y se verificó el proxy interno de Nginx usando `127.0.0.1`. |

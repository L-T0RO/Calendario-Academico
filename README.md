# Calendario Académico Universitario

Este proyecto es una aplicación web Full-Stack diseñada para la gestión e interacción dinámica del calendario académico de nuestra carrera universitaria. Permite a los estudiantes visualizar fechas de exámenes y previsualizar unidades evaluadas, mientras que los Profesores y el Director de Carrera pueden administrar la grilla mediante un panel de control autenticado.

## Integrantes del Equipo
* Lucas Rojas
* Maximo Martinez Moraes
* Tiago de Rosa Cajarabilla

## Tecnologías y Stack
* **Frontend:** HTML5, CSS3, JavaScript Vanilla.
* **Backend:** Node.js, Express.js.
* **Base de Datos:** MySQL / MariaDB.
* **Seguridad:** JWT (JSON Web Tokens) y bcryptjs.

---

## Requisitos Previos (Runtime y Servicios)
Para poder reconstruir el entorno de este proyecto, el equipo necesita tener instalado:
* **Node.js** (Se recomienda versión 18.x o superior)
* **MySQL** o **MariaDB** (Levantado localmente, ej: XAMPP, Workbench o Docker)
* **Git**

---

## Guía de Instalación y Reproducibilidad

Sigue estos pasos para ejecutar el proyecto desde cero en tu computadora.

### 1. Clonar el repositorio
```bash
git clone <https://github.com/L-T0RO/Calendario-Academico/tree/dev>
cd Calendario-Academico
```

### 2. Instalar dependencias
Instala los paquetes necesarios definidos en el `package.json` y `package-lock.json`.
```bash
npm install
```

### 3. Configuración de la Base de Datos
El proyecto requiere una base de datos relacional para funcionar correctamente.
1. Abre tu gestor de MySQL.
2. Ejecuta el script `database/schema.sql` para crear la base de datos `calendario_carrera` y todas sus tablas.
3. Ejecuta el script `database/seeds.sql` para poblar la base de datos con los roles, materias y usuarios de prueba.

### 4. Variables de Entorno (Configuración)
El proyecto utiliza variables de entorno para proteger credenciales.
1. Crea un archivo llamado `.env` en la raíz del proyecto.
2. Copia el contenido del archivo `.env.example` y pégalo en tu nuevo `.env`.
3. Completa los datos con las credenciales de tu conexión local a MySQL. Debería verse asi.

```env
PORT=3300
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=calendario_carrera
JWT_SECRET=
```

### 5. Ejecutar el Servidor
Una vez configurado todo, levanta la aplicación con:
```bash
npm start
```
Si todo está correcto, verás en la consola el mensaje: `Conexión exitosa a MySQL: calendario_carrera`. 
El servidor estará corriendo en `http://localhost:3300`.

---
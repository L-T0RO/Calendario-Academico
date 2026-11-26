# Calendario Académico Universitario

Aplicación web Full-Stack diseñada para la gestión e interacción dinámica del calendario académico de la carrera universitaria. Permite a los estudiantes visualizar fechas de exámenes y previsualizar unidades evaluadas, mientras que los Profesores y el Director de Carrera pueden administrar la grilla mediante un panel de control autenticado con control de acceso basado en roles.

## Integrantes del Equipo
- Lucas Rojas
- Maximo Martinez Moraes
- Tiago de Rosa Cajarabilla

## Tecnologías y Stack
- **Frontend:** HTML5, CSS3, JavaScript Vanilla.
- **Backend:** Node.js, Express.js.
- **Base de Datos:** MySQL / MariaDB.
- **Seguridad:** JWT (JSON Web Tokens) y bcryptjs.
- **Calidad y Testing:** ESLint (`eslint.config.mjs`) y suite de pruebas automatizadas (`test/`).

---

## Arquitectura y Estructura del Proyecto

El proyecto sigue una arquitectura cliente-servidor organizada en capas. A continuación se detalla el árbol de directorios y la responsabilidad de cada archivo del repositorio:

```text
Calendario-Academico/
├── database/
│   ├── schema.sql
│   └── seeds.sql
├── docs/
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── script.js
│   └── index.html
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   └── examController.js
│   ├── middlewares/
│   │   └── authMiddlewares.js
│   ├── routes/
│   │   └── api.js
│   └── app.js
├── test/
├── .env.example
├── .gitignore
├── diseno_y_patrones.md
├── eslint.config.mjs
├── package.json
├── package-lock.json
└── README.md
```

### Descripción de cada archivo

#### 1. Base de Datos (`database/`)

- **`database/schema.sql`**: Define la estructura relacional del sistema: creación de la base de datos `calendario_carrera`, tablas (usuarios, roles, materias, cuatrimestres, exámenes), claves primarias, claves foráneas y restricciones de integridad.

- **`database/seeds.sql`**: Contiene los registros iniciales necesarios para poblar y probar el sistema (roles de Director y Profesor, materias de la carrera y usuarios de prueba con contraseñas encriptadas).

#### 2. Frontend (`public/`)

- **`public/index.html`**: Estructura principal de la interfaz web (vista pública de la grilla de exámenes para estudiantes, modal de inicio de sesión y panel de administración para docentes y director).

- **`public/css/styles.css`**: Hojas de estilo que definen el diseño visual, la grilla del calendario, modales y la adaptabilidad de la interfaz.

- **`public/js/script.js`**: Lógica del cliente en JavaScript Vanilla. Consume los endpoints de la API mediante `fetch`, gestiona el token JWT en el navegador, renderiza dinámicamente las materias y exámenes según el rol del usuario y maneja los eventos del formulario de gestión.

#### 3. Backend (`src/`)

- **`src/app.js`**: Punto de entrada de la aplicación. Inicializa el servidor Express, configura los middlewares globales (parseo de JSON y servicio de archivos estáticos desde `public/`), monta las rutas de la API bajo `/api` y levanta la escucha en el puerto configurado.

- **`src/config/database.js`**: Configura y exporta el pool de conexiones hacia MySQL/MariaDB utilizando `mysql2` y las credenciales definidas en las variables de entorno.

- **`src/routes/api.js`**: Centraliza la definición de todos los endpoints REST del sistema (autenticación, consulta de cuatrimestres/exámenes y operaciones administrativas) y vincula cada ruta con sus middlewares de seguridad y controladores correspondientes.

- **`src/middlewares/authMiddlewares.js`**: Contiene los middlewares de seguridad encargados de interceptar las peticiones protegidas, verificar la validez y vigencia del token JWT (`verifyToken`) y comprobar que el usuario posea el rol autorizado (`checkRole`) antes de permitir el acceso al controlador.

- **`src/controllers/authController.js`**: Gestiona el inicio de sesión (`login`), validando las credenciales contra la base de datos con `bcryptjs` y generando el token JWT con la identidad y el rol del usuario.

- **`src/controllers/examController.js`**: Implementa la lógica de negocio para consultar las fechas de exámenes y materias disponibles (filtrando según los permisos del rol: materias asignadas para Profesores o vista completa para el Director) y administrar la información académica.

- **`src/controllers/adminController.js`**: Maneja las operaciones administrativas de gestión sobre la grilla y los recursos del sistema habilitados para el Director de Carrera y los Profesores.

#### 4. Calidad, Pruebas y Documentación

- **`test/`**: Carpeta que aloja las suites de pruebas automatizadas del proyecto, verificando casos normales, límites y de error sobre los comportamientos críticos del sistema.

- **`eslint.config.mjs`**: Archivo de configuración de ESLint con las reglas de análisis estático para mantener un estilo de código consistente y detectar errores tempranos en JavaScript.

- **`diseno_y_patrones.md`**: Documento técnico que explica las decisiones de arquitectura, diseño y patrones aplicados en el desarrollo del sistema.

- **`docs/`**: Carpeta destinada a la documentación técnica complementaria del proyecto.

- **`.env.example`**: Plantilla de referencia con las variables de entorno requeridas (puerto, conexión a MySQL y clave JWT) sin exponer credenciales reales.

- **`.gitignore`**: Especifica qué archivos y carpetas debe ignorar Git (como `node_modules/` y `.env`) para evitar subir dependencias pesadas o datos sensibles al repositorio.

- **`package.json` y `package-lock.json`**: Declaran los metadatos del proyecto, las dependencias instaladas, las versiones exactas del árbol de paquetes y los scripts ejecutables (`start`, `test`, etc.).

- **`README.md`**: Guía principal del repositorio con la descripción del proyecto, arquitectura, detalle de archivos, instrucciones de instalación y ejecución de pruebas.

---

## Requisitos Previos (Runtime y Servicios)
Para ejecutar y verificar este proyecto localmente se necesita:
- **Node.js** (versión 18.x o superior)
- **MySQL** o **MariaDB** (ejecutándose localmente mediante XAMPP, MySQL Workbench o Docker)
- **Git**

---

## Guía de Instalación y Reproducibilidad

### 1. Clonar el repositorio
```bash
git clone -b dev [https://github.com/L-T0RO/Calendario-Academico.git](https://github.com/L-T0RO/Calendario-Academico.git)
cd Calendario-Academico
```

### 2. Instalar dependencias
Instala los paquetes necesarios definidos en `package.json` y `package-lock.json`:
```bash
npm install
```

### 3. Configuración de la Base de Datos
1. Abre tu gestor de MySQL o terminal SQL.
2. Ejecuta el script `database/schema.sql` para crear la base de datos `calendario_carrera` y sus tablas.
3. Ejecuta el script `database/seeds.sql` para poblar la base de datos con los roles, materias y usuarios iniciales.

### 4. Variables de Entorno
1. Crea un archivo llamado `.env` en la raíz del proyecto (ignorado por Git mediante `.gitignore`).
2. Copia el contenido de `.env.example` dentro de `.env`.
3. Completa las credenciales de tu entorno local y una clave secreta para firmar los tokens JWT:

```env
PORT=3300
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=calendario_carrera
JWT_SECRET=tu_clave_secreta_jwt
```

### 5. Ejecutar el Servidor
Levanta la aplicación con:
```bash
npm start
```
Si la configuración es correcta, verás en consola `Conexión exitosa a MySQL: calendario_carrera` y la aplicación quedará disponible en `http://localhost:3300`.

---

## Pruebas Automatizadas (Testing)

El proyecto cuenta con pruebas automatizadas ubicadas en la carpeta `test/` para verificar comportamientos críticos del sistema sin depender exclusivamente de pruebas manuales.

### Ejecución de los tests
```bash
npm test
```

### Casos seleccionados y justificación
Las pruebas cubren tres categorías principales de validación:
1. **Casos normales (Flujo esperado):** Verificación de operaciones válidas del sistema, como la obtención de datos del calendario o la creación y validación de registros con parámetros completos y autorizados.
2. **Casos límite (Borde):** Validación de restricciones de negocio y fronteras de datos (por ejemplo, fechas límite o restricciones de acceso donde un Profesor solo puede operar sobre sus materias asignadas mientras el Director tiene visibilidad global).
3. **Casos de error (Manejo de fallos):** Comprobación de respuestas adecuadas ante entradas inválidas o accesos no autorizados (peticiones sin token JWT, tokens expirados/inválidos, roles sin permisos suficientes o campos obligatorios faltantes), garantizando códigos HTTP consistentes (`400`, `401`, `403`).

---

## Calidad de Código (Análisis Estático)

Para mantener un estándar uniforme, detectar errores sintácticos tempranos y evitar malas prácticas en JavaScript, se configuró **ESLint** mediante el archivo `eslint.config mjs`.

### Ejecución del linter
```bash
npx eslint .
```

### Mejoras aplicadas
- Estandarización de sintaxis y formato consistente en `src/`.
- Detección y eliminación de variables o importaciones sin utilizar en controladores y middlewares.
- Validación preventiva de errores comunes antes de integrar cambios al repositorio.
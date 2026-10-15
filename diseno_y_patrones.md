# Documentación de Diseño y Mantenibilidad - Taller II
---
### codigo analizado y patrones Creacionales que utilizamos

**Ubicación:** `src/controllers/examController.js`

**Módulos:** Clases `Usuario`, `Director`, `Profesor`, `UserFactory` y `ExamBuilder`.

### Diagnóstico
Encontramos dos problemas. Primero, hay un condicional que crece por cada rol nuevo (Director o Profesor) a la hora de buscar materias, lo que dificulta el mantenimiento. Segundo, crear un examen requiere armar un objeto con cinco campos de forma ordenada.

### Alternativas
*   **Selección de roles:** 
    *   Usar sentencias `if/else` en la función de ruteo.
    *   Implementar el patrón **Factory** para delegar la creación del objeto según el rol.
*   **Construcción del examen:** 
    *   Manejar un arreglo directo de parámetros.
    *   Utilizar el patrón **Builder** para estructurar la creación del objeto.

### Decisión
**Implementamos UserFactory y ExamBuilder**
El `UserFactory` nos sirve mucho porque centraliza la creación y evita que repitamos condicionales lógicos (los `if`). Al heredar de la clase `Usuario`, el controlador no necesita conocer las clases concretas.

Tambien utilizamosel patrón `ExamBuilder` para la creación de exámenes. Como la base de datos exige que los datos se envíen en un orden muy estricto (materia, fecha, título, unidades, creador), armar un arreglo manual corría el riesgo de que alguien intercambie el orden de los argumentos por accidente.

### Evidencia y trade-offs
*   **Evidencia:** Clases `UserFactory` y `ExamBuilder` se usan en `obtenerMateriasProfesor` y `crearExamen`.
*   **Beneficios:** El Factory permite escalar agregando nuevos roles en el futuro sin modificar la lógica central del controlador.
*   **Costos:** El Builder añade métodos y código innecesario, disminuyendo la simplicidad contextual.

### Por que no aplicamos ciertos patrones

*   **Strategy:** Este patrón encapsula distintas formas de realizar una misma operación. En nuestro sistema, no tenemos cálculos complejos con múltiples variantes (como calcular distintos tipos de envíos o impuestos). Si en el futuro agregamos distintos algoritmos de inicio de sesión (Google, GitHub, Email), recién ahí justificaremos su uso. Hoy, agregaría clases y contratos innecesarios.

*   **Observer:** Sirve para que varios objetos reaccionen cuando ocurre un evente Al crear un examen, nosotros simplemente lo guardamos en la base de datos y devolvemos un mensaje 201. No tenemos módulos independientes que necesiten reaccionar (como enviar un email automático y actualizar analíticas al mismo tiempo). Implementarlo haría más difícil seguir el flujo secuencial del código.

*   **Command:** Convierte una solicitud en un objeto para poder encolarla, registrarla o deshacerla. Nuestro sistema realiza operaciones CRUD inmediatas y no requiere colas de tareas diferidas ni funciones de "Deshacer/Rehacer" (*Undo/Redo*).

*   **Adapter:** Traduce una interfaz incompatible. No lo usamos porque todo nuestro sistema (Frontend, Backend y BD) fue diseñado por nosotros desde cero. No estamos integrando sistemas legados ni librerías de terceros con contratos que necesiten traducción.

*   **Facade:** Simplifica el acceso a un subsistema complejo. Nuestros controladores se comunican directamente con una base de datos mediante consultas simples; no tenemos un subsistema complejo con múltiples APIs o módulos internos que requieran ser coordinados por una fachada.

*   **Abstract Factory y Prototype:** No requerimos crear "familias" de objetos compatibles para distintas interfaces gráficas (Abstract Factory), ni necesitamos clonar configuraciones costosas ya existentes (Prototype).
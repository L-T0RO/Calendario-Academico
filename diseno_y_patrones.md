# Documentación de Diseño y Mantenibilidad - Taller II

---

### Código analizado y patrones creacionales utilizados

**Ubicación:** `src/controllers/examController.js`  
**Módulos:** Clases `Usuario`, `Director`, `Profesor`, `UserFactory` y `ExamBuilder`.

---

### Diagnóstico

Encontramos dos problemas principales:

1. **Escalabilidad de roles:** Existía un condicional que crecía de manera lineal por cada nuevo rol incorporado (por ejemplo, Director o Profesor) al momento de consultar las materias, lo cual dificultaba el mantenimiento y violaba el principio de abierto/cerrado (*Open/Closed Principle*).
2. **Construcción de objetos complejos:** La creación de un examen requiere la instanciación de un objeto con cinco campos obligatorios y un orden estricto.

---

### Alternativas evaluadas

- **Selección de roles:**
  - Utilizar sentencias `if/else` directas en la función de ruteo.
  - Implementar el patrón **Factory** para delegar la instanciación del objeto según el rol correspondiente.
- **Construcción del examen:**
  - Manejar un arreglo directo de parámetros posicionales.
  - Utilizar el patrón **Builder** para estructurar la creación paso a paso del objeto.

---

### Decisión de diseño

**Implementación de `UserFactory` y `ExamBuilder`**

- **`UserFactory`:** Permite centralizar la instanciación de usuarios y evitar la repetición de lógica condicional (`if/else`). Al heredar de la clase base `Usuario`, el controlador trabaja de forma polimórfica sin necesidad de conocer las implementaciones concretas.
- **`ExamBuilder`:** Se optó por este patrón debido a que la base de datos requiere los datos en un orden estricto (`materia`, `fecha`, `título`, `unidades`, `creador`). Construir un arreglo manual conllevaba el riesgo de intercambiar argumentos por accidente y generar errores silenciosos en tiempo de ejecución.

---

### Evidencia y balance (*Trade-offs*)

- **Evidencia:** Las clases `UserFactory` y `ExamBuilder` se integraron en los métodos `obtenerMateriasProfesor` y `crearExamen`.
- **Beneficios:** El uso de **Factory** facilita el escalado del sistema al permitir agregar nuevos roles sin modificar la lógica existente en el controlador.
- **Costos:** El patrón **Builder** introduce métodos adicionales y cierta sobrecarga de código, reduciendo levemente la simplicidad directa del archivo.

---

### Justificación de patrones no aplicados

- **Strategy:** Encapsula distintas variantes de un mismo algoritmo. En nuestro sistema no existen cálculos complejos ni múltiples algoritmos alternativos (como diferentes métodos de cálculo de impuestos o envíos). Si en el futuro se implementan diversos métodos de autenticación (Google, GitHub, Email), se reevaluará su incorporación; actualmente, agregaría interfaces y contratos innecesarios.
- **Observer:** Diseñado para responder a eventos distribuidos. Al crear un examen, únicamente se persiste el registro en la base de datos y se retorna un código HTTP 201. Al no existir subsistemas independientes que requieran reaccionar en paralelo (por ejemplo, envío de notificaciones automáticas o actualización de métricas), su implementación dificultaría el seguimiento secuencial del flujo de ejecución.
- **Command:** Transforma solicitudes en objetos para encolarlas, registrarlas o ejecutarlas de manera diferida. Nuestro sistema realiza operaciones CRUD de ejecución inmediata y no requiere colas de trabajo ni funcionalidades de deshacer/rehacer (*Undo/Redo*).
- **Adapter:** Adapta interfaces incompatibles. No se aplicó debido a que el ecosistema completo (Frontend, Backend y Base de Datos) fue diseñado desde cero, sin necesidad de integrar librerías de terceros o sistemas heredados (*legacy*) con contratos incompatibles.
- **Facade:** Proporciona una interfaz unificada para un subsistema complejo. Los controladores realizan operaciones directas sobre la base de datos mediante consultas simples, sin la presencia de múltiples módulos o servicios internos que requieran orquestación centralizada.
- **Abstract Factory y Prototype:** No requerimos crear familias de objetos vinculados para distintas plataformas o interfaces (Abstract Factory), ni clonar instancias cuya creación resulte computacionalmente costosa (Prototype).

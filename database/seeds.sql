-- ==========================================
-- 1. DATOS SEMILLA: ROLES Y CUATRIMESTRES
-- ==========================================

INSERT INTO roles (id, nombre) VALUES 
(1, 'director'), 
(2, 'profesor');

INSERT INTO cuatrimestres (id, numero) VALUES 
(1, 1), 
(2, 2), 
(3, 3), 
(4, 4);

-- ==========================================
-- 2. USUARIO INICIAL (Director Académico / Profesor)
-- ==========================================
-- Contraseña por defecto (hasheada con bcrypt): 'password123'
INSERT INTO usuarios (id, nombre, email, password) VALUES 
(1, 'Director Académico', 'director@utn.edu.ar', '$2b$10$t/Z5csGzR8B01gdSOIHf.irXWHmaD...');

-- Asignación de roles múltiples mediante la tabla pivote (Usuario 1 es Director y Profesor)
INSERT INTO usuario_rol (usuario_id, rol_id) VALUES 
(1, 1), 
(1, 2);

-- ==========================================
-- 3. MATERIAS (17 Asignaturas Totales)
-- ==========================================

-- Cuatrimestre 1 (4 materias)
INSERT INTO materias (id, nombre, cuatrimestre_id, profesor_id) VALUES 
(1, 'Matemática I', 1, NULL),
(2, 'Programación I', 1, NULL),
(3, 'Sistema de Computación', 1, NULL),
(4, 'Inglés I', 1, NULL);

-- Cuatrimestre 2 (4 materias)
INSERT INTO materias (id, nombre, cuatrimestre_id, profesor_id) VALUES 
(5, 'Matemática II', 2, NULL),
(6, 'Programación II', 2, NULL),
(7, 'Arquitectura y Sistemas Operativos', 2, NULL),
(8, 'Inglés II', 2, NULL);

-- Cuatrimestre 3 (4 materias)
INSERT INTO materias (id, nombre, cuatrimestre_id, profesor_id) VALUES 
(9, 'Estadística', 3, NULL),
(10, 'Programación III', 3, NULL),
(11, 'Base de Datos', 3, NULL),
(12, 'Metodología de la Investigación', 3, NULL);

-- Cuatrimestre 4 (5 materias)
INSERT INTO materias (id, nombre, cuatrimestre_id, profesor_id) VALUES 
(13, 'Legislación', 4, NULL),
(14, 'Laboratorio de Programación', 4, NULL),
(15, 'Ingeniería de Software', 4, NULL),
(16, 'Redes y Comunicaciones', 4, NULL),
(17, 'Proyecto Final', 4, NULL);
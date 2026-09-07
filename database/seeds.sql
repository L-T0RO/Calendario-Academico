USE calendario_carrera;

-- 1. Insertar Roles
INSERT INTO roles (id, nombre) VALUES 
(1, 'Director'),
(2, 'Profesor');

-- 2. Insertar Usuario Director inicial
-- Contraseña en texto plano: admin123 (hasheada con bcryptjs)
INSERT INTO usuarios (id, nombre, email, password, rol_id) VALUES 
(1, 'Director Académico', 'director@utn.edu.ar', '$2a$10$vQ3b2rT9K1d3z3E.L8uUdeA1R7/3w4JvJ7A3x.G4K3H2/L5F6n9qS', 1),
(2, 'Carlos Pérez', 'carlos.perez@utn.edu.ar', '$2a$10$vQ3b2rT9K1d3z3E.L8uUdeA1R7/3w4JvJ7A3x.G4K3H2/L5F6n9qS', 2);

-- 3. Insertar Cuatrimestres
INSERT INTO cuatrimestres (id, numero) VALUES 
(1, 1),
(2, 2),
(3, 3),
(4, 4);

-- 4. Insertar Materias iniciales (asignando el profesor_id 2 a la primera materia)
INSERT INTO materias (id, nombre, cuatrimestre_id, profesor_id) VALUES 
(1, 'Programación I', 1, 2),
(2, 'Base de Datos I', 1, NULL),
(3, 'Laboratorio de Computación I', 1, NULL);

-- 5. Insertar Exámenes iniciales de prueba
INSERT INTO examenes (id, materia_id, fecha, titulo, unidades_evaluadas) VALUES 
(1, 1, '2026-10-15', 'Parcial 1', 'Unidades 1, 2 y 3');
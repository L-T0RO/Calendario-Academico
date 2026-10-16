-- ==========================================
-- SCRIPT SQL DE INICIALIZACIÓN (schema.sql) - Versión V4
-- ==========================================
DROP DATABASE IF EXISTS calendario_carrera;
CREATE DATABASE calendario_carrera CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE calendario_carrera;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Tabla intermedia para soportar múltiples roles por usuario (Relación Muchos a Muchos)
CREATE TABLE usuario_rol (
    usuario_id INT NOT NULL,
    rol_id INT NOT NULL,
    PRIMARY KEY (usuario_id, rol_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE cuatrimestres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero INT NOT NULL UNIQUE
);

CREATE TABLE materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cuatrimestre_id INT NOT NULL,
    profesor_id INT DEFAULT NULL,
    FOREIGN KEY (cuatrimestre_id) REFERENCES cuatrimestres(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE examenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    materia_id INT NOT NULL,
    fecha DATE NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    unidades_evaluadas TEXT NOT NULL,
    creado_por INT NOT NULL,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE CASCADE
);
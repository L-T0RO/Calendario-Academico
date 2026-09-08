DROP DATABASE IF EXISTS calendario_carrera;
CREATE DATABASE calendario_carrera CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE calendario_carrera;

-- Tabla: roles
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla: usuarios (Administradores/Directores y Profesores)
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol_id INT NOT NULL,
  FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Tabla: cuatrimestres
CREATE TABLE cuatrimestres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero INT NOT NULL UNIQUE
);

-- Tabla: materias
CREATE TABLE materias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  cuatrimestre_id INT NOT NULL,
  profesor_id INT NULL,
  FOREIGN KEY (cuatrimestre_id) REFERENCES cuatrimestres(id) ON DELETE CASCADE,
  FOREIGN KEY (profesor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla: examenes
CREATE TABLE examenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  materia_id INT NOT NULL,
  fecha DATE NOT NULL,
  titulo VARCHAR(100) NOT NULL,
  unidades_evaluadas TEXT,
  FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
);
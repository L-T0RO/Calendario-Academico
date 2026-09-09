const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const examController = require('../controllers/examController');

const { verifyToken, checkRole } = require('../middlewares/authMiddlewares');

// 4.1. Autenticación (Público)
router.post('/auth/login', authController.login);

// 4.2. Consultas Públicas (Estudiantes y General)
router.get('/cuatrimestres', examController.obtenerCuatrimestres);
router.get('/examenes', examController.obtenerExamenes);

// 4.3. Endpoints del Profesor (Requiere Rol 'profesor' [2] o 'director' [1])
router.post('/examenes', verifyToken, checkRole(1, 2), examController.crearExamen);
router.put('/examenes/:id', verifyToken, checkRole(1, 2), examController.actualizarExamen);
router.delete('/examenes/:id', verifyToken, checkRole(1, 2), examController.eliminarExamen);

// 4.4. Endpoints del Director (Requiere Rol 'director' [1])
router.get('/profesores', verifyToken, checkRole(1), adminController.obtenerProfesores);
router.post('/profesores', verifyToken, checkRole(1), adminController.crearProfesor);
router.put('/profesores/:id', verifyToken, checkRole(1), adminController.actualizarProfesor);
router.delete('/profesores/:id', verifyToken, checkRole(1), adminController.eliminarProfesor);

// Asignar materia corregido a PUT según la especificación
router.put('/materias/:id/asignar', verifyToken, checkRole(1), adminController.asignarMateria);

// Resetear/cambiar contraseña de un profesor
router.put('/profesores/:id/password', verifyToken, checkRole(1), adminController.cambiarPasswordProfesor);

module.exports = router;
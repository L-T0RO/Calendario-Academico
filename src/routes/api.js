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

// 4.3. Endpoints del Profesor (Requiere Rol 'profesor' o 'director')
router.post('/examenes', verifyToken, checkRole('profesor', 'director'), examController.crearExamen);
router.put('/examenes/:id', verifyToken, checkRole('profesor', 'director'), examController.actualizarExamen);
router.delete('/examenes/:id', verifyToken, checkRole('profesor', 'director'), examController.eliminarExamen);
router.get('/profesor/materias', verifyToken, checkRole('profesor', 'director'), examController.obtenerMateriasProfesor);

// 4.4. Endpoints del Director (Requiere Rol 'director')
router.get('/profesores', verifyToken, checkRole('director'), adminController.obtenerProfesores);
router.post('/profesores', verifyToken, checkRole('director'), adminController.crearProfesor);
router.put('/profesores/:id', verifyToken, checkRole('director'), adminController.actualizarProfesor);
router.delete('/profesores/:id', verifyToken, checkRole('director'), adminController.eliminarProfesor);

// Ruta agregada para actualizar los roles de un profesor
router.put('/profesores/:id/roles', verifyToken, checkRole('director'), adminController.actualizarRolesProfesor);

// Asignar materia a un profesor
router.put('/materias/:id/asignar', verifyToken, checkRole('director'), adminController.asignarMateria);


// Resetear/cambiar contraseña de un profesor
router.put('/profesores/:id/password', verifyToken, checkRole('director'), adminController.cambiarPasswordProfesor);

module.exports = router;
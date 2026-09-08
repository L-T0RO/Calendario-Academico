const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const examController = require('../controllers/examController');

const { verifyToken, checkRole } = require('../middlewares/authMiddlewares');

router.post('/login', authController.login);

router.get('/examenes', verifyToken, examController.obtenerExamenes);

router.post('/examenes', verifyToken, checkRole(1, 2), examController.crearExamen);
router.put('/examenes/:id', verifyToken, checkRole(1, 2), examController.actualizarExamen);
router.delete('/examenes/:id', verifyToken, checkRole(1, 2), examController.eliminarExamen);


router.get('/profesores', verifyToken, checkRole(1), adminController.obtenerProfesores);
router.post('/profesores', verifyToken, checkRole(1), adminController.crearProfesor);
router.put('/profesores/:id', verifyToken, checkRole(1), adminController.actualizarProfesor);
router.delete('/profesores/:id', verifyToken, checkRole(1), adminController.eliminarProfesor);

router.post('/materias/:id/asignar', verifyToken, checkRole(1), adminController.asignarMateria);

module.exports = router;
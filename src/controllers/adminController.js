const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const obtenerProfesores = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, nombre, email FROM usuarios WHERE rol_id = 2');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearProfesor = async (req, res) => {
    const { nombre, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO usuarios (nombre, email, password, rol_id) VALUES (?, ?, ?, 2)', [nombre, email, hashedPassword]);
        res.status(201).json({ message: 'Profesor creado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarProfesor = async (req, res) => {
    const { id } = req.params;
    const { nombre, email } = req.body;
    try {
        await pool.query('UPDATE usuarios SET nombre = ?, email = ? WHERE id = ? AND rol_id = 2', [nombre, email, id]);
        res.json({ message: 'Datos de profesor actualizados' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarProfesor = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM usuarios WHERE id = ? AND rol_id = 2', [id]);
        res.json({ message: 'Profesor eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const asignarMateria = async (req, res) => {
    const { id } = req.params;
    const { profesor_id } = req.body;
    try {
        await pool.query('UPDATE materias SET profesor_id = ? WHERE id = ?', [profesor_id, id]);
        res.json({ message: 'Profesor asignado a la materia' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerProfesores, crearProfesor, actualizarProfesor, eliminarProfesor, asignarMateria };
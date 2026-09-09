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

    if (!nombre || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos (nombre, email, password) son obligatorios.' });
    }

    try {

        const [existeEmail] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existeEmail.length > 0) {
            return res.status(400).json({ message: 'El email ya está registrado.' });
        }

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

    if (!nombre || !email) {
        return res.status(400).json({ message: 'Los campos nombre y email son obligatorios.' });
    }

    try {
        const [resultado] = await pool.query('UPDATE usuarios SET nombre = ?, email = ? WHERE id = ? AND rol_id = 2', [nombre, email, id]);
        
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: 'Profesor no encontrado.' });
        }

        res.json({ message: 'Datos de profesor actualizados' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarProfesor = async (req, res) => {
    const { id } = req.params;
    try {
        const [resultado] = await pool.query('DELETE FROM usuarios WHERE id = ? AND rol_id = 2', [id]);
        
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: 'Profesor no encontrado.' });
        }

        res.json({ message: 'Profesor eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const asignarMateria = async (req, res) => {
    const { id } = req.params; 
    const { profesor_id } = req.body; 

    if (!profesor_id) {
        return res.status(400).json({ message: 'El campo profesor_id es obligatorio.' });
    }

    try {
        // 1. Validar que la materia exista
        const [materia] = await pool.query('SELECT id FROM materias WHERE id = ?', [id]);
        if (materia.length === 0) {
            return res.status(404).json({ message: 'La materia especificada no existe.' });
        }

        // 2. Validar que el profesor exista y tenga rol_id = 2 (Profesor)
        const [profesor] = await pool.query('SELECT id FROM usuarios WHERE id = ? AND rol_id = 2', [profesor_id]);
        if (profesor.length === 0) {
            return res.status(404).json({ message: 'El profesor especificado no existe o no tiene el rol correspondiente.' });
        }

        // 3. Asignar el profesor
        await pool.query('UPDATE materias SET profesor_id = ? WHERE id = ?', [profesor_id, id]);
        res.json({ message: 'Profesor asignado a la materia' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const cambiarPasswordProfesor = async (req, res) => {
    const { id } = req.params;
    const { nuevaPassword } = req.body;

    if (!nuevaPassword) {
        return res.status(400).json({ message: 'La nueva contraseña es obligatoria.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
        const [resultado] = await pool.query(
            'UPDATE usuarios SET password = ? WHERE id = ? AND rol_id = 2', 
            [hashedPassword, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: 'Profesor no encontrado.' });
        }

        res.json({ message: 'Contraseña del profesor actualizada exitosamente.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
module.exports = { 
    obtenerProfesores, 
    crearProfesor, 
    actualizarProfesor, 
    eliminarProfesor, 
    asignarMateria,
    cambiarPasswordProfesor 
};
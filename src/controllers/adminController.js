const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const obtenerProfesores = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT u.id, u.nombre, u.email 
            FROM usuarios u
            JOIN usuario_rol ur ON u.id = ur.usuario_id
            WHERE ur.rol_id = 2
        `);
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

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [existeEmail] = await connection.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existeEmail.length > 0) {
            await connection.release();
            return res.status(400).json({ message: 'El email ya está registrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [resultado] = await connection.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)', 
            [nombre, email, hashedPassword]
        );
        
        const nuevoUsuarioId = resultado.insertId;

        // Asignar el rol de profesor (rol_id = 2) en la tabla pivote
        await connection.query(
            'INSERT INTO usuario_rol (usuario_id, rol_id) VALUES (?, 2)', 
            [nuevoUsuarioId]
        );

        await connection.commit();
        connection.release();

        res.status(201).json({ message: 'Profesor creado exitosamente' });
    } catch (error) {
        await connection.rollback();
        connection.release();
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
        // Verificar que el usuario tenga el rol de profesor asignado
        const [esProfesor] = await pool.query(
            'SELECT usuario_id FROM usuario_rol WHERE usuario_id = ? AND rol_id = 2', 
            [id]
        );

        if (esProfesor.length === 0) {
            return res.status(404).json({ message: 'Profesor no encontrado.' });
        }

        const [resultado] = await pool.query(
            'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?', 
            [nombre, email, id]
        );
        
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
        // Verificar que el usuario tenga el rol de profesor
        const [esProfesor] = await pool.query(
            'SELECT usuario_id FROM usuario_rol WHERE usuario_id = ? AND rol_id = 2', 
            [id]
        );

        if (esProfesor.length === 0) {
            return res.status(404).json({ message: 'Profesor no encontrado.' });
        }

        // Si se elimina de la tabla usuarios, la relación en usuario_rol se elimina sola por ON DELETE CASCADE
        const [resultado] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
        
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

        // 2. Validar que el profesor exista y tenga el rol de profesor (rol_id = 2) en la tabla pivote
        const [profesor] = await pool.query(`
            SELECT u.id 
            FROM usuarios u
            JOIN usuario_rol ur ON u.id = ur.usuario_id
            WHERE u.id = ? AND ur.rol_id = 2
        `, [profesor_id]);

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
        // Verificar que el usuario tenga el rol de profesor
        const [esProfesor] = await pool.query(
            'SELECT usuario_id FROM usuario_rol WHERE usuario_id = ? AND rol_id = 2', 
            [id]
        );

        if (esProfesor.length === 0) {
            return res.status(404).json({ message: 'Profesor no encontrado.' });
        }

        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
        const [resultado] = await pool.query(
            'UPDATE usuarios SET password = ? WHERE id = ?', 
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

// NUEVA FUNCIÓN PARA ACTUALIZAR ROLES DE UN USUARIO/PROFESOR
const actualizarRolesProfesor = async (req, res) => {
    const { id } = req.params;
    const { roles } = req.body; // Espera un array, por ejemplo: [1, 2]

    if (!Array.isArray(roles)) {
        return res.status(400).json({ message: 'El campo roles debe ser un arreglo.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Verificar que el usuario exista
        const [usuario] = await connection.query('SELECT id FROM usuarios WHERE id = ?', [id]);
        if (usuario.length === 0) {
            await connection.release();
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // 2. Limpiar los roles actuales de la tabla pivote para este usuario
        await connection.query('DELETE FROM usuario_rol WHERE usuario_id = ?', [id]);

        // 3. Insertar los nuevos roles proporcionados
        if (roles.length > 0) {
            const values = roles.map(rolId => [id, rolId]);
            await connection.query('INSERT INTO usuario_rol (usuario_id, rol_id) VALUES ?', [values]);
        }

        await connection.commit();
        connection.release();

        res.json({ message: 'Roles actualizados exitosamente.' });
    } catch (error) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    obtenerProfesores, 
    crearProfesor, 
    actualizarProfesor, 
    eliminarProfesor, 
    asignarMateria,
    cambiarPasswordProfesor,
    actualizarRolesProfesor 
};
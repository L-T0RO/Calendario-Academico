const pool = require('../config/database');

const obtenerCuatrimestres = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.id AS cuatrimestre_id,
                c.numero AS cuatrimestre_numero,
                m.id AS materia_id,
                m.nombre AS materia_nombre,
                m.profesor_id
            FROM cuatrimestres c
            LEFT JOIN materias m ON c.id = m.cuatrimestre_id
            ORDER BY c.numero ASC, m.nombre ASC;
        `;
        const [rows] = await pool.query(query);

        const cuatrimestresMap = {};

        rows.forEach(row => {
            if (!cuatrimestresMap[row.cuatrimestre_id]) {
                cuatrimestresMap[row.cuatrimestre_id] = {
                    id: row.cuatrimestre_id,
                    numero: row.cuatrimestre_numero,
                    materias: []
                };
            }

            if (row.materia_id) {
                cuatrimestresMap[row.cuatrimestre_id].materias.push({
                    id: row.materia_id,
                    nombre: row.materia_nombre,
                    profesor_id: row.profesor_id
                });
            }
        });

        res.json(Object.values(cuatrimestresMap));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerExamenes = async (req, res) => {
    const { materia_id } = req.query;
    try {
        let query = `
            SELECT e.*, m.nombre AS materia_nombre, u.nombre AS creado_por_nombre 
            FROM examenes e
            JOIN materias m ON e.materia_id = m.id
            JOIN usuarios u ON e.creado_por = u.id
        `;
        let params = [];
        
        if (materia_id) {
            query += ' WHERE e.materia_id = ?';
            params.push(materia_id);
        }
        
        query += ' ORDER BY e.fecha ASC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearExamen = async (req, res) => {
    const { materia_id, fecha, titulo, unidades_evaluadas } = req.body;
    // El ID del usuario autenticado viene del middleware de autenticación (JWT)
    const creado_por = req.user ? req.user.id : null; 

    if (!materia_id || !fecha || !titulo || !unidades_evaluadas) {
        return res.status(400).json({ message: 'Todos los campos del examen son obligatorios.' });
    }

    try {
        await pool.query(
            'INSERT INTO examenes (materia_id, fecha, titulo, unidades_evaluadas, creado_por) VALUES (?, ?, ?, ?, ?)',
            [materia_id, fecha, titulo, unidades_evaluadas, creado_por]
        );
        res.status(201).json({ message: 'Examen creado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarExamen = async (req, res) => {
    const { id } = req.params;
    const { fecha, unidades_evaluadas } = req.body;

    if (!fecha || !unidades_evaluadas) {
        return res.status(400).json({ message: 'La fecha y las unidades evaluadas son obligatorias.' });
    }

    try {
        const [resultado] = await pool.query(
            'UPDATE examenes SET fecha = ?, unidades_evaluadas = ? WHERE id = ?',
            [fecha, unidades_evaluadas, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: 'Examen no encontrado.' });
        }

        res.json({ message: 'Examen actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarExamen = async (req, res) => {
    const { id } = req.params;
    try {
        const [resultado] = await pool.query('DELETE FROM examenes WHERE id = ?', [id]);
        
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: 'Examen no encontrado.' });
        }

        res.json({ message: 'Examen eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerMateriasProfesor = async (req, res) => {
    const usuarioId = req.user.id;

    try {
        // Consultamos los IDs de los roles que tiene este usuario en la tabla pivote
        const [rolesRows] = await pool.query(`
            SELECT rol_id FROM usuario_rol WHERE usuario_id = ?
        `, [usuarioId]);

        const idsRoles = rolesRows.map(r => r.rol_id);
        
        // Asumiendo según tu tabla que el rol_id 1 es Director y el rol_id 2 es Profesor
        const esDirector = idsRoles.includes(1); 

        let materias = [];

        if (esDirector) {
            // Si tiene el rol de Director (usuario 1), ve absolutamente todas las materias
            const [rows] = await pool.query('SELECT id, nombre, cuatrimestre_id, profesor_id FROM materias ORDER BY cuatrimestre_id ASC, nombre ASC');
            materias = rows;
        } else {
            // Si NO es director (usuario 2, que solo tiene rol 2), filtra estrictamente por su ID en profesor_id
            const [rows] = await pool.query(
                'SELECT id, nombre, cuatrimestre_id, profesor_id FROM materias WHERE profesor_id = ?', 
                [usuarioId]
            );
            materias = rows;
        }

        res.json(materias);
    } catch (error) {
        console.error("Error en obtenerMateriasProfesor:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    obtenerCuatrimestres, 
    obtenerExamenes, 
    crearExamen, 
    actualizarExamen, 
    eliminarExamen,
    obtenerMateriasProfesor 
};
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
        let query = 'SELECT * FROM examenes';
        let params = [];
        if (materia_id) {
            query += ' WHERE materia_id = ?';
            params.push(materia_id);
        }
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearExamen = async (req, res) => {
    const { materia_id, fecha, titulo, unidades_evaluadas } = req.body;
    try {
        await pool.query(
            'INSERT INTO examenes (materia_id, fecha, titulo, unidades_evaluadas) VALUES (?, ?, ?, ?)',
            [materia_id, fecha, titulo, unidades_evaluadas]
        );
        res.status(201).json({ message: 'Examen creado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarExamen = async (req, res) => {
    const { id } = req.params;
    const { fecha, unidades_evaluadas } = req.body;
    try {
        await pool.query(
            'UPDATE examenes SET fecha = ?, unidades_evaluadas = ? WHERE id = ?',
            [fecha, unidades_evaluadas, id]
        );
        res.json({ message: 'Examen actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarExamen = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM examenes WHERE id = ?', [id]);
        res.json({ message: 'Examen eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    obtenerCuatrimestres, 
    obtenerExamenes, 
    crearExamen, 
    actualizarExamen, 
    eliminarExamen 
};
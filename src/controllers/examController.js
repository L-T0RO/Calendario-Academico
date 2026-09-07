const pool = require('../config/database');

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

module.exports = { obtenerExamenes, crearExamen, actualizarExamen, eliminarExamen };
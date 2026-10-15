const pool = require('../config/database');

class Usuario {
    constructor(id, email, roles) {
        this.id = id;
        this.email = email;
        this.roles = roles;
    }

    async obtenerMaterias() {
        throw new Error("El método obtenerMaterias() debe ser implementado por la subclase.");
    }
}

// Director: ve la totalidad de las materias del plan de estudios
class Director extends Usuario {
    async obtenerMaterias() {
        const query = `
            SELECT id, nombre, cuatrimestre_id, profesor_id 
            FROM materias 
            ORDER BY cuatrimestre_id ASC, nombre ASC
        `;
        const [rows] = await pool.query(query);
        return rows;
    }
}

// Profesor: ve únicamente las materias donde figure como profesor_id
class Profesor extends Usuario {
    async obtenerMaterias() {
        const query = `
            SELECT id, nombre, cuatrimestre_id, profesor_id 
            FROM materias 
            WHERE profesor_id = ? 
            ORDER BY cuatrimestre_id ASC, nombre ASC
        `;
        const [rows] = await pool.query(query, [this.id]);
        return rows;
    }
}

// Factory: evalúa los roles del token JWT y genera la instancia adecuada
class UserFactory {
    static createUser(userData) {
        const { id, email, roles } = userData;

        if (Array.isArray(roles) && roles.includes('director')) {
            return new Director(id, email, roles);
        }

        if (Array.isArray(roles) && roles.includes('profesor')) {
            return new Profesor(id, email, roles);
        }

        throw new Error('Rol no reconocido para gestionar materias.');
    }
}

class ExamBuilder {
    constructor() {
        this.materia_id = null;
        this.fecha = null;
        this.titulo = null;
        this.unidades_evaluadas = null;
        this.creado_por = null;
    }

    setMateriaId(materia_id) {
        this.materia_id = materia_id;
        return this;
    }

    setFecha(fecha) {
        this.fecha = fecha;
        return this;
    }

    setTitulo(titulo) {
        this.titulo = titulo;
        return this;
    }

    setUnidadesEvaluadas(unidades) {
        this.unidades_evaluadas = unidades;
        return this;
    }

    setCreadoPor(usuarioId) {
        this.creado_por = usuarioId;
        return this;
    }

    build() {
        if (!this.materia_id || !this.fecha || !this.titulo || !this.unidades_evaluadas) {
            throw new Error('Todos los campos del examen son obligatorios.');
        }

        return [
            this.materia_id,
            this.fecha,
            this.titulo,
            this.unidades_evaluadas,
            this.creado_por
        ];
    }
}

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
    try {
        const { materia_id, fecha, titulo, unidades_evaluadas } = req.body;
        const creado_por = req.user ? req.user.id : null;

        const examenParams = new ExamBuilder()
            .setMateriaId(materia_id)
            .setFecha(fecha)
            .setTitulo(titulo)
            .setUnidadesEvaluadas(unidades_evaluadas)
            .setCreadoPor(creado_por)
            .build();

        await pool.query(
            'INSERT INTO examenes (materia_id, fecha, titulo, unidades_evaluadas, creado_por) VALUES (?, ?, ?, ?, ?)',
            examenParams
        );

        res.status(201).json({ message: 'Examen creado exitosamente' });
    } catch (error) {
        res.status(400).json({ message: error.message });
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
    try {
        const usuario = UserFactory.createUser(req.user);
        const materias = await usuario.obtenerMaterias();
        res.json(materias);
    } catch (error) {
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
const pool = require('../config/database');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'El email y la contraseña son obligatorios.' });
    }

    try {
        // 1. Buscar al usuario por su email
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = rows[0];

        // 2. Validar la contraseña encriptada con bcrypt
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // 3. Obtener todos los roles asociados al usuario desde la tabla pivote (usuario_rol)
        const [rolesRows] = await pool.query(`
            SELECT r.nombre 
            FROM roles r
            JOIN usuario_rol ur ON r.id = ur.rol_id
            WHERE ur.usuario_id = ?
        `, [user.id]);

        // Mapear los roles a un arreglo de strings (ej: ['director', 'profesor'])
        const roles = rolesRows.map(r => r.nombre);

        // 4. Generar el Token JWT incluyendo el arreglo de roles
        const token = jwt.sign(
            { id: user.id, email: user.email, roles: roles }, 
            process.env.JWT_SECRET, 
            { expiresIn: '4h' }
        );

        // 5. Responder con el token y los roles del usuario[cite: 13]
        res.json({ 
            token, 
            usuario: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                roles: roles
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { login };
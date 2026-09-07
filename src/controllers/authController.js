const pool = require('../config/database');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ message: 'Credenciales inválidas' });

        const user = rows[0];
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ message: 'Credenciales inválidas' });

        const token = jwt.sign({ id: user.id, rol_id: user.rol_id }, process.env.JWT_SECRET, { expiresIn: '4h' });
        res.json({ token, rol_id: user.rol_id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { login };
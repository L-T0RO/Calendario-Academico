const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

const checkRole = (...rolesPermitidosIds) => {
    return (req, res, next) => {
        if (!req.user || !req.user.rol_id) {
            return res.status(403).json({ message: 'No se pudo verificar el rol del usuario.' });
        }

        if (!rolesPermitidosIds.includes(req.user.rol_id)) {
            return res.status(403).json({ 
                message: 'Acceso denegado. No tienes los permisos necesarios para realizar esta acción.' 
            });
        }

        next(); 
    };
};

module.exports = {
    verifyToken,
    checkRole
};
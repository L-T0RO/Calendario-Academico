const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // decoded contiene { id, email, roles: [...] }
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

/**
 * Middleware para validar si el usuario autenticado posee al menos uno de los roles permitidos.
 * @param  {...string} rolesPermitidos - Nombres de los roles permitidos (ej: 'director', 'profesor')
 */
const checkRole = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles || !Array.isArray(req.user.roles)) {
            return res.status(403).json({ message: 'No se pudo verificar los roles del usuario.' });
        }

        // Comprobar si el usuario tiene al menos uno de los roles permitidos en su arreglo de roles
        const tienePermiso = req.user.roles.some(rol => rolesPermitidos.includes(rol));

        if (!tienePermiso) {
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
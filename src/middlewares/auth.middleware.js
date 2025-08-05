const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token =
        req.headers.authorization?.split(' ')[1] ||
        req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("JWT verification error:", err.message);
        res.status(401).json({ message: 'Invalid Token' });
    }
};

const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    };
};


module.exports = { authMiddleware, allowRoles };

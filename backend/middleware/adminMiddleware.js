const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // 1. Get Token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // 2. Check for Secret (Safety check for server config)
        if (!process.env.JWT_SECRET) {
            console.error('FATAL ERROR: JWT_SECRET is not defined.');
            return res.status(500).send('Server configuration error');
        }

        // 3. Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Add user from payload to request object

        // 4. Security Check: STRICTLY check for Admin Role
        // This block is critical for protecting admin routes
        if (req.user.role !== 'admin') {
            console.warn(`Unauthorized access attempt by user ${req.user.id} with role ${req.user.role}`);
            return res.status(403).json({ msg: 'Access denied. Admins only.' });
        }

        next(); // User is an admin, proceed to the route
    } catch (err) {
        console.error("Token Verification Error:", err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
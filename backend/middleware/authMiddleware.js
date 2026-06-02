const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // 1. Get Token
    const token = req.header('x-auth-token');

    // 2. Check if no token
    if (!token) {
        console.log("❌ Auth Middleware: No token provided.");
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 3. Verify Token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        
        // DEBUG LOG: Show who is trying to access
        console.log(`✅ Auth Success: User ID ${req.user.id}, Role: ${req.user.role}`);
        
        next();
    } catch (err) {
        console.error("❌ Auth Middleware Error: Token is not valid.", err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
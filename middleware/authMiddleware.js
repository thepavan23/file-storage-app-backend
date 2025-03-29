const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        console.log("Authorization Header:", authHeader); // Debugging

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Invalid token format" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // `decoded` should contain `{ id, email }`

        console.log("User authenticated:", req.user.email); // Debugging
        next();
    } catch (error) {
        console.error("Auth error:", error.message);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;

const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports.auth = function(req, res, next){
    try {
        const token = req.header("authToken");
        if (!token) return res.status(401).send("Access denied. No token provided");
        const decoded = jwt.verify(token, config.secretKey);
        req.user_id = decoded._id;
        next();
    }
    catch(err){
        return res.status(400).send("Invalid token");
    }
}
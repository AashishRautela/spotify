const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../utils/asyncHandler.js");
const User = require("../models/user.model.js");
require('dotenv').config();

module.exports.auth = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: No token provided",
        });
    }

    // Get token value
    const token = authHeader.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Fetch user & attach to request
    req.user = await User.findById(decoded._id).select("-password");

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid token",
        });
    }

    next();
});

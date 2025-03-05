const validator = require("validator");

module.exports.validateUser = (req, res) => {
    const { userName = "", email = "", fullName = "", password = "" } = req.body;

    // Helper function for length validation
    const isValidLength = (field, maxLength) => field?.length <= maxLength;

    // Check for required fields
    if (!userName || !email || !fullName || !password) {
        return res.status(400).json({
            success: false,
            message: "Request data missing",
        });
    }

    // Trim values for validation
    const trimmedUserName = userName.trim();
    const trimmedEmail = email.trim();
    const trimmedFullName = fullName.trim();

    // Validate userName
    if (!isValidLength(trimmedUserName, 15)) {
        return res.status(400).json({
            success: false,
            message: "Username cannot exceed 15 characters.",
        });
    }

    // Validate email
    if (!validator.isEmail(trimmedEmail)) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid email address.",
        });
    }
    if (!isValidLength(trimmedEmail, 50)) {
        return res.status(400).json({
            success: false,
            message: "Email cannot exceed 50 characters.",
        });
    }

    // Validate fullName
    if (!isValidLength(trimmedFullName, 30)) {
        return res.status(400).json({
            success: false,
            message: "Full name cannot exceed 30 characters.",
        });
    }
};

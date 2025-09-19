
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const logger = require("../util/logger");

const mySecretKey = "my-secret-key";

const userService = require("../service/user-service");
const { validateRegistration, validateLogin } = require("./util/user-validation");
const { authenticateToken } = require("../util/jwt");

router.post("/register", validateRegistration, async (req, res) => {
    try {
        const data = await userService.createUser(req.body);
        if(data){
            res.status(201).json("Registration successful.");
        }else{
            res.status(400).json("Registration failed.");
        }
    } catch (error) {
        logger.error("Registration error:", error);
        res.status(500).json("Internal server error during registration.");
    }
});

router.post("/login", validateLogin, async (req, res) => {
    const {username} = req.body;
    const user = req.user;
    
    const token = jwt.sign(
        {
            id: user.user_id,
            username,
            role: user.role
        },
        mySecretKey,
        {
            expiresIn: "15m"
        }
    );
    res.status(202).json({role: user.role, token: token});
})


router.get("/profile", async (req, res) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        // Decode JWT token to get user info
        const jwt = require("jsonwebtoken");
        const mySecretKey = "my-secret-key";
        
        let user;
        try {
            user = jwt.verify(token, mySecretKey);
        } catch (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        const user_id = user.id;
        const result = await userService.getUserById(user_id);
        
        if (result.message === "retrieved user") {
            const { password, ...userProfile } = result.user;
            res.status(200).json({
                message: "Profile retrieved successfully",
                user: userProfile
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        logger.error("Profile retrieval error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
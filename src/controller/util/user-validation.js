const userService = require("../../service/user-service");
const logger = require("../../util/logger");

//Registration Validation
async function validateRegistration(req, res, next){
    const {username, password, role} = req.body;
    
    if(!username || !password){
        return res.status(400).json("Username and password are required.");
    }
    
    try {
        //check if username already exists
        const existingUser = await userService.getUserByUsername(username);
        if(existingUser){
            return res.status(400).json("Username is already taken.");
        }
        
        next();
    } catch (error) {
        logger.error("Registration validation error:", error);
        res.status(500).json("Internal server error during registration validation.");
    }
}

//Login Validation
async function validateLogin(req, res, next){
    const {username, password} = req.body;

    if(!username || !password){
        return res.status(400).json("Username and password are required.");
    }

    try {
        const user = await userService.validateLogin(username, password);
        
        if(user && user.user_id){
            req.user = user;
            next();
        } else {
            res.status(400).json("Invalid Credentials.");
        }
    } catch (error) {
        logger.error("Login validation error:", error);
        res.status(500).json("Internal server error during login.");
    }
}

module.exports = {
    validateRegistration,
    validateLogin
}
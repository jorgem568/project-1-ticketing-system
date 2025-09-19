const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { logger } = require("../util/logger");
const userDao = require("../repository/user-dao");

//Create
async function createUser(user) {
  logger.info("Creating user", { user });
  //Validate user input
  if (!user.username || !user.password) {
    return { message: "failed to create user" };
  }

  try {
    const userToCreate = {
      user_id: crypto.randomUUID(),
      username: user.username,
      password: user.password,
      role: "Employee",
    };
    const result = await userDao.createUser(userToCreate);

    if (!result) {
      logger.warn("Failed to create user", { user });
      return { message: "failed to create user" };
    } else {
      logger.info("Successfully created user", {
        user_id: result.user_id,
        username: result.username,
      });
      return {
        message: "created user",
        user: result,
      };
    }
  } catch (error) {
    logger.error("Error creating user", {
      error: error.message,
      user,
    });
    throw error;
  }
}

//Read
async function getUserById(user_id) {
  logger.info("Retrieving User by ID", { user_id });

  try {
    const result = await userDao.getUserById(user_id);

    if (!result) {
      logger.warn("User not found", { user_id });
      return { message: "failed to retrieve user" };
    } else {
      logger.info("Successfully retrieved user", {
        user_id,
        username: result.username,
      });
      return { message: "retrieved user", user: result };
    }
  } catch (error) {
    logger.error("Error Retrieving User by ID", {
      error: error.message,
      user_id,
    });
    throw error;
  }
}

//Delete
async function deleteUserByUserId(user_id) {
  logger.info("Deleting User by ID", { user_id });

  try {
    const result = await userDao.deleteUserByUserId(user_id);

    if (!result) {
      logger.warn("User not found", { user_id });
      return { message: "failed to delete user" };
    } else {
      logger.info("Successfully deleted user", {
        user_id,
      });
      return { message: "deleted user", user_id: result };
    }
  } catch (error) {
    logger.error("Error Deleting User by ID", {
      error: error.message,
      user_id,
    });
    throw error;
  }
}

async function getUserByUsername(username) {
  const user = await userDao.getUserByUsername(username);
  if (user) {
    logger.info(`User found by username`, { username });
    return user;
  } else {
    logger.info(`User not found by username`, { username });
    return null;
  }
}

async function validateLogin(username, password) {
  const user = await  getUserByUsername(username);
  
  if (user && (await bcrypt.compare(password, user.password))) {
    logger.info(`User logged in successfully`);
    return user;
  } else {
    logger.info(`User credentials mismatch`);
    return { message: "invalid login" };
  }
}

module.exports = {
  createUser,
  getUserById,
  deleteUserByUserId,
  validateLogin,
  getUserByUsername,
};

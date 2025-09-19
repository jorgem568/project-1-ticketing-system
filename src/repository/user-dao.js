const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  QueryCommand,
  GetCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { logger } = require("../util/logger");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const client = new DynamoDBClient({ region: "us-east-2" });
const documentClient = DynamoDBDocumentClient.from(client);

const TableName = "users_table";

// CRUD
// Create Read Update Delete

// Create
async function createUser(user) { 
  //Validate user input
  if (!user.username || !user.password) {
    return null;
  }

  const saltRounds = 10;
  const password = await bcrypt.hash(user.password, saltRounds);  
  const userToCreate = {...user, user_id: crypto.randomUUID(), password: password}

  const command = new PutCommand({
    TableName,
    Item: userToCreate,
  });

  try {
    const data = await documentClient.send(command);
    logger.info(`PUT command to databse complete ${JSON.stringify(data)}`);
    return userToCreate;
  } catch (error) {
    logger.error(`Error creating user in DAO`, { error: error.message, user });
    return null;
  }
}

// Read
async function getUserById(user_id) {
  const command = new GetCommand({
    TableName,
    Key: { user_id },
    ConsistentRead: true,
  });

  try {
    const data = await documentClient.send(command);
    logger.info(`GET command to database complete ${JSON.stringify(data)}`);
    return data.Item;
  } catch (error) {
    logger.error(`Error retrieving user in DAO`, {
      error: error.message,
      user_id,
    });
    return null;
  }
}

async function getUserByUsername(username) {
  const command = new ScanCommand({
    TableName,
    FilterExpression: "username = :username",
    ExpressionAttributeValues: { ":username": username },
  });

  try {
    const data = await documentClient.send(command);
    logger.info(`SCAN command to database complete ${JSON.stringify(data)}`);
    if (data.Items.length === 0) {
      return null;
    }
    return data.Items[0];
  } catch (error) {
    logger.error(`Error retrieving user in DAO`, {
      error: error.message,
      username,
    });
    return null;
  }
}

// Delete
async function deleteUserByUserId(user_id) {  
  const command = new DeleteCommand({
    TableName,
    Key: { user_id },
  });

  try {
    const data = await documentClient.send(command);
    logger.info(`DELETE command to database complete ${JSON.stringify(data)}`);
    return user_id;
  } catch (error) {
    logger.error(`Error deleting user in DAO`, {
      error: error.message,
      user_id,
    });
    return null;
  }
}

async function deleteUserByUsername(username) {
  const user = await getUserByUsername(username);
  if (!user) {
    return null;
  }

  const command = new DeleteCommand({
    TableName,
    Key: { user_id: user.user_id },
  });

  try {
    const data = await documentClient.send(command);
    logger.info(`DELETE command to database complete ${JSON.stringify(data)}`);
    return username;
  } catch (error) {
    console.log(error.message);
    logger.error(`Error deleting user in DAO`, {
      error: error.message,
      username,
    });
    return null;
  }
}

module.exports = {
  createUser,
  getUserById,
  deleteUserByUserId,
  getUserByUsername,
  deleteUserByUsername,
};

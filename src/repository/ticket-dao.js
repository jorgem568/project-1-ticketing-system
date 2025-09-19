const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  ScanCommand,
  UpdateCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
const { logger } = require("../util/logger");
const crypto = require("crypto");

const client = new DynamoDBClient({ region: "us-east-2" });
const documentClient = DynamoDBDocumentClient.from(client);

const TableName = "tickets_table";

// Create
async function createTicket(ticket) {
  //Validate ticket input
  if (!ticket.description || !ticket.amount) {
    logger.error("Failed to create ticket missing fields", { ticket });
    return null;
  }

  const ticketToCreate = {...ticket, id: crypto.randomUUID()}
  const command = new PutCommand({
    TableName,
    Item: ticketToCreate
  });

  try {
    const data = await documentClient.send(command);
    logger.info(`PUT command to database ${JSON.stringify(data)}`);
    return ticketToCreate;
  } catch (error) {
    logger.error(`Error creating ticket in DAO`, {
      error: error.message,
      ticket: ticketToCreate,
    });
    return null;
  }
}

// Read
async function getTicketById(id) {
  const command = new GetCommand({
    TableName,
    Key: { id },
    ConsistentRead: true,
  });

  try {
    const data = await documentClient.send(command);
    logger.info(`GET command to database ${JSON.stringify(data)}`);
    return data.Item;
  } catch (error) {
    logger.error(`Error retrieving ticket in DAO`, {
      error: error.message,
      id,
    });
    return null;
  }
}

async function getTicketsByAuthor(author) {
  const command = new ScanCommand({
    TableName,
    FilterExpression: "#author = :author",
    ExpressionAttributeNames: { "#author": "author" },
    ExpressionAttributeValues: { ":author": author },
    ConsistentRead: true,
  });

  try {
    const data = await documentClient.send(command);
    logger.info(`SCAN command to database ${JSON.stringify(data)}`);
    return data.Items || [];
  } catch (error) {
    logger.error(`Error retrieving tickets in DAO`, {
      error: error.message,
      author,
    });
    return [];
  }
}

async function getTicketsByStatus(status) {
  const command = new ScanCommand({
    TableName,
    FilterExpression: "#status = :status",
    ExpressionAttributeNames: { "#status": "status" },
    ExpressionAttributeValues: { ":status": status },
    ConsistentRead: true,
  });

  try {
    const data = await documentClient.send(command);
    logger.info(`SCAN command to database ${JSON.stringify(data)}`);
    return data.Items || [];
  } catch (error) {
    logger.error(`Error retrieving tickets in DAO`, {
      error: error.message,
      status,
    });
    return [];
  }
}

//Update
async function updateTicket(id, ticket) {
  //Validate ticket input
  if (!id || !ticket) {
    logger.error("Failed to update ticket missing fields", { ticket });
    return null;
  }

  const updateExpressions = [];
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  for (const [key, value] of Object.entries(ticket)) {
    const placeholder = `#${key}`;
    updateExpressions.push(`${placeholder} = :${key}`);
    expressionAttributeValues[`:${key}`] = value;
    expressionAttributeNames[placeholder] = key;
  }
  const command = new UpdateCommand({
    TableName,
    Key: { id },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
    ReturnValues: "ALL_NEW",
    ConsistentRead: true,
  });

  try {
    const data = await documentClient.send(command);
    logger.info(`UPDATE command to database ${JSON.stringify(data)}`);
    return data.Attributes;
  } catch (error) {
    logger.error(`Error updating ticket in DAO`, {
      error: error.message,
      id,
    });
    return null;
  }
}

// Delete
async function deleteTicketById(id) {
  const command = new DeleteCommand({
    TableName,
    Key: { id },
  });

  try {
    const data = await documentClient.send(command);
    logger.info(`DELETE command to database ${JSON.stringify(data)}`);
    return id;
  } catch (error) {
    logger.error(`Error deleting ticket in DAO`, {
      error: error.message,
      id,
    });
    return null;
  }
}

module.exports = {
  createTicket,
  getTicketById,
  getTicketsByAuthor,
  deleteTicketById,
  getTicketsByStatus,
  updateTicket,
};

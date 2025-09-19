const ticketDAO = require("../repository/ticket-dao");
const { logger } = require("../util/logger");
const crypto = require("crypto");

//Create
async function createTicket(ticket) {
  //Validate ticket input
  if (!ticket.description || !ticket.amount) {
    logger.error("Failed to create ticket missing fields", { ticket });
    return null;
  }
  logger.info("Creating ticket", { ticket });
  try {
    const ticketToCreate = {
      author: ticket.author,
      description: ticket.description,
      type: ticket.type,
      amount: ticket.amount,
      status: ticket.status ? ticket.status : "Pending",
    };
    const result = await ticketDAO.createTicket(ticketToCreate);

    if (!result) {
      logger.error("Failed to create ticket");
      return { message: "failed to create ticket" };
    } else {
      logger.info("Ticket created", { ticket: result });
      return result;
    }
  } catch (error) {
    logger.error("Error creating ticket", { error: error.message });
    throw error;
  }
}

//Read
async function getTicketById(id) {
  logger.info("Retrieving ticket by ID", { id });
  try {
    const result = await ticketDAO.getTicketById(id);

    if (!result) {
      logger.error("Failed to retrieve ticket");
      return { message: "failed to retrieve ticket" };
    } else {
      logger.info("Ticket retrieved", { ticket: result });
      return result;
    }
  } catch (error) {
    logger.error("Error retrieving ticket by ID", { error: error.message });
    throw error;
  }
}

async function getTicketsByStatus(status) {
  logger.info("Retrieving tickets by status", { status });
  try {
    const result = await ticketDAO.getTicketsByStatus(status);
    if (!result) {
      logger.error("Failed to retrieve tickets by status");
      return { message: "failed to retrieve tickets by status" };
    } else {
      logger.info("Tickets retrieved by status", { tickets: result });
      return result;
    }
  } catch (error) {
    logger.error("Error retrieving tickets by status", {
      error: error.message,
    });
    throw error;
  }
}

async function getTicketsByAuthor(author) {
  logger.info("Retrieving tickets by author", { author });
  try {
    const result = await ticketDAO.getTicketsByAuthor(author);
    if (!result) {
      logger.error("Failed to retrieve tickets by author");
      return { message: "failed to retrieve tickets by author" };
    } else {
      logger.info("Tickets retrieved by author", { tickets: result });
      return result;
    }
  } catch (error) {
    logger.error("Error retrieving tickets by author", {
      error: error.message,
    });
    throw error;
  }
}

//Update
async function updateTicket(id, ticket) {
  //Validate ticket input
  if (!id || !ticket) {
    logger.error("Failed to update ticket missing fields", { ticket });
    return null;
  }
  logger.info("Updating ticket", { id, ticket });
  try {
    const existingTicket = await ticketDAO.getTicketById(id);
    if (!existingTicket) {
      logger.error("Ticket not found");
      return { message: "ticket not found" };
    }
    const result = await ticketDAO.updateTicket(id, ticket);
    if (!result) {
      logger.error("Failed to update ticket");
      return { message: "failed to update ticket" };
    } else {
      logger.info("Ticket updated", { ticket: result });
      return result;
    }
  } catch (error) {
    logger.error("Error updating ticket", { error: error.message });
    throw error;
  }
}

module.exports = {
  createTicket,
  getTicketById,
  getTicketsByStatus,
  getTicketsByAuthor,
  updateTicket,
};

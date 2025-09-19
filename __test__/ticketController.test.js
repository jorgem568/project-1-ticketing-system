// ticketController.test.js
const request = require("supertest");
const express = require("express");

// Mock the ticket service
jest.mock("../src/service/ticket-service", () => ({
    createTicket: jest.fn(),
    getTicketsByAuthor: jest.fn(),
    getTicketsByStatus: jest.fn(),
    updateTicket: jest.fn(),
}));

// Mock the middleware functions
jest.mock("../src/controller/util/ticket-validation", () => ({
    validateTicket: (req, res, next) => {
        const ticket = req.body;
        if (!ticket.amount) {
            return res
                .status(400)
                .json("Requests cannot be submitted without an amount.");
        }
        if (!ticket.description) {
            return res
                .status(400)
                .json("Requests cannot be submitted without a description.");
        }
        next();
    },
}));

jest.mock("../src/controller/util/ticket-authorization", () => ({
    authorizeTicketUpdate: (req, res, next) => next(),
    authorizeTicketView: (req, res, next) => next(),
}));

jest.mock("../src/util/jwt", () => ({
    authenticateToken: (req, res, next) => next(),
}));

// Import the router after mocks are set up
const router = require("../src/controller/ticket-controller");
const ticketService = require("../src/service/ticket-service");

const app = express();
app.use(express.json());
app.use("/tickets", router);

describe("Ticket Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /tickets", () => {
    it("should return 400 if amount is missing", async () => {
      //Act
      const res = await request(app)
        .post("/tickets")
        .set("current-user", "userID")
        .send({ description: "test ticket" });

      //Assert
      expect(res.status).toBe(400);
      expect(res.body).toBe("Requests cannot be submitted without an amount.");
    });

    it("should return 400 if description is missing", async () => {
      //Act
      const res = await request(app)
        .post("/tickets")
        .set("current-user", "userID")
        .send({ amount: 100 });

      //Assert
      expect(res.status).toBe(400);
      expect(res.body).toBe("Requests cannot be submitted without a description.");
    });

    it("should create a ticket when valid", async () => {
      //Arrange
      const ticket = { id: "123", amount: 100, description: "test ticket", author: "userID" };
      ticketService.createTicket.mockResolvedValue(ticket);

      //Act
      const res = await request(app)
        .post("/tickets")
        .set("current-user", "userID")
        .send({ amount: 100, description: "test ticket" });

      //Assert
      expect(res.status).toBe(201);
      expect(res.body).toEqual(ticket);
      expect(ticketService.createTicket).toHaveBeenCalledWith({
          amount: 100,
          description: "test ticket",
          author: "userID",
      });
    });
  });

  describe("GET /tickets", () => {
    it("should return tickets by author when author query is provided", async () => {
      //Arrange
      const tickets = [
        { id: "1", amount: 100, description: "test ticket 1", author: "userID" },
        { id: "2", amount: 200, description: "test ticket 2", author: "userID" }
      ];
      ticketService.getTicketsByAuthor.mockResolvedValue(tickets);

      //Act
      const res = await request(app)
        .get("/tickets?author=userID")
        .set("current-user", "userID");

      //Assert
      expect(res.status).toBe(200);
      expect(res.body).toEqual(tickets);
      expect(ticketService.getTicketsByAuthor).toHaveBeenCalledWith("userID");
    });

    it("should return tickets by status when status query is provided", async () => {
      //Arrange
      const tickets = [
        { id: "1", amount: 100, description: "test ticket 1", status: "Pending" },
        { id: "2", amount: 200, description: "test ticket 2", status: "Pending" }
      ];
      ticketService.getTicketsByStatus.mockResolvedValue(tickets);

      //Act
      const res = await request(app)
        .get("/tickets?status=Pending")
        .set("current-user", "userID");

      //Assert
      expect(res.status).toBe(200);
      expect(res.body).toEqual(tickets);
      expect(ticketService.getTicketsByStatus).toHaveBeenCalledWith("Pending");
    });

    it("should return 400 when no query parameters are provided", async () => {
      //Act
      const res = await request(app)
        .get("/tickets")
        .set("current-user", "userID");

      //Assert
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Please provide either 'status' or 'author' query parameter" });
    });
  });

  describe("PUT /tickets/:id", () => {
    it("should update a ticket when valid", async () => {
      //Arrange
      const updatedTicket = { id: "123", amount: 150, description: "updated ticket", status: "Approved", resolver: "userID" };
      ticketService.updateTicket.mockResolvedValue(updatedTicket);

      //Act
      const res = await request(app)
        .put("/tickets/123")
        .set("current-user", "userID")
        .send({ status: "Approved" });

      //Assert
      expect(res.status).toBe(202);
      expect(res.body).toEqual(updatedTicket);
      expect(ticketService.updateTicket).toHaveBeenCalledWith("123", {
        status: "Approved",
        resolver: "userID"
      });
    });
  });
});
const ticketService = require("../src/service/ticket-service");
const ticketDAO = require("../src/repository/ticket-dao");

describe("Ticket Service", () => {
  let globalInputs = [];
  beforeEach(async () => {
    //await for all to happen instead of one at a time
    globalInputs = await Promise.all([
      ticketDAO.createTicket({
        author: "tuser4",
        description: "test",
        type: "Travel",
        amount: 100,
        status: "test2Pending",
      }),
      ticketDAO.createTicket({
        author: "tuser4",
        description: "test2",
        type: "Travel",
        amount: 102,
        status: "test2Pending",
      }),
    ]);
  });
  afterEach(async () => {
    await Promise.all([
      ticketDAO.deleteTicketById(globalInputs[0].id),
      ticketDAO.deleteTicketById(globalInputs[1].id),
    ]);
  });

  it("should create a ticket", async () => {
    const input = {
      author: "tuser",
      description: "test",
      type: "Travel",
      amount: 100,
    };
    const expected = { ...input, id: expect.any(String), status: "Pending" };
    const ticket = await ticketService.createTicket(input);
    expect(ticket).toEqual(expected);

    //cleanup
    await ticketDAO.deleteTicketById(ticket.id);
  });
  it("should not create a ticket missing fields", async () => {
    //Arrange
    const input = {
      author: "tuser4",
      type: "Travel",
      amount: 102,
    };
    const expected = null;
    //Act
    const ticket = await ticketService.createTicket(input);

    //Assert
    expect(ticket).toEqual(expected);
  });

  it("should get a ticket", async () => {
    const expected = globalInputs[0];

    const ticket = await ticketService.getTicketById(globalInputs[0].id);

    expect(ticket).toEqual(expected);
  });
  it("should not get a ticket by id", async () => {
    //Arrange
    const expected = { message: "failed to retrieve ticket" };
    //Act
    const ticket = await ticketService.getTicketById(123);
    //Assert
    expect(ticket).toEqual(expected);
  });

  it("should get tickets by status", async () => {
    //Arrange
    const expected = globalInputs;

    //Act
    const tickets = await ticketService.getTicketsByStatus("test2Pending");
    
    //Assert
    expect(tickets).toEqual(expect.arrayContaining(expected));
  });

  it("should not get tickets by status", async () => {
    //Arrange
    const expected = [];

    //Act
    const tickets = await ticketService.getTicketsByStatus("FakeStatus");
    
    //Assert
    expect(tickets).toEqual(expected);
  });

  it("should get tickets by author", async () => {
    //Arrange
    const expected = globalInputs;
    const search = globalInputs[0].author;

    //Act
    const tickets = await ticketService.getTicketsByAuthor(search);

    //Assert
    expect(tickets).toEqual(expect.arrayContaining(expected));
  });

  it("should not get tickets by author", async () => {
    const expected = [];
    const search = "tuser2";

    const tickets = await ticketService.getTicketsByAuthor(search);
    
    expect(tickets).toEqual(expected);
  });

  it("should update a ticket", async () => {
    const expected = { ...globalInputs[0], status: "Approved" };

    const ticket = await ticketService.updateTicket(globalInputs[0].id, {
      status: "Approved",
    });

    expect(ticket).toEqual(expected);
  });

  it("should not update a  because ticket not found", async () => {
    //Arrange
    const expected = { message: "ticket not found" };
    //Act
    const ticket = await ticketService.updateTicket(123, {
      status: "Approved",
    });
    //Assert
    expect(ticket).toEqual(expected);
  });

  it("should not update a ticket missing a parameter", async () => {
    //Arrange
    const expected = null;
    //Act
    const ticket = await ticketService.updateTicket({
      status: "Approved",
    });
    //Assert
    expect(ticket).toEqual(expected);
  });
});

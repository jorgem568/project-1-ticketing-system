const ticketDAO = require("../src/repository/ticket-dao");

describe("Ticket DAO", () => {
  let globalInputs = [];
  beforeEach(async () => {
  const results = await Promise.allSettled([
    ticketDAO.createTicket({
      author: "321",
      description: "test",
      type: "Travel",
      amount: 100,
      status: "testPending",
    }),
    ticketDAO.createTicket({
      author: "321",
      description: "test2",
      type: "Travel",
      amount: 102,
      status: "testPending",
    }),
  ]);
  globalInputs = results.map(r => r.status === "fulfilled" ? r.value : null);
});

afterEach(async () => {
  await Promise.allSettled([
    globalInputs[0]?.id && ticketDAO.deleteTicketById(globalInputs[0].id),
    globalInputs[1]?.id && ticketDAO.deleteTicketById(globalInputs[1].id),
  ]);
});

  it("should create a ticket DAO", async () => {
    const input = {
      author: "1234",
      description: "test2",
      type: "Travel",
      amount: 102,
      status: "testPending",
    };
    const expected = { ...input, id: expect.any(String) };

    const ticket = await ticketDAO.createTicket(input);

    expect(ticket).toEqual(expected);

    //clean up task
    await ticketDAO.deleteTicketById(ticket.id);
  });
  it("should not create a ticket missing fields DAO", async () => {
    //Arrange
    const input = {
      author: "1234",
      type: "Travel",
      amount: 102,
      status: "testPending",
    };
    const expected = null;

    //Act
    const result = await ticketDAO.createTicket(input);

    //Assert
    expect(result).toEqual(expected);
  });

  it("should get a ticket by id DAO", async () => {
    //Arrange
    const expected = globalInputs[0];

    //Act
    const ticket = await ticketDAO.getTicketById(globalInputs[0].id);

    //Assert
    expect(ticket).toEqual(expected);
  });

  it("should not get a ticket by id DAO", async () => {
    //Arrange
    const expected = null;

    //Act
    const result = await ticketDAO.getTicketById(123);

    //Assert
    expect(result).toEqual(expected);
  });

  it("should delete a ticket DAO", async () => {
    //Arrange
    const input = {
      author: "1234",
      description: "test2",
      type: "Travel",
      amount: 102,
      status: "testPending",
    };
    const createdTicket = await ticketDAO.createTicket(input);
    const expected = createdTicket.id;

    //Act
    const ticket = await ticketDAO.deleteTicketById(createdTicket.id);

    //Assert
    expect(ticket).toEqual(expected);
  });

  it("should not delete a ticket DAO", async () => {
    //Arrange
    const expected = null;

    //Act
    const result = await ticketDAO.deleteTicketById(123);

    //Assert
    expect(result).toEqual(expected);
  });

  it("should get tickets by author DAO", async () => {
    //Arrange
    const expected = globalInputs;
    const search = globalInputs[0].author;

    //ACT
    const tickets = await ticketDAO.getTicketsByAuthor(search);

    //Assert
    expect(tickets).toEqual(expect.arrayContaining(expected));
  });

  it("should not get tickets by author DAO", async () => {
    const expected = [];

    const tickets = await ticketDAO.getTicketsByAuthor("fakefakeuser");

    expect(tickets).toEqual(expected);
  });

  it("should get tickets by status DAO", async () => {
    //Arrange
    const expected = globalInputs;

    //Act
    const tickets = await ticketDAO.getTicketsByStatus("testPending");

    //Assert
    expect(tickets).toEqual(expect.arrayContaining(expected));
  });

  it("should not get tickets by status DAO", async () => {
    //Arrange
    const expected = [];

    //Act
    const tickets = await ticketDAO.getTicketsByStatus("FakeStatus");

    //Assert
    expect(tickets).toEqual(expected);
  });

  it("should update a ticket DAO", async () => {
    //Arrange
    const expected = { ...globalInputs[0], status: "Approved" };

    //Act
    const ticket = await ticketDAO.updateTicket(globalInputs[0].id, {
      status: "Approved",
    });

    //Assert
    expect(ticket).toEqual(expected);
  });
  it("should not update a ticket DAO", async () => {
    //Arrange
    const expected = null;

    //Act
    const result = await ticketDAO.updateTicket(123, { status: "Approved" });

    //Assert
    expect(result).toEqual(expected);
  });
  it("should not update a ticket missing a parameter DAO", async () => {
    //Arrange
    const expected = null;

    //Act
    const result = await ticketDAO.updateTicket({ status: "Approved" });

    //Assert
    expect(result).toEqual(expected);
  });
});

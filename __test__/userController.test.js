const userService = require("../src/service/user-service");
const userDAO = require("../src/repository/user-dao");
const request = require("supertest");
const app = require("../src/app");


describe("User Controller", () => {
  it("should return 201 if user is created", async () => {
    //Arrange
    const expected = {
      status: 201,
      body: "Registration successful.",
    };
    const user = {
      username: "testuser",
      password: "testpassword",
    };
    //Act
    const response = await request(app).post("/register").send(user);
    //Assert
    expect(response.statusCode).toBe(expected.status);
    expect(response.body).toBe(expected.body);

    //Cleanup
    await userDAO.deleteUserByUsername(user.username);
  });

  it("should return 400 if user is already created", async () => {
    //Arrange
    const expected = {
      status: 400,
      body: "Username is already taken.",
    };
    const user = {
      username: "testuser",
      password: "testpassword",
    };
    await userDAO.createUser(user);
    //Act  
    const response = await request(app).post("/register").send(user);
    //Assert
    expect(response.statusCode).toBe(expected.status);
    expect(response.body).toBe(expected.body);

    //Cleanup
    await userDAO.deleteUserByUsername(user.username);
  });

  it("should return 400 if user is missing username", async () => {
    //Arrange
    const expected = {
      status: 400,
      body: "Username and password are required.",
    };
    const user = {
      password: "testpassword",
    };
    //Act
    const response = await request(app).post("/register").send(user);
    //Assert
    expect(response.statusCode).toBe(expected.status);
    expect(response.body).toBe(expected.body);

  });

  it("should return 400 if user is missing password", async () => {
    //Arrange
    const expected = {
      status: 400,
      body: "Username and password are required.",
    };
    const user = {
      username: "testuserfake"
    };
    //Act
    const response = await request(app).post("/register").send(user);
    //Assert
    expect(response.statusCode).toBe(expected.status);
    expect(response.body).toBe(expected.body);

  });

  it("should return 500 if there is an error", async () => {
    //Arrange
    userService.createUser = jest.fn().mockRejectedValue(new Error("DB crash"));
    const expected = {
      status: 500
    };
    const user = {
      username: "testuser",
      password: "testpassword",
    };
    //Act
    const response = await request(app).post("/register").send(user);
    //Assert
    expect(response.statusCode).toBe(expected.status);
  });

  it("should return 202 if user is logged in", async () => {
    //Arrange
    const expected = {
      status: 202,
      body: { role: "Employee", token: expect.any(String) },
    };
    const user = {
      username: "employee",
      password: "employee",
    };
    //Act
    const response = await request(app).post("/login").send(user);
    //Assert
    expect(response.statusCode).toBe(expected.status);
    expect(response.body).toEqual(expected.body);
  });

  it("should return 400 if user is missing username", async () => {
    //Arrange
    const expected = {
      status: 400,
      body: "Username and password are required.",
    };
    const user = {
      password: "employee",
    };
    //Act
    const response = await request(app).post("/login").send(user);
    //Assert
    expect(response.statusCode).toBe(expected.status);
    expect(response.body).toBe(expected.body);
  });

  it("should return 400 if user is missing password", async () => {
    //Arrange
    const expected = {
      status: 400,
      body: "Username and password are required.",
    };
    const user = {
      username: "employee",
    };
    //Act
    const response = await request(app).post("/login").send(user);
    //Assert
    expect(response.statusCode).toBe(expected.status);
    expect(response.body).toBe(expected.body);
  });

  it("should return 400 if user is invalid", async () => {
    //Arrange
    const expected = {
      status: 400,
      body: "Invalid Credentials.",
    };
    const user = {
      username: "employee",
      password: "wrongpassword",
    };
    //Act
    const response = await request(app).post("/login").send(user);
    //Assert
    expect(response.statusCode).toBe(expected.status);
    expect(response.body).toBe(expected.body);
  });

  it("should return 500 if there is an error", async () => {
    //Arrange
    userService.validateLogin = jest.fn().mockRejectedValue(new Error("DB crash"));
    const expected = {
      status: 500,
    };
    const user = {
      username: "employee",
      password: "employee",
    };
    //Act
    const response = await request(app).post("/login").send(user);
    //Assert
    expect(response.statusCode).toBe(expected.status);
  });

});

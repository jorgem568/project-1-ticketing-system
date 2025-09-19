const userService = require("../src/service/user-service");
const userDAO = require("../src/repository/user-dao");

describe("User Service", () => {

  let globalInputs = [];
  beforeEach(async () => {
    //await for all to happen instead of one at a time
    globalInputs = await Promise.all([
      userDAO.createUser({
       username: "tuser",
       password: "tpass",
       role: "Employee",
      }),
      userDAO.createUser({
        username: "tuser2",
        password: "tpass2",
        role: "Employee",
      }),
    ]);
  });
  afterEach(async () => {
    await Promise.all([
      userDAO.deleteUserByUserId(globalInputs[0].user_id),
      userDAO.deleteUserByUserId(globalInputs[1].user_id),
    ]);
  });

  it("should create a user", async () => {
    //Arrange
    const input = { username: "tuser", password: "tpass", role: "Employee" };
    const expected = {
      message: "created user",
      user: {
        user_id: expect.any(String),
        username: input.username,
        password: expect.any(String), // Crypted password
        role: input.role,
      },
    };

    //Act
    const user = await userService.createUser(input);

    //Assert
    expect(user).toEqual(expected);

    //Cleanup
    await userDAO.deleteUserByUserId(user.user.user_id);
  });

  it("should not create a user missing password", async () => {
    //Arrange
    const input = { username: "test", role: "Employee" };
    const expected = { message: "failed to create user" };

    //Act
    const result = await userService.createUser(input);

    //Assert
    expect(result).toEqual(expected);
  });

  it("should delete a user", async () => {
    //Arrange
    const user_id = globalInputs[0].user_id;
    const expected = { message: "deleted user", user_id };

    //Act
    const result = await userService.deleteUserByUserId(user_id);

    //Assert
    expect(result).toEqual(expected);
  });

  it("should not delete a user", async () => {
    //Arrange
    const expected = { message: "failed to delete user" };

    //Act
    const result = await userService.deleteUserByUserId(123); 

    //Assert
    expect(result).toEqual(expected);
  });

  it("should get user by id", async () => {
    //Arrange
    const expected = {
      message: "retrieved user",
      user: {
        username: globalInputs[0].username,
        password: expect.any(String), // Crypted password
        role: globalInputs[0].role,
        user_id: globalInputs[0].user_id,
      },
    };

    //Act
    const result = await userService.getUserById(globalInputs[0].user_id);

    //Assert
    expect(result).toEqual(expected);
  });

  it("should not get a user by id", async () => {
    //Arrange
    const expected = { message: "failed to retrieve user" };

    //Act
    const result = await userService.getUserById(123);

    //Assert
    expect(result).toEqual(expected);
  });

  it("should get user by username", async () => {
    //Arrange
    const expected = globalInputs[1];

    //Act
    const result = await userService.getUserByUsername(globalInputs[1].username);

    //Assert
    expect(result).toEqual(expected);
  });
  it("should not get a user by username", async () => {
    //Arrange
    const expected = null;

    //Act
    const result = await userService.getUserByUsername("test3");

    //Assert
    expect(result).toEqual(expected);
  });

  it("should validate login", async () => {
    //Arrange
    const expected = globalInputs[0];

    //Act
    const result = await userService.validateLogin(
      globalInputs[0].username,
      "tpass"
    );

    //Assert
    expect(result).toEqual(expected);
  });

  it("should not validate login", async () => {
    //Arrange
    const expected = { message: "invalid login" };

    //Act
    const result = await userService.validateLogin(
      globalInputs[0].username,
      "wrongpass"
    );

    //Assert
    expect(result).toEqual(expected);
  });
});
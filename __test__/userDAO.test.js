const userDAO = require("../src/repository/user-dao");

describe("User DAO", () => {
  let globalInputs = [];
  beforeEach(async () => {
    //await for all to happen instead of one at a time
    globalInputs = await Promise.all([
      userDAO.createUser({
        username: "test1",
        password: "test1",
        role: "Employee",
      }),
      userDAO.createUser({
        username: "test2",
        password: "test2",
        role: "Employee",
      }),
    ]);
  });
  
  afterEach(async () => {
    await Promise.allSettled([
      globalInputs[0]?.user_id && userDAO.deleteUserByUserId(globalInputs[0].user_id),
      globalInputs[1]?.user_id && userDAO.deleteUserByUserId(globalInputs[1].user_id),
    ]);
  });

  it("should create a user", async () => {
    //Arrange
    const input = { username: "test", password: "test", role: "Employee" };
    const expected = {
      ...input,
      user_id: expect.any(String),
      password: expect.any(String),
    };

    //Act
    const user = await userDAO.createUser(input);

    //Assert
    expect(user).toEqual(expected);

    //Cleanup
    await userDAO.deleteUserByUserId(user.user_id);
  });

  it("should not create a user missing password", async () => {
    //Arrange
    const input = { username: "test", role: "Employee" };
    const expected = null;

    //Act
    const result = await userDAO.createUser(input);

    //Assert
    expect(result).toEqual(expected);
  });
  
  it("should not create a user missing username", async () => {
    //Arrange
    const input = { password: "test", role: "Employee" };
    const expected = null;

    //Act
    const result = await userDAO.createUser(input);

    //Assert
    expect(result).toEqual(expected);
  });

  it("should get a user", async () => {
    //Arrange    
    const expected = globalInputs[0];

    //Act
    const result = await userDAO.getUserById(globalInputs[0].user_id);

    //Assert
    expect(result).toEqual(expected);
  });

  it("should not get a user", async () => {
    //Arrange
    const expected = null;

    //Act
    const result = await userDAO.getUserById(123);

    //Assert
    expect(result).toEqual(expected);
  });

  it("should get a user by username", async () => {
    //Arrange
    const expected = globalInputs[1];

    //Act
    const result = await userDAO.getUserByUsername(globalInputs[1].username);

    //Assert
    expect(result).toEqual(expected);
  });

  it("should not get a user by username", async () => {
    //Arrange
    const expected = null;

    //Act
    const result = await userDAO.getUserByUsername("test3");

    //Assert
    expect(result).toEqual(expected);
  });

  it("should delete a user by username", async () => {
    //Arrange
    const expected = globalInputs[0].username;

    //Act
    const result = await userDAO.deleteUserByUsername(globalInputs[0].username);

    //Assert
    expect(result).toEqual(expected);
  });

  it("should delete a user", async () => {
    //Arrange
    const expected = globalInputs[0].user_id;

    //Act
    const result = await userDAO.deleteUserByUserId(globalInputs[0].user_id);

    //Assert
    expect(result).toEqual(expected);
  });

  it("should not delete a user", async () => {
    //Arrange
    const expected = null;

    //Act
    const result = await userDAO.deleteUserByUserId(123);

    //Assert
    expect(result).toEqual(expected);
  });

  it("should not delete a user by username", async () => {
    //Arrange
    const expected = null;

    //Act
    const result = await userDAO.deleteUserByUsername("fakeusername");

    //Assert
    expect(result).toEqual(expected);
  });

});

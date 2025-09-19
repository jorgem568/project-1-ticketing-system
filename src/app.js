const express = require("express");
const app = express();
const userController = require("./controller/user-controller");
const ticketController = require("./controller/ticket-controller");
const { loggerMiddleware } = require("./util/logger");

//Middleware
app.use(express.json());
app.use(loggerMiddleware);
app.use(express.static("public"));

//Routes
app.use("/", userController);
app.use("/tickets", ticketController);

module.exports = app;
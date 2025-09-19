const userService = require("../../service/user-service");

//Ticket Authorization
async function authorizeTicketUpdate(req, res, next) {
  const user_id = req.headers["current-user"];

  const user = await userService.getUserById(user_id);

  if (user.user.role !== "Manager") {
    return res
      .status(403)
      .json({ message: "Employees cannot process requests." });
  }
  next();
}

//Ticket view authorization
async function authorizeTicketView(req, res, next) {
  const user_id = req.headers["current-user"];
  const { author } = req.query;
  const user = await userService.getUserById(user_id);
  
  if (user && user.user && user.user.role === "Manager") {
    //managers can view any tickets
    return next();
  }

  if (author && author !== user_id) {
    //employees can only view their own tickets
    return res.status(403).json({ message: "You are not authorized to view these tickets." });
  }
  next();
}

module.exports = {
  authorizeTicketUpdate,
  authorizeTicketView,
};
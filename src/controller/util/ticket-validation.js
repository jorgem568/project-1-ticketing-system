
//Ticket Validation
function validateTicket(req, res, next) {
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
}

module.exports = {
  validateTicket,
};

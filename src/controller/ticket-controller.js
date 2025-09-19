const express = require("express");
const router = express.Router();
const ticketService = require("../service/ticket-service");
const { validateTicket } = require("./util/ticket-validation");
const { authorizeTicketUpdate, authorizeTicketView } = require("./util/ticket-authorization");
const { authenticateToken } = require("../util/jwt");

router.post("/", authenticateToken, validateTicket, async (req, res) => {
    const user_id = req.headers["current-user"];
    const ticket = await ticketService.createTicket({...req.body, author: user_id});
    res.status(201).json(ticket);
});

router.get("/", authenticateToken, authorizeTicketView, async (req, res) => {
    const { status, author } = req.query;

    if (author) {        
        const tickets = await ticketService.getTicketsByAuthor(author);
        res.status(200).json(tickets);  
    } else if (status) {
        const tickets = await ticketService.getTicketsByStatus(status);
        res.status(200).json(tickets);
    } else {
        res.status(400).json({ message: "Please provide either 'status' or 'author' query parameter" });
    }
});

router.put("/:id", authenticateToken, authorizeTicketUpdate, async (req, res) => {
    const { id } = req.params;
    
    const user_id = req.headers["current-user"];

    const ticket = await ticketService.updateTicket(id, {...req.body, resolver: user_id });
    res.status(202).json(ticket);
});


module.exports = router;

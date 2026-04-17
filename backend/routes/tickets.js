const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { auth, adminAuth } = require('../middleware/auth');

// Create Ticket (User)
router.post('/', auth, async (req, res) => {
   try {
       const ticket = new Ticket({
           user: req.user._id,
           subject: req.body.subject,
           messages: [{ sender: 'user', text: req.body.message }]
       });
       await ticket.save();
       res.json(ticket);
   } catch (err) {
       res.status(500).json({ error: err.message });
   }
});

// Get User Tickets
router.get('/my-tickets', auth, async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// User Reply to Ticket
router.put('/:id/user-reply', auth, async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ _id: req.params.id, user: req.user._id });
        if (!ticket) return res.status(404).json({ error: 'Not found' });

        ticket.messages.push({ sender: 'user', text: req.body.reply });
        ticket.status = 'open';
        await ticket.save();
        res.json(ticket);
    } catch(e) { res.status(500).json({ error: e.message }); }
});

// Admin ONLY: Get All Tickets
router.get('/all', adminAuth, async (req, res) => {
    try {

        const tickets = await Ticket.find().populate('user', 'username email').sort({ createdAt: -1 });
        res.json(tickets);
    } catch(e) { res.status(500).json({ error: e.message }); }
});

// Admin ONLY: Reply to Ticket
router.put('/:id/reply', adminAuth, async (req, res) => {
    try {

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Not found' });

        ticket.messages.push({ sender: 'admin', text: req.body.reply });
        ticket.status = 'answered';
        await ticket.save();
        res.json(ticket);
    } catch(e) { res.status(500).json({ error: e.message }); }
});

// Admin/User: Close Ticket
router.put('/:id/close', auth, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if(!ticket) return res.status(404).json({error: "Not found"});
        ticket.status = 'closed';
        await ticket.save();
        res.json({ message: 'Closed' });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

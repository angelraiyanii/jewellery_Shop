const express = require('express');
const router = express.Router();
const Contact = require('../models/ContactModel');

// @route   POST api/contact/submit
// @desc    Submit a new contact form
// @access  Public
router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Create new contact entry
    const newContact = new Contact({
      name,
      email,
      phone,
      message
    });

    // Save to database
    const savedContact = await newContact.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: savedContact
    });
  } catch (err) {
    console.error('Contact form submission error:', err);
    
    // Handle validation errors specifically
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error, unable to process your request'
    });
  }
});

// @route   GET api/contact
// @desc    Get all contact submissions (Admin only)
// @access  Private (should be protected with authentication middleware)
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({
      success: false,
      message: 'Server error, unable to fetch contact entries'
    });
  }
});

// @route   PUT api/contact/:id
// @desc    Update contact status (Admin only)
// @access  Private (should be protected with authentication middleware)
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['New', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!updatedContact) {
      return res.status(404).json({
        success: false,
        message: 'Contact entry not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedContact
    });
  } catch (err) {
    console.error('Error updating contact:', err);
    res.status(500).json({
      success: false,
      message: 'Server error, unable to update contact entry'
    });
  }
});

// @route   DELETE 
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact entry not found'
      });
    }
    
    await Contact.deleteOne({ _id: req.params.id });
    
    res.json({
      success: true,
      message: 'Contact entry deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting contact:', err);
    res.status(500).json({
      success: false,
      message: 'Server error, unable to delete contact entry'
    });
  }
});

module.exports = router;
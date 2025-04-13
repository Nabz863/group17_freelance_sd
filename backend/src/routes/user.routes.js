const express = require('express');
const supabase = require('../utils/supabase');
const { verifyToken, checkRole, users } = require('../middleware/auth.middleware');
const { freelancerSignupValidation, clientSignupValidation } = require('../middleware/validation.middleware');
const router = express.Router();

// Get all users (Admin only)
router.get('/', verifyToken, checkRole(['admin']), (req, res) => {
  // This will be replaced with database query
  res.status(200).json({ 
    success: true, 
    users: users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    }))
  });
});

// Freelancer signup route
router.post('/signup/freelancer', freelancerSignupValidation, (req, res) => {
  // This will be replaced with database logic
  const { email, fullName, skills, phoneNumber, location } = req.body;
  
  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    email,
    name: fullName,
    skills,
    phoneNumber,
    location,
    role: 'pending',
    type: 'freelancer',
    createdAt: new Date(),
    status: 'pending'
  };
  
  users.push(newUser);
  
  // Send notification about status (will be implemented with database)
  
  res.status(201).json({
    success: true,
    message: 'Freelancer registration successful. Awaiting approval.',
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      status: newUser.status
    }
  });
});

// Client signup route
router.post('/signup/client', clientSignupValidation, (req, res) => {
  // This will be replaced with database logic
  const { email, companyName, contactPerson, phoneNumber, location } = req.body;
  
  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    email,
    companyName,
    contactPerson,
    phoneNumber,
    location,
    role: 'pending',
    type: 'client',
    createdAt: new Date(),
    status: 'pending'
  };
  
  users.push(newUser);
  
  // Send notification about status (will be implemented with database)
  
  res.status(201).json({
    success: true,
    message: 'Client registration successful. Awaiting approval.',
    user: {
      id: newUser.id,
      email: newUser.email,
      companyName: newUser.companyName,
      role: newUser.role,
      status: newUser.status
    }
  });
});

// Update user status (Admin only)
router.patch('/:userId/status', verifyToken, checkRole(['admin']), (req, res) => {
  // This will be replaced with database logic
  const { userId } = req.params;
  const { status, role } = req.body;
  
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Update user status and role
  users[userIndex].status = status || users[userIndex].status;
  users[userIndex].role = role || users[userIndex].role;
  
  // send notification to user about status update , implemented with db
  
  res.status(200).json({
    success: true,
    message: 'User status updated successfully',
    user: {
      id: users[userIndex].id,
      email: users[userIndex].email,
      name: users[userIndex].name,
      role: users[userIndex].role,
      status: users[userIndex].status
    }
  });
});

// Get user profile
router.get('/profile', verifyToken, (req, res) => {
  // This will be replaced with database query
  const user = users.find(user => user.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      // Include other profile details based on user type, double check what details will be asked for on form
      ...(user.type === 'freelancer' ? {
        skills: user.skills,
        location: user.location,
        phoneNumber: user.phoneNumber
      } : {}),
      ...(user.type === 'client' ? {
        companyName: user.companyName,
        contactPerson: user.contactPerson,
        location: user.location,
        phoneNumber: user.phoneNumber
      } : {})
    }
  });
});

module.exports = router;

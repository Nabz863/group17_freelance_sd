const { body, validationResult } = require('express-validator');

// Middleware to validate the request
// This is done because when clients and freelancers register for the first time through the 3rd party they are redirected to a form to complete profile details.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for freelancer signup, need to actually check what info they will have to enter and adjust validation rules accordingly
const freelancerSignupValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Name must be between 3 and 50 characters'),
  body('skills')
    .isArray()
    .withMessage('Skills must be an array'),
  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('location')
    .notEmpty()
    .withMessage('Location is required'),
  validate
];

// Validation rules for client signup, , need to actually check what info they will have to enter and adjust validation rules accordingly
const clientSignupValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('companyName')
    .notEmpty()
    .withMessage('Company name is required'),
  body('contactPerson')
    .notEmpty()
    .withMessage('Contact person name is required'),
  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('location')
    .notEmpty()
    .withMessage('Location is required'),
  validate
];

module.exports = {
  freelancerSignupValidation,
  clientSignupValidation
};
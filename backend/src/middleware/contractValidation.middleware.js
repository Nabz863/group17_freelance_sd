const { body, validationResult } = require('express-validator');

// Validate the request
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Dynamic validation based on contract template parameters
const validateContractParameters = (req, res, next) => {
  const { contractSections } = req.body;
  
  if (!contractSections || !Array.isArray(contractSections)) {
    return res.status(400).json({ 
      message: 'Contract sections are required and must be an array' 
    });
  }
  
  const errors = [];
  
  // Validate each section
  contractSections.forEach((section, sectionIndex) => {
    if (!section.parameters) return;
    
    Object.entries(section.parameters).forEach(([paramName, paramValue]) => {
      // Check if required parameters are present
      if (section.parameterDefinitions?.[paramName]?.required && 
          (paramValue === undefined || paramValue === null || paramValue === '')) {
        errors.push({
          section: section.title,
          parameter: paramName,
          message: `${paramName} is required`
        });
      }
      
      // Check number validation
      if (paramValue !== undefined && 
          section.parameterDefinitions?.[paramName]?.type === 'number') {
        const numValue = Number(paramValue);
        const def = section.parameterDefinitions[paramName];
        
        if (isNaN(numValue)) {
          errors.push({
            section: section.title,
            parameter: paramName,
            message: `${paramName} must be a number`
          });
        } else {
          if (def.min !== undefined && numValue < def.min) {
            errors.push({
              section: section.title,
              parameter: paramName,
              message: `${paramName} must be at least ${def.min}`
            });
          }
          if (def.max !== undefined && numValue > def.max) {
            errors.push({
              section: section.title,
              parameter: paramName,
              message: `${paramName} must not exceed ${def.max}`
            });
          }
        }
      }
      
      // Check date validation
      if (section.parameterDefinitions?.[paramName]?.type === 'date') {
        const dateValue = new Date(paramValue);
        
        if (isNaN(dateValue.getTime())) {
          errors.push({
            section: section.title,
            parameter: paramName,
            message: `${paramName} must be a valid date`
          });
        }
        
        // Handle "after:field" validation
        const validation = section.parameterDefinitions[paramName]?.validation;
        if (validation && validation.startsWith('after:')) {
          const otherField = validation.split(':')[1];
          const otherValue = section.parameters[otherField];
          
          if (otherValue && new Date(paramValue) <= new Date(otherValue)) {
            errors.push({
              section: section.title,
              parameter: paramName,
              message: `${paramName} must be after ${otherField}`
            });
          }
        }
      }
      
      // Check select validation
      if (section.parameterDefinitions?.[paramName]?.type === 'select' &&
          !section.parameterDefinitions[paramName].options.includes(paramValue)) {
        errors.push({
          section: section.title,
          parameter: paramName,
          message: `${paramName} must be one of: ${section.parameterDefinitions[paramName].options.join(', ')}`
        });
      }
    });
  });
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

// Specific validation for contract creation
const contractCreationValidation = [
  body('title')
    .notEmpty()
    .withMessage('Contract title is required')
    .isLength({ max: 100 })
    .withMessage('Contract title must be less than 100 characters'),
  body('freelancerId')
    .notEmpty()
    .withMessage('Freelancer ID is required'),
  body('contractSections')
    .isArray()
    .withMessage('Contract sections must be an array'),
  validate,
  validateContractParameters
];

module.exports = {
  contractCreationValidation
};
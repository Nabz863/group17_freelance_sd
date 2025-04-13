// Controller for managing contract terms customization

const { defaultContractTemplate } = require('../models/contractTemplate.model');

// Get available contract sections with editable parameters
const getContractSections = () => {
  return defaultContractTemplate.sections.map(section => ({
    title: section.title,
    content: section.content,
    editable: section.editable,
    parameterDefinitions: section.editable ? section.parameters : undefined
  }));
};

// Validate contract terms modifications
const validateContractTerms = (contractSections) => {
  if (!contractSections || !Array.isArray(contractSections)) {
    return {
      valid: false,
      errors: ['Contract sections are required and must be an array']
    };
  }
  
  const errors = [];
  const templateSections = defaultContractTemplate.sections;
  
  // Check if all required sections are present
  templateSections.forEach(templateSection => {
    const section = contractSections.find(s => s.title === templateSection.title);
    
    if (!section) {
      errors.push(`Missing required section: ${templateSection.title}`);
      return;
    }
    
    // Skip validation for non-editable sections
    if (!templateSection.editable) return;
    
    // Validate parameters for editable sections
    if (templateSection.parameters) {
      Object.entries(templateSection.parameters).forEach(([paramName, paramDef]) => {
        if (paramDef.required && 
            (!section.parameters || section.parameters[paramName] === undefined)) {
          errors.push(`Missing required parameter ${paramName} in section ${templateSection.title}`);
        }
      });
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Fill in default values for missing parameters
const fillDefaultValues = (contractSections) => {
  const templateSections = defaultContractTemplate.sections;
  
  return contractSections.map(section => {
    const templateSection = templateSections.find(ts => ts.title === section.title);
    
    if (!templateSection || !templateSection.editable || !templateSection.parameters) {
      return section;
    }
    
    const parameters = { ...section.parameters };
    
    // Fill in defaults for any missing parameters
    Object.entries(templateSection.parameters).forEach(([paramName, paramDef]) => {
      if (parameters[paramName] === undefined && paramDef.default !== undefined) {
        parameters[paramName] = paramDef.default;
      }
    });
    
    return {
      ...section,
      parameters
    };
  });
};

module.exports = {
  getContractSections,
  validateContractTerms,
  fillDefaultValues
};
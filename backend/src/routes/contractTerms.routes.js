const express = require("express");
const { jwtCheck, checkRole } = require("../middleware/auth.middleware");
const {
  getContractSections,
  validateContractTerms,
  fillDefaultValues,
} = require("../controllers/contractTerms.controller");

const router = express.Router();

// Get available contract sections with editable parameters
router.get("/sections", jwtCheck, checkRole(["client"]), (req, res) => {
  try {
    const sections = getContractSections();

    res.status(200).json({
      success: true,
      sections,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Validate contract terms
router.post("/validate", jwtCheck, checkRole(["client"]), (req, res) => {
  try {
    const { contractSections } = req.body;

    const validation = validateContractTerms(contractSections);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    // Fill in any default values for missing parameters
    const completedSections = fillDefaultValues(contractSections);

    res.status(200).json({
      success: true,
      valid: true,
      sections: completedSections,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get parameter options for a specific contract section
router.get("/parameters/:sectionTitle", jwtCheck, (req, res) => {
  try {
    const { sectionTitle } = req.params;
    const sections = getContractSections();

    const section = sections.find((s) => s.title === sectionTitle);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    if (!section.editable) {
      return res.status(400).json({
        success: false,
        message: "This section is not editable",
      });
    }

    res.status(200).json({
      success: true,
      parameters: section.parameterDefinitions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;

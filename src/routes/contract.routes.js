const express = require('express');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const { contractCreationValidation } = require('../middleware/contract-validation.middleware');
const {
  getContractTemplate,
  createContract,
  getContractById,
  updateContractStatus,
  generateContractDocument,
  contracts
} = require('../controllers/contract.controller');

const router = express.Router();

// Get contract template
router.get('/template', verifyToken, checkRole(['client']), async (req, res) => {
  try {
    const template = getContractTemplate();
    res.status(200).json({
      success: true,
      template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create a new contract
router.post('/', verifyToken, checkRole(['client']), contractCreationValidation, async (req, res) => {
  try {
    const { 
      title, 
      freelancerId, 
      contractSections
    } = req.body;
    
    // Create contract with client ID from authenticated user
    const newContract = await createContract({
      title,
      contractSections,
      clientId: req.user.id,
      freelancerId,
      status: 'pending'
    });
    
    // Send notification to freelancer (will be implemented with database)
    
    res.status(201).json({
      success: true,
      message: 'Contract created successfully',
      contract: newContract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all contracts for authenticated user
router.get('/', verifyToken, (req, res) => {
  try {
    let userContracts;
    
    if (req.user.role === 'freelancer') {
      userContracts = contracts.filter(contract => contract.freelancerId === req.user.id);
    } else if (req.user.role === 'client') {
      userContracts = contracts.filter(contract => contract.clientId === req.user.id);
    } else if (req.user.role === 'admin') {
      userContracts = contracts; // Admins can see all contracts
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    res.status(200).json({
      success: true,
      contracts: userContracts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get contract by ID
router.get('/:contractId', verifyToken, async (req, res) => {
  try {
    const { contractId } = req.params;
    
    const contract = await getContractById(contractId);
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    // Check if user is authorized to view this contract
    if (req.user.role !== 'admin' && 
        contract.clientId !== req.user.id && 
        contract.freelancerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    res.status(200).json({
      success: true,
      contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update contract status (accept/decline by freelancer)
router.patch('/:contractId/status', verifyToken, async (req, res) => {
  try {
    const { contractId } = req.params;
    const { status } = req.body;
    
    const contract = await getContractById(contractId);
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    // Check if user is authorized to update this contract
    const isFreelancer = req.user.role === 'freelancer' && contract.freelancerId === req.user.id;
    const isClient = req.user.role === 'client' && contract.clientId === req.user.id;
    
    if (!isFreelancer && !isClient && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // Validate status based on user role
    if (isFreelancer && !['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ 
        message: 'Freelancers can only accept or decline contracts' 
      });
    }
    
    // Update contract status
    const updatedContract = await updateContractStatus(contractId, status);
    
    // Send notification (will be implemented with database)
    
    res.status(200).json({
      success: true,
      message: `Contract ${status} successfully`,
      contract: updatedContract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Generate formal contract document
router.get('/:contractId/document', verifyToken, async (req, res) => {
  try {
    const { contractId } = req.params;
    
    const contract = await getContractById(contractId);
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    // Check if user is authorized to view this contract
    if (req.user.role !== 'admin' && 
        contract.clientId !== req.user.id && 
        contract.freelancerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const formalContract = await generateContractDocument(contractId);
    
    res.status(200).json({
      success: true,
      document: formalContract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Client can customize contract before assigning to freelancer
router.post('/preview', verifyToken, checkRole(['client']), contractCreationValidation, async (req, res) => {
  try {
    const { 
      title, 
      freelancerId, 
      contractSections
    } = req.body;
    
    // Create a preview contract without saving it
    const previewContract = {
      title,
      contractSections,
      clientId: req.user.id,
      freelancerId,
      status: 'preview',
      createdAt: new Date()
    };
    
    // Generate preview document
    const formalContract = {
      title: previewContract.title,
      parties: {
        client: previewContract.clientId,
        freelancer: previewContract.freelancerId
      },
      sections: previewContract.contractSections.map(section => ({
        title: section.title,
        content: section.content,
        // Replace placeholders with parameter values
        formattedContent: section.parameters 
          ? Object.entries(section.parameters).reduce(
              (content, [key, value]) => 
                content.replace(`{${key}}`, value),
              section.content
            )
          : section.content
      })),
      createdAt: previewContract.createdAt
    };
    
    res.status(200).json({
      success: true,
      preview: formalContract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
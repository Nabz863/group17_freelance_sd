const express = require('express');
const { jwtCheck, checkRole } = require('../middleware/auth.middleware');
const { contractCreationValidation } = require('../middleware/contractValidation.middleware');
const {
  createContractHandler,
  listContractsHandler,
  getContractHandler,
  updateContractStatusHandler,
  generateDocumentHandler,
  downloadContractPdfHandler
} = require('../controllers/contract.controller');

const router = express.Router();

router.get(
  '/template',
  jwtCheck,
  checkRole(['client']),
  (req, res) => {
    const { defaultContractTemplate } = require('../models/contractTemplate');
    res.json({ success: true, template: defaultContractTemplate });
  }
);

router.post(
  '/',
  jwtCheck,
  checkRole(['client']),
  contractCreationValidation,
  createContractHandler
);

router.get('/', jwtCheck, listContractsHandler);

router.get('/:contractId', jwtCheck, getContractHandler);

router.patch('/:contractId/status', jwtCheck, updateContractStatusHandler);

router.get('/:contractId/document', jwtCheck, generateDocumentHandler);

router.get('/:contractId/pdf', jwtCheck, downloadContractPdfHandler);

module.exports = router;
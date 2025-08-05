import express from 'express';
import {
  getUserCodes,
  saveCode,
  updateCode,
  deleteCode,
  getCodeById
} from '../controllers/codeController.js';

const router = express.Router();

// Get all codes for a user
router.get('/user/:user_id', getUserCodes);

// Get a single code by ID
router.get('/:id', getCodeById);

// Save a new code
router.post('/', saveCode);

// Update a code
router.put('/:id', updateCode);

// Delete a code
router.delete('/:id', deleteCode);

export default router; 
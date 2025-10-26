import express from 'express';
import ApiNamespace from '../models/ApiNamespace.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { NotFoundError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * GET /api/v1/api_namespaces
 * List all API namespaces
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const namespaces = await ApiNamespace.findAll();
    res.json(namespaces);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/api_namespaces/:id
 * Get namespace by ID
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const namespace = await ApiNamespace.findById(req.params.id);

    if (!namespace) {
      throw new NotFoundError('API Namespace not found');
    }

    res.json(namespace);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/api_namespaces
 * Create new namespace (admin only)
 */
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const namespace = await ApiNamespace.create(req.body);
    res.status(201).json(namespace);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/api_namespaces/:id
 * Update namespace (admin only)
 */
router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const namespace = await ApiNamespace.findById(req.params.id);

    if (!namespace) {
      throw new NotFoundError('API Namespace not found');
    }

    const updated = await namespace.update(req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/api_namespaces/:id
 * Delete namespace (admin only)
 */
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const namespace = await ApiNamespace.findById(req.params.id);

    if (!namespace) {
      throw new NotFoundError('API Namespace not found');
    }

    await namespace.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

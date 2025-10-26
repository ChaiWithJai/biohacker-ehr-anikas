import express from 'express';
import ApiResource from '../models/ApiResource.js';
import ApiNamespace from '../models/ApiNamespace.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * GET /api/v1/api_resources
 * List resources in a namespace
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { namespace_id } = req.query;

    if (!namespace_id) {
      throw new ValidationError('namespace_id query parameter is required');
    }

    const resources = await ApiResource.findAll(namespace_id, req.query);
    res.json(resources);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/api_resources/:id
 * Get resource by ID
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const resource = await ApiResource.findById(req.params.id);

    if (!resource) {
      throw new NotFoundError('API Resource not found');
    }

    res.json(resource);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/api_resources
 * Create new resource (practitioner/admin only)
 */
router.post('/', authenticate, authorize('practitioner', 'admin'), async (req, res, next) => {
  try {
    const { namespace_id, properties } = req.body;

    if (!namespace_id || !properties) {
      throw new ValidationError('namespace_id and properties are required');
    }

    // Verify namespace exists
    const namespace = await ApiNamespace.findById(namespace_id);
    if (!namespace) {
      throw new NotFoundError('API Namespace not found');
    }

    const resource = await ApiResource.create(namespace_id, properties);
    res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/api_resources/:id
 * Update resource (practitioner/admin only)
 */
router.put('/:id', authenticate, authorize('practitioner', 'admin'), async (req, res, next) => {
  try {
    const resource = await ApiResource.findById(req.params.id);

    if (!resource) {
      throw new NotFoundError('API Resource not found');
    }

    const updated = await resource.update(req.body.properties);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/api_resources/:id
 * Delete resource (admin only)
 */
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const resource = await ApiResource.findById(req.params.id);

    if (!resource) {
      throw new NotFoundError('API Resource not found');
    }

    await resource.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

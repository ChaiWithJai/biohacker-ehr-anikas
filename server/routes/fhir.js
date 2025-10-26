import express from 'express';
import ApiResource from '../models/ApiResource.js';
import ApiNamespace from '../models/ApiNamespace.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import { validateFhirResource } from '../validators/fhirValidator.js';

const router = express.Router();

/**
 * GET /fhir/metadata
 * FHIR CapabilityStatement
 */
router.get('/metadata', (req, res) => {
  res.json({
    resourceType: 'CapabilityStatement',
    status: 'active',
    date: new Date().toISOString(),
    kind: 'instance',
    software: {
      name: 'Violet Rails FHIR Server',
      version: '1.0.0'
    },
    implementation: {
      description: 'Violet Rails FHIR R4 API',
      url: `${req.protocol}://${req.get('host')}/fhir`
    },
    fhirVersion: '4.0.1',
    format: ['json'],
    rest: [{
      mode: 'server',
      resource: [
        {
          type: 'Patient',
          interaction: [
            { code: 'read' },
            { code: 'create' },
            { code: 'update' },
            { code: 'delete' },
            { code: 'search-type' }
          ],
          searchParam: [
            { name: 'identifier', type: 'token' },
            { name: 'name', type: 'string' },
            { name: 'birthdate', type: 'date' },
            { name: 'gender', type: 'token' }
          ]
        },
        {
          type: 'Observation',
          interaction: [
            { code: 'read' },
            { code: 'create' },
            { code: 'update' },
            { code: 'delete' },
            { code: 'search-type' }
          ],
          searchParam: [
            { name: 'patient', type: 'reference' },
            { name: 'code', type: 'token' },
            { name: 'date', type: 'date' }
          ]
        },
        {
          type: 'Encounter',
          interaction: [
            { code: 'read' },
            { code: 'create' },
            { code: 'update' },
            { code: 'delete' },
            { code: 'search-type' }
          ]
        }
      ]
    }]
  });
});

/**
 * GET /fhir/:resourceType
 * Search FHIR resources
 */
router.get('/:resourceType', authenticate, async (req, res, next) => {
  try {
    const { resourceType } = req.params;

    // Find namespace for this resource type
    const namespace = await ApiNamespace.findByName(resourceType);

    if (!namespace) {
      throw new NotFoundError(`Resource type ${resourceType} not found`);
    }

    // Get resources with search filters
    const resources = await ApiResource.findAll(namespace.id, req.query);

    // Convert to FHIR Bundle
    const bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: resources.length,
      entry: resources.map(r => ({
        fullUrl: `${req.protocol}://${req.get('host')}/fhir/${resourceType}/${r.id}`,
        resource: r.toFhir()
      }))
    };

    res.json(bundle);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /fhir/:resourceType/:id
 * Read single FHIR resource
 */
router.get('/:resourceType/:id', authenticate, async (req, res, next) => {
  try {
    const { resourceType, id } = req.params;

    const resource = await ApiResource.findById(id);

    if (!resource) {
      throw new NotFoundError(`${resourceType}/${id} not found`);
    }

    res.json(resource.toFhir());
  } catch (error) {
    next(error);
  }
});

/**
 * POST /fhir/:resourceType
 * Create FHIR resource
 */
router.post('/:resourceType', authenticate, authorize('practitioner', 'admin'), async (req, res, next) => {
  try {
    const { resourceType } = req.params;
    const fhirResource = req.body;

    // Validate resource type matches
    if (fhirResource.resourceType !== resourceType) {
      throw new ValidationError(`Resource type mismatch: expected ${resourceType}, got ${fhirResource.resourceType}`);
    }

    // Validate FHIR structure
    const validation = validateFhirResource(fhirResource);
    if (!validation.valid) {
      throw new ValidationError(`FHIR validation failed: ${validation.errors.join(', ')}`);
    }

    // Find or create namespace
    let namespace = await ApiNamespace.findByName(resourceType);

    if (!namespace) {
      // Auto-create namespace for FHIR resource types
      namespace = await ApiNamespace.create({
        name: resourceType,
        version: '1',
        properties: {
          resource_type: 'fhir',
          fhir_version: 'R4'
        }
      });
    }

    // Create resource
    const { id, meta, ...properties } = fhirResource;
    const resource = await ApiResource.create(namespace.id, properties);

    res.status(201)
       .location(`/fhir/${resourceType}/${resource.id}`)
       .json(resource.toFhir());
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /fhir/:resourceType/:id
 * Update FHIR resource
 */
router.put('/:resourceType/:id', authenticate, authorize('practitioner', 'admin'), async (req, res, next) => {
  try {
    const { resourceType, id } = req.params;
    const fhirResource = req.body;

    // Validate resource type matches
    if (fhirResource.resourceType !== resourceType) {
      throw new ValidationError(`Resource type mismatch: expected ${resourceType}, got ${fhirResource.resourceType}`);
    }

    // Validate FHIR structure
    const validation = validateFhirResource(fhirResource);
    if (!validation.valid) {
      throw new ValidationError(`FHIR validation failed: ${validation.errors.join(', ')}`);
    }

    // Find resource
    const resource = await ApiResource.findById(id);

    if (!resource) {
      throw new NotFoundError(`${resourceType}/${id} not found`);
    }

    // Update resource
    const { id: fhirId, meta, ...properties } = fhirResource;
    const updated = await resource.update(properties);

    res.json(updated.toFhir());
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /fhir/:resourceType/:id
 * Delete FHIR resource
 */
router.delete('/:resourceType/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { resourceType, id } = req.params;

    const resource = await ApiResource.findById(id);

    if (!resource) {
      throw new NotFoundError(`${resourceType}/${id} not found`);
    }

    await resource.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

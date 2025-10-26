import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

/**
 * FHIR R4 Resource Schemas
 * Simplified schemas based on FHIR R4 specification
 */
const fhirSchemas = {
  Patient: {
    type: 'object',
    required: ['resourceType'],
    properties: {
      resourceType: { const: 'Patient' },
      identifier: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            system: { type: 'string' },
            value: { type: 'string' }
          }
        }
      },
      name: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            use: { type: 'string', enum: ['usual', 'official', 'temp', 'nickname', 'anonymous', 'old', 'maiden'] },
            family: { type: 'string' },
            given: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      gender: { type: 'string', enum: ['male', 'female', 'other', 'unknown'] },
      birthDate: { type: 'string', pattern: '^[0-9]{4}(-[0-9]{2}(-[0-9]{2})?)?$' },
      telecom: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            system: { type: 'string', enum: ['phone', 'fax', 'email', 'pager', 'url', 'sms', 'other'] },
            value: { type: 'string' },
            use: { type: 'string', enum: ['home', 'work', 'temp', 'old', 'mobile'] }
          }
        }
      },
      address: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            use: { type: 'string', enum: ['home', 'work', 'temp', 'old', 'billing'] },
            type: { type: 'string', enum: ['postal', 'physical', 'both'] },
            line: { type: 'array', items: { type: 'string' } },
            city: { type: 'string' },
            state: { type: 'string' },
            postalCode: { type: 'string' },
            country: { type: 'string' }
          }
        }
      }
    }
  },

  Observation: {
    type: 'object',
    required: ['resourceType', 'status', 'code'],
    properties: {
      resourceType: { const: 'Observation' },
      status: {
        type: 'string',
        enum: ['registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error', 'unknown']
      },
      code: {
        type: 'object',
        required: ['coding'],
        properties: {
          coding: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                system: { type: 'string' },
                code: { type: 'string' },
                display: { type: 'string' }
              }
            }
          },
          text: { type: 'string' }
        }
      },
      subject: {
        type: 'object',
        properties: {
          reference: { type: 'string' },
          display: { type: 'string' }
        }
      },
      effectiveDateTime: { type: 'string' },
      effectivePeriod: {
        type: 'object',
        properties: {
          start: { type: 'string' },
          end: { type: 'string' }
        }
      },
      valueQuantity: {
        type: 'object',
        properties: {
          value: { type: 'number' },
          unit: { type: 'string' },
          system: { type: 'string' },
          code: { type: 'string' }
        }
      },
      valueString: { type: 'string' },
      valueBoolean: { type: 'boolean' },
      component: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            code: { type: 'object' },
            valueQuantity: { type: 'object' }
          }
        }
      }
    }
  },

  Encounter: {
    type: 'object',
    required: ['resourceType', 'status', 'class'],
    properties: {
      resourceType: { const: 'Encounter' },
      status: {
        type: 'string',
        enum: ['planned', 'arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'cancelled', 'entered-in-error', 'unknown']
      },
      class: {
        type: 'object',
        required: ['system', 'code'],
        properties: {
          system: { type: 'string' },
          code: { type: 'string' },
          display: { type: 'string' }
        }
      },
      subject: {
        type: 'object',
        properties: {
          reference: { type: 'string' },
          display: { type: 'string' }
        }
      },
      period: {
        type: 'object',
        properties: {
          start: { type: 'string' },
          end: { type: 'string' }
        }
      },
      reasonCode: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            coding: { type: 'array' },
            text: { type: 'string' }
          }
        }
      }
    }
  },

  Condition: {
    type: 'object',
    required: ['resourceType', 'code'],
    properties: {
      resourceType: { const: 'Condition' },
      clinicalStatus: {
        type: 'object',
        properties: {
          coding: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                system: { type: 'string' },
                code: { type: 'string' }
              }
            }
          }
        }
      },
      verificationStatus: { type: 'object' },
      code: {
        type: 'object',
        required: ['coding'],
        properties: {
          coding: { type: 'array' },
          text: { type: 'string' }
        }
      },
      subject: {
        type: 'object',
        properties: {
          reference: { type: 'string' }
        }
      },
      onsetDateTime: { type: 'string' },
      recordedDate: { type: 'string' }
    }
  }
};

/**
 * Validate FHIR resource against schema
 */
export function validateFhirResource(resource) {
  const resourceType = resource.resourceType;

  if (!resourceType) {
    return {
      valid: false,
      errors: ['Missing resourceType']
    };
  }

  const schema = fhirSchemas[resourceType];

  if (!schema) {
    // If no schema defined, do basic validation
    return {
      valid: true,
      errors: [],
      warnings: [`No validation schema defined for ${resourceType}`]
    };
  }

  const validate = ajv.compile(schema);
  const valid = validate(resource);

  if (!valid) {
    return {
      valid: false,
      errors: validate.errors.map(err => `${err.instancePath} ${err.message}`)
    };
  }

  return { valid: true, errors: [] };
}

/**
 * Get supported FHIR resource types
 */
export function getSupportedResourceTypes() {
  return Object.keys(fhirSchemas);
}

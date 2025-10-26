import { supabase } from '../index.js';

/**
 * Audit Logger Middleware
 * Logs all API operations to audit_events table
 */
export async function auditLogger(req, res, next) {
  const startTime = Date.now();

  // Capture original end function
  const originalEnd = res.end;

  res.end = function(chunk, encoding) {
    res.end = originalEnd;
    res.end(chunk, encoding);

    // Log audit event asynchronously (don't block response)
    logAuditEvent(req, res, Date.now() - startTime).catch(err => {
      console.error('Audit logging failed:', err);
    });
  };

  next();
}

async function logAuditEvent(req, res, duration) {
  // Only log important operations
  if (req.method === 'GET' && !req.path.startsWith('/fhir')) {
    return;
  }

  const userId = req.user?.id || null;
  const action = getActionFromMethod(req.method);
  const resourceMatch = req.path.match(/\/fhir\/(\w+)(?:\/([a-f0-9-]+))?/);

  let resourceType = 'unknown';
  let resourceId = null;

  if (resourceMatch) {
    resourceType = resourceMatch[1];
    resourceId = resourceMatch[2] || null;
  }

  const auditData = {
    user_id: userId,
    resource_type: resourceType,
    resource_id: resourceId,
    action: action,
    properties: {
      method: req.method,
      path: req.path,
      status_code: res.statusCode,
      duration_ms: duration,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      query: req.query,
      timestamp: new Date().toISOString()
    }
  };

  try {
    await supabase
      .from('audit_events')
      .insert([auditData]);
  } catch (error) {
    console.error('Failed to save audit event:', error);
  }
}

function getActionFromMethod(method) {
  const actions = {
    'GET': 'read',
    'POST': 'create',
    'PUT': 'update',
    'PATCH': 'update',
    'DELETE': 'delete'
  };
  return actions[method] || 'unknown';
}

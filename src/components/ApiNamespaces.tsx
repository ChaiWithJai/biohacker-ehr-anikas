import { useState, useEffect } from 'react';
import { Database, Package } from 'lucide-react';

interface Namespace {
  id: string;
  name: string;
  version: string;
  properties: {
    resource_type?: string;
    fhir_version?: string;
    description?: string;
  };
  created_at: string;
}

interface ApiNamespacesProps {
  token: string;
}

export default function ApiNamespaces({ token }: ApiNamespacesProps) {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNamespaces();
  }, []);

  const fetchNamespaces = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/api_namespaces', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch namespaces');

      const data = await response.json();
      setNamespaces(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading API namespaces...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">API Namespaces</h2>
        <p className="text-gray-600 mt-1">Violet Rails resource type definitions</p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Database className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">About API Namespaces</h3>
            <p className="text-sm text-blue-700 mt-1">
              API Namespaces define resource types using Violet Rails' schema-less JSONB pattern.
              Each namespace can store unlimited resources without database migrations.
            </p>
          </div>
        </div>
      </div>

      {/* Namespace Grid */}
      <div className="grid gap-4">
        {namespaces.map((namespace) => (
          <div
            key={namespace.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {namespace.name}
                    </h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      v{namespace.version}
                    </span>
                    {namespace.properties.resource_type === 'fhir' && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        FHIR {namespace.properties.fhir_version}
                      </span>
                    )}
                  </div>

                  {namespace.properties.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {namespace.properties.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                    <span>
                      Created: {new Date(namespace.created_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>
                      Type: {namespace.properties.resource_type || 'custom'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Schema Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Database Schema</h3>
        <div className="text-xs font-mono bg-white p-4 rounded border border-gray-200 overflow-x-auto">
          <pre className="text-gray-700">
{`api_namespaces
├─ id (uuid)
├─ name (text) - Resource type name
├─ version (text)
└─ properties (jsonb) - Configuration and schema

api_resources
├─ id (uuid)
├─ api_namespace_id (uuid FK)
└─ properties (jsonb) - Full FHIR resource data`}
          </pre>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Heart, Moon } from 'lucide-react';

interface Observation {
  id: string;
  properties: {
    resourceType: string;
    status: string;
    code: {
      coding: Array<{ code: string; display: string; system: string }>;
      text: string;
    };
    effectiveDateTime?: string;
    valueQuantity?: {
      value: number;
      unit: string;
      code: string;
    };
    valueString?: string;
  };
  created_at: string;
}

interface ObservationListProps {
  token: string;
}

export default function ObservationList({ token }: ObservationListProps) {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchObservations();
  }, []);

  const fetchObservations = async () => {
    try {
      const response = await fetch('http://localhost:3001/fhir/Observation', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch observations');

      const bundle = await response.json();
      const observationResources = bundle.entry?.map((entry: any) => ({
        id: entry.resource.id,
        properties: entry.resource,
        created_at: entry.resource.meta?.lastUpdated || new Date().toISOString()
      })) || [];

      setObservations(observationResources);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getIconForObservation = (code: string) => {
    if (code.includes('8867')) return <Heart className="w-5 h-5" />;
    if (code.includes('80404')) return <Moon className="w-5 h-5" />;
    return <Activity className="w-5 h-5" />;
  };

  const getColorForObservation = (code: string) => {
    if (code.includes('8867')) return 'bg-red-100 text-red-600';
    if (code.includes('80404')) return 'bg-indigo-100 text-indigo-600';
    return 'bg-blue-100 text-blue-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading observations...</div>
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
        <h2 className="text-2xl font-bold text-gray-900">Observations</h2>
        <p className="text-gray-600 mt-1">Health measurements and vital signs</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Observations</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{observations.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {observations.filter(o => {
                  const date = new Date(o.created_at);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return date > weekAgo;
                }).length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Data Sources</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">2</p>
              <p className="text-xs text-gray-500 mt-1">Manual + Whoop</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Observation List */}
      {observations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No observations found</p>
          <p className="text-sm text-gray-500 mt-1">Connect Whoop or add manual measurements</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {observations.map((obs) => {
                const code = obs.properties.code.coding[0].code;
                const colorClass = getColorForObservation(code);

                return (
                  <tr key={obs.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${colorClass}`}>
                          {getIconForObservation(code)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {obs.properties.code.text}
                          </p>
                          <p className="text-xs text-gray-500">
                            {obs.properties.code.coding[0].display}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-900">
                        {obs.properties.valueQuantity?.value}{' '}
                        <span className="text-gray-500 font-normal">
                          {obs.properties.valueQuantity?.unit}
                        </span>
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        obs.properties.status === 'final'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {obs.properties.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(obs.properties.effectiveDateTime || obs.created_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

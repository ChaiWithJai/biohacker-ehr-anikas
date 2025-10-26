import { useState, useEffect } from 'react';
import { User, Plus, Search } from 'lucide-react';

interface Patient {
  id: string;
  properties: {
    resourceType: string;
    identifier?: Array<{ value: string; system: string }>;
    name?: Array<{ given: string[]; family: string; use: string }>;
    gender?: string;
    birthDate?: string;
    telecom?: Array<{ system: string; value: string }>;
    address?: Array<{ city: string; state: string; country: string }>;
  };
  created_at: string;
}

interface PatientListProps {
  token: string;
}

export default function PatientList({ token }: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:3001/fhir/Patient', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch patients');

      const bundle = await response.json();
      const patientResources = bundle.entry?.map((entry: any) => ({
        id: entry.resource.id,
        properties: entry.resource,
        created_at: entry.resource.meta?.lastUpdated || new Date().toISOString()
      })) || [];

      setPatients(patientResources);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading patients...</div>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
          <p className="text-gray-600 mt-1">FHIR R4 Patient Resources</p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          <span>New Patient</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search patients by name or identifier..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Patient List */}
      {patients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No patients found</p>
          <p className="text-sm text-gray-500 mt-1">Create your first patient to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {patients.map((patient) => {
            const name = patient.properties.name?.[0];
            const identifier = patient.properties.identifier?.[0];
            const address = patient.properties.address?.[0];
            const phone = patient.properties.telecom?.find(t => t.system === 'phone');

            return (
              <div
                key={patient.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {name?.given?.join(' ')} {name?.family}
                      </h3>
                      {identifier && (
                        <p className="text-sm text-gray-500">
                          ID: {identifier.value}
                        </p>
                      )}
                      <div className="mt-2 space-y-1">
                        {patient.properties.gender && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Gender:</span>{' '}
                            <span className="capitalize">{patient.properties.gender}</span>
                          </p>
                        )}
                        {patient.properties.birthDate && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Birth Date:</span>{' '}
                            {patient.properties.birthDate}
                          </p>
                        )}
                        {phone && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Phone:</span> {phone.value}
                          </p>
                        )}
                        {address && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Location:</span>{' '}
                            {address.city}, {address.state}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(patient.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Seed Database with Sample Data
 */
async function seedData() {
  console.log('🌱 Seeding Violet Rails FHIR database...\n');

  try {
    // 1. Create admin user
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);

    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .upsert([{
        email: 'admin@violet-rails.local',
        password_hash: adminPassword,
        role: 'admin',
        properties: { name: 'System Administrator' }
      }], { onConflict: 'email' })
      .select()
      .single();

    if (adminError && adminError.code !== '23505') {
      throw adminError;
    }

    console.log('✅ Admin user created: admin@violet-rails.local / admin123\n');

    // 2. Create practitioner user
    console.log('Creating practitioner user...');
    const practitionerPassword = await bcrypt.hash('doctor123', 10);

    const { data: practitionerUser, error: practitionerError } = await supabase
      .from('users')
      .upsert([{
        email: 'doctor@violet-rails.local',
        password_hash: practitionerPassword,
        role: 'practitioner',
        properties: { name: 'Dr. Jane Smith', specialty: 'General Practice' }
      }], { onConflict: 'email' })
      .select()
      .single();

    if (practitionerError && practitionerError.code !== '23505') {
      throw practitionerError;
    }

    console.log('✅ Practitioner user created: doctor@violet-rails.local / doctor123\n');

    // 3. Create FHIR API Namespaces
    console.log('Creating FHIR API namespaces...');

    const namespaces = [
      {
        name: 'Patient',
        version: '1',
        properties: {
          resource_type: 'fhir',
          fhir_version: 'R4',
          description: 'Demographics and other administrative information about an individual'
        }
      },
      {
        name: 'Observation',
        version: '1',
        properties: {
          resource_type: 'fhir',
          fhir_version: 'R4',
          description: 'Measurements and simple assertions about a patient'
        }
      },
      {
        name: 'Encounter',
        version: '1',
        properties: {
          resource_type: 'fhir',
          fhir_version: 'R4',
          description: 'An interaction between a patient and healthcare provider'
        }
      },
      {
        name: 'Condition',
        version: '1',
        properties: {
          resource_type: 'fhir',
          fhir_version: 'R4',
          description: 'A clinical condition, problem, diagnosis, or other event'
        }
      },
      {
        name: 'Medication',
        version: '1',
        properties: {
          resource_type: 'fhir',
          fhir_version: 'R4',
          description: 'Medication information'
        }
      }
    ];

    const createdNamespaces = {};

    for (const ns of namespaces) {
      const { data, error } = await supabase
        .from('api_namespaces')
        .upsert([ns], { onConflict: 'name' })
        .select()
        .single();

      if (error && error.code !== '23505') {
        throw error;
      }

      createdNamespaces[ns.name] = data || (await supabase
        .from('api_namespaces')
        .select()
        .eq('name', ns.name)
        .single()).data;

      console.log(`  ✓ ${ns.name}`);
    }

    console.log('\n✅ FHIR namespaces created\n');

    // 4. Create sample Patient resources
    console.log('Creating sample patients...');

    const patients = [
      {
        resourceType: 'Patient',
        identifier: [{
          system: 'urn:oid:1.2.3.4.5',
          value: 'P12345'
        }],
        name: [{
          use: 'official',
          family: 'Doe',
          given: ['John']
        }],
        gender: 'male',
        birthDate: '1980-05-15',
        telecom: [{
          system: 'phone',
          value: '+1-555-0123',
          use: 'home'
        }],
        address: [{
          use: 'home',
          line: ['123 Main St'],
          city: 'Springfield',
          state: 'IL',
          postalCode: '62701',
          country: 'USA'
        }]
      },
      {
        resourceType: 'Patient',
        identifier: [{
          system: 'urn:oid:1.2.3.4.5',
          value: 'P67890'
        }],
        name: [{
          use: 'official',
          family: 'Smith',
          given: ['Jane', 'Marie']
        }],
        gender: 'female',
        birthDate: '1990-08-22',
        telecom: [{
          system: 'email',
          value: 'jane.smith@example.com'
        }],
        address: [{
          use: 'home',
          line: ['456 Oak Ave'],
          city: 'Boston',
          state: 'MA',
          postalCode: '02101',
          country: 'USA'
        }]
      }
    ];

    const patientNamespace = createdNamespaces['Patient'];

    for (const patient of patients) {
      const { data, error } = await supabase
        .from('api_resources')
        .insert([{
          api_namespace_id: patientNamespace.id,
          properties: patient
        }])
        .select()
        .single();

      if (error) throw error;

      console.log(`  ✓ Patient: ${patient.name[0].given[0]} ${patient.name[0].family}`);
    }

    console.log('\n✅ Sample patients created\n');

    // 5. Create sample Observations (Whoop-like data)
    console.log('Creating sample observations...');

    const observations = [
      {
        resourceType: 'Observation',
        status: 'final',
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '8867-4',
            display: 'Heart rate'
          }],
          text: 'Heart Rate'
        },
        effectiveDateTime: new Date().toISOString(),
        valueQuantity: {
          value: 72,
          unit: 'beats/minute',
          system: 'http://unitsofmeasure.org',
          code: '/min'
        }
      },
      {
        resourceType: 'Observation',
        status: 'final',
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '80404-7',
            display: 'Sleep duration'
          }],
          text: 'Sleep Duration'
        },
        effectiveDateTime: new Date().toISOString(),
        valueQuantity: {
          value: 7.5,
          unit: 'hours',
          system: 'http://unitsofmeasure.org',
          code: 'h'
        }
      }
    ];

    const observationNamespace = createdNamespaces['Observation'];

    for (const observation of observations) {
      const { data, error } = await supabase
        .from('api_resources')
        .insert([{
          api_namespace_id: observationNamespace.id,
          properties: observation
        }])
        .select()
        .single();

      if (error) throw error;

      console.log(`  ✓ Observation: ${observation.code.text}`);
    }

    console.log('\n✅ Sample observations created\n');

    console.log('═'.repeat(80));
    console.log('🎉 Database seeding completed successfully!\n');
    console.log('Login credentials:');
    console.log('  Admin:        admin@violet-rails.local / admin123');
    console.log('  Practitioner: doctor@violet-rails.local / doctor123');
    console.log('\nFHIR Endpoints:');
    console.log('  GET  /fhir/metadata');
    console.log('  GET  /fhir/Patient');
    console.log('  GET  /fhir/Observation');
    console.log('  POST /fhir/Patient');
    console.log('═'.repeat(80));

  } catch (error) {
    console.error('\n❌ Error seeding database:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedData();

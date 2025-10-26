import { supabase } from '../index.js';

/**
 * ApiNamespace Model - Violet Rails Pattern
 * Defines resource types (Patient, Observation, etc.) with their schemas
 */
export class ApiNamespace {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.version = data.version || '1';
    this.properties = data.properties || {};
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findAll() {
    const { data, error } = await supabase
      .from('api_namespaces')
      .select('*')
      .order('name');

    if (error) throw error;
    return data.map(ns => new ApiNamespace(ns));
  }

  static async findByName(name) {
    const { data, error } = await supabase
      .from('api_namespaces')
      .select('*')
      .eq('name', name)
      .maybeSingle();

    if (error) throw error;
    return data ? new ApiNamespace(data) : null;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('api_namespaces')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? new ApiNamespace(data) : null;
  }

  static async create(attributes) {
    const { data, error } = await supabase
      .from('api_namespaces')
      .insert([{
        name: attributes.name,
        version: attributes.version || '1',
        properties: attributes.properties || {}
      }])
      .select()
      .single();

    if (error) throw error;
    return new ApiNamespace(data);
  }

  async update(attributes) {
    const { data, error } = await supabase
      .from('api_namespaces')
      .update({
        version: attributes.version || this.version,
        properties: attributes.properties || this.properties
      })
      .eq('id', this.id)
      .select()
      .single();

    if (error) throw error;
    return new ApiNamespace(data);
  }

  async destroy() {
    const { error } = await supabase
      .from('api_namespaces')
      .delete()
      .eq('id', this.id);

    if (error) throw error;
    return true;
  }

  // Get FHIR schema from properties
  getFhirSchema() {
    return this.properties.fhir_schema || {};
  }

  // Get required fields
  getRequiredFields() {
    return this.properties.required_fields || [];
  }

  // Check if this is a FHIR resource type
  isFhirResource() {
    return this.properties.resource_type === 'fhir' || false;
  }
}

export default ApiNamespace;

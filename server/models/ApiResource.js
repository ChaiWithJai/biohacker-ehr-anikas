import { supabase } from '../index.js';

/**
 * ApiResource Model - Violet Rails Pattern
 * Stores actual resource data in JSONB properties column
 * Mimics ActiveRecord's store_accessor for JSONB fields
 */
export class ApiResource {
  constructor(data) {
    this.id = data.id;
    this.api_namespace_id = data.api_namespace_id;
    this.properties = data.properties || {};
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findAll(namespaceId, filters = {}) {
    let query = supabase
      .from('api_resources')
      .select('*')
      .eq('api_namespace_id', namespaceId);

    // Support FHIR search parameters via JSONB queries
    if (filters.identifier) {
      query = query.contains('properties', { identifier: filters.identifier });
    }

    if (filters.name) {
      query = query.ilike('properties->name->>family', `%${filters.name}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(r => new ApiResource(r));
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('api_resources')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? new ApiResource(data) : null;
  }

  static async create(namespaceId, properties) {
    const { data, error } = await supabase
      .from('api_resources')
      .insert([{
        api_namespace_id: namespaceId,
        properties: properties
      }])
      .select()
      .single();

    if (error) throw error;
    return new ApiResource(data);
  }

  async update(properties) {
    const { data, error } = await supabase
      .from('api_resources')
      .update({
        properties: { ...this.properties, ...properties }
      })
      .eq('id', this.id)
      .select()
      .single();

    if (error) throw error;
    return new ApiResource(data);
  }

  async destroy() {
    const { error } = await supabase
      .from('api_resources')
      .delete()
      .eq('id', this.id);

    if (error) throw error;
    return true;
  }

  // Accessor methods for common FHIR properties
  get resourceType() {
    return this.properties.resourceType;
  }

  get identifier() {
    return this.properties.identifier;
  }

  // Convert to FHIR format
  toFhir() {
    return {
      resourceType: this.properties.resourceType,
      id: this.id,
      meta: {
        versionId: '1',
        lastUpdated: this.updated_at
      },
      ...this.properties
    };
  }

  // Create from FHIR resource
  static fromFhir(fhirResource, namespaceId) {
    const { id, meta, ...properties } = fhirResource;
    return {
      api_namespace_id: namespaceId,
      properties: properties
    };
  }
}

export default ApiResource;

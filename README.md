# Violet Rails + FSF Health EHR Boilerplate

A modern, open-source Electronic Health Record (EHR) system built with Violet Rails architectural patterns and FHIR R4 compliance. Designed for sovereignty, privacy, and extensibility.

## 🌟 Features

### Core Architecture (Violet Rails Pattern)
- **ApiNamespace** - Schema-less resource type definitions stored in JSONB
- **ApiResource** - Flexible FHIR resource storage with PostgreSQL JSONB
- **Dynamic Schema Evolution** - Add new FHIR resources without migrations
- **Multi-tenancy Ready** - Built for subdomain-based isolation

### FHIR R4 Compliance
- ✅ **Patient** - Demographics and administrative information
- ✅ **Observation** - Measurements (heart rate, HRV, sleep, etc.)
- ✅ **Encounter** - Healthcare interactions
- ✅ **Condition** - Diagnoses and problems
- ✅ **Medication** - Medication records
- 📊 **CapabilityStatement** - Full API documentation
- 🔍 **Search Parameters** - FHIR-compliant search
- 📦 **Bundle Support** - Batch operations

### Privacy & Compliance
- 🔐 **Role-Based Access Control (RBAC)** - admin, practitioner, patient roles
- 📝 **Audit Logging** - Complete trail of all operations
- ✅ **Consent Management** - Patient data control
- 🔒 **JWT Authentication** - Secure API access
- 🛡️ **Row Level Security (RLS)** - Database-level protection

### Integration Ready
- 🏃 **Whoop Integration** - OAuth + automatic sync
- 🔌 **Extensible API** - REST + FHIR endpoints
- 📡 **Webhook Support** - Real-time event notifications
- 🌐 **CORS Enabled** - Web application ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (via Supabase)
- npm or yarn

### 1. Clone & Install

```bash
git clone <repository-url>
cd violet-rails-fhir-ehr
npm install
```

### 2. Configure Environment

```bash
# .env file is already configured with Supabase credentials
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
```

### 3. Setup Database

Run the SQL from the setup script in your Supabase SQL Editor:

```bash
npm run db:setup
```

Copy the outputted SQL and run it in: **Supabase Dashboard → SQL Editor → New Query**

### 4. Seed Sample Data

```bash
npm run db:seed
```

This creates:
- Admin user: `admin@violet-rails.local` / `admin123`
- Practitioner: `doctor@violet-rails.local` / `doctor123`
- Sample patients and observations
- FHIR namespaces

### 5. Start Development Servers

```bash
# Start both frontend and backend
npm run dev:all

# Or start individually:
npm run dev          # Frontend only (Vite) - http://localhost:5173
npm run dev:server   # Backend only (Express) - http://localhost:3001
```

## 📚 API Documentation

### Authentication

**POST /auth/register**
```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "role": "patient"
}
```

**POST /auth/login**
```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

Returns JWT token for API authentication.

### FHIR Endpoints

All FHIR endpoints require `Authorization: Bearer <token>` header.

**GET /fhir/metadata**
- Returns CapabilityStatement

**GET /fhir/Patient**
- Search all patients
- Query params: `identifier`, `name`, `birthdate`, `gender`

**GET /fhir/Patient/:id**
- Read single patient

**POST /fhir/Patient**
```json
{
  "resourceType": "Patient",
  "identifier": [{
    "system": "urn:oid:1.2.3.4.5",
    "value": "P12345"
  }],
  "name": [{
    "use": "official",
    "family": "Doe",
    "given": ["John"]
  }],
  "gender": "male",
  "birthDate": "1980-05-15"
}
```

**PUT /fhir/Patient/:id**
- Update patient (full resource)

**DELETE /fhir/Patient/:id**
- Delete patient (admin only)

Same patterns apply for: `Observation`, `Encounter`, `Condition`, `Medication`

### Violet Rails API (Internal)

**GET /api/v1/api_namespaces**
- List all resource type definitions

**POST /api/v1/api_namespaces** (admin only)
- Create new resource type

**GET /api/v1/api_resources?namespace_id=<uuid>**
- List resources in namespace

**POST /api/v1/api_resources**
- Create resource directly

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   React Admin Dashboard                 │
│                  (Vite + TypeScript)                    │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              Express.js API Server                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │  FHIR R4 REST API                               │   │
│  │  /fhir/Patient, /fhir/Observation, etc.         │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Violet Rails Pattern API                       │   │
│  │  /api/v1/api_namespaces                         │   │
│  │  /api/v1/api_resources                          │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Auth & Security                                │   │
│  │  JWT, RBAC, Audit Logging                       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│           Supabase PostgreSQL Database                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │api_namespaces│  │ api_resources │  │    users     │ │
│  │              │  │   (JSONB)     │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐                                      │
│  │ audit_events │                                      │
│  └──────────────┘                                      │
└─────────────────────────────────────────────────────────┘
```

### Key Design Patterns

**1. Violet Rails ApiNamespace Pattern**
```javascript
// Define resource types without schema migrations
ApiNamespace {
  name: "Patient",
  version: "1",
  properties: {
    resource_type: "fhir",
    fhir_version: "R4",
    fhir_schema: { /* JSON Schema */ }
  }
}
```

**2. JSONB Resource Storage**
```javascript
// Store complete FHIR resources in JSONB
ApiResource {
  api_namespace_id: <namespace-uuid>,
  properties: {
    resourceType: "Patient",
    identifier: [...],
    name: [...],
    // ... full FHIR resource
  }
}
```

**3. GNU Health as Reference**
- Clinical model structure inspired by GNU Health
- Simplified for primary care and wellness use cases
- Extensible for specialty medical records

## 🔌 Whoop Integration

### Setup

1. Register OAuth app at [Whoop Developer Portal](https://developer.whoop.com)
2. Add credentials to `.env`:
```bash
WHOOP_CLIENT_ID=your-client-id
WHOOP_CLIENT_SECRET=your-client-secret
WHOOP_REDIRECT_URI=http://localhost:3001/auth/whoop/callback
```

3. Whoop data syncs as FHIR Observations:
   - Heart rate → `Observation` (code: 8867-4)
   - HRV → `Observation` (code: custom)
   - Sleep → `Observation` (code: 80404-7)
   - Strain → `Observation` (code: custom)
   - Recovery → `Observation` (code: custom)

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npm run typecheck

# Build for production
npm run build
```

## 📦 Deployment

### Supabase + Vercel

1. **Database**: Already on Supabase
2. **Backend**: Deploy to Vercel (serverless functions)
3. **Frontend**: Deploy to Vercel (static hosting)

```bash
npm run build
vercel deploy
```

### Docker (Self-Hosted)

```dockerfile
# Coming soon
```

### Environment Variables (Production)

```bash
VITE_SUPABASE_URL=<production-url>
VITE_SUPABASE_ANON_KEY=<production-key>
JWT_SECRET=<secure-random-key>
NODE_ENV=production
```

## 🛡️ Security Considerations

1. **Change default credentials** after first setup
2. **Rotate JWT_SECRET** in production
3. **Enable RLS policies** in Supabase
4. **Use HTTPS** in production
5. **Implement rate limiting** for API endpoints
6. **Enable CORS** only for trusted origins
7. **Regular security audits** of dependencies

## 🤝 Contributing

This is a boilerplate/template project. Fork and customize for your needs.

### Adding New FHIR Resources

1. Add schema to `server/validators/fhirValidator.js`
2. Create ApiNamespace (auto-created on first POST)
3. Document in CapabilityStatement

### Extending Violet Rails Patterns

- Add new ApiNamespace types beyond FHIR
- Create custom resource validators
- Build domain-specific modules

## 📄 License

MIT License - Free for personal and commercial use

## 🙏 Acknowledgments

- **Violet Rails** (restarone/violet_rails) - Core architectural patterns
- **GNU Health** - Clinical model reference
- **FHIR R4** - Healthcare interoperability standard
- **Supabase** - PostgreSQL hosting and real-time features

## 📞 Support

- Documentation: See `/docs` folder (coming soon)
- Issues: GitHub Issues
- Community: Discussions tab

---

**Built with ❤️ for healthcare sovereignty and patient data ownership**

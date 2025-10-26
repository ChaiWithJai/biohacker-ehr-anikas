# API Examples - Violet Rails FHIR EHR

Complete collection of API requests for testing and development.

## 🔐 Authentication

### Register New User

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepassword123",
    "role": "patient"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "newuser@example.com",
    "role": "patient"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@violet-rails.local",
    "password": "doctor123"
  }'
```

**Save the token:**
```bash
export TOKEN="<token-from-response>"
```

---

## 👤 FHIR Patient Resources

### Get All Patients

```bash
curl http://localhost:3001/fhir/Patient \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** FHIR Bundle with all patients

### Get Single Patient

```bash
curl http://localhost:3001/fhir/Patient/<patient-id> \
  -H "Authorization: Bearer $TOKEN"
```

### Create Patient

```bash
curl -X POST http://localhost:3001/fhir/Patient \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Patient",
    "identifier": [{
      "system": "urn:oid:1.2.3.4.5",
      "value": "MRN12345"
    }],
    "name": [{
      "use": "official",
      "family": "Johnson",
      "given": ["Emily", "Marie"]
    }],
    "gender": "female",
    "birthDate": "1995-03-15",
    "telecom": [
      {
        "system": "phone",
        "value": "+1-555-9876",
        "use": "home"
      },
      {
        "system": "email",
        "value": "emily.johnson@example.com"
      }
    ],
    "address": [{
      "use": "home",
      "line": ["789 Pine St", "Apt 4B"],
      "city": "Seattle",
      "state": "WA",
      "postalCode": "98101",
      "country": "USA"
    }]
  }'
```

### Update Patient

```bash
curl -X PUT http://localhost:3001/fhir/Patient/<patient-id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Patient",
    "identifier": [{
      "system": "urn:oid:1.2.3.4.5",
      "value": "MRN12345"
    }],
    "name": [{
      "use": "official",
      "family": "Johnson-Smith",
      "given": ["Emily", "Marie"]
    }],
    "gender": "female",
    "birthDate": "1995-03-15"
  }'
```

### Delete Patient (Admin Only)

```bash
curl -X DELETE http://localhost:3001/fhir/Patient/<patient-id> \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 FHIR Observation Resources

### Get All Observations

```bash
curl http://localhost:3001/fhir/Observation \
  -H "Authorization: Bearer $TOKEN"
```

### Create Heart Rate Observation

```bash
curl -X POST http://localhost:3001/fhir/Observation \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Observation",
    "status": "final",
    "code": {
      "coding": [{
        "system": "http://loinc.org",
        "code": "8867-4",
        "display": "Heart rate"
      }],
      "text": "Heart Rate"
    },
    "subject": {
      "reference": "Patient/<patient-id>",
      "display": "Emily Johnson"
    },
    "effectiveDateTime": "2025-10-26T14:30:00Z",
    "valueQuantity": {
      "value": 68,
      "unit": "beats/minute",
      "system": "http://unitsofmeasure.org",
      "code": "/min"
    }
  }'
```

### Create HRV Observation (Whoop)

```bash
curl -X POST http://localhost:3001/fhir/Observation \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Observation",
    "status": "final",
    "code": {
      "coding": [{
        "system": "http://whoop.com/metrics",
        "code": "hrv",
        "display": "Heart Rate Variability"
      }],
      "text": "HRV"
    },
    "subject": {
      "reference": "Patient/<patient-id>"
    },
    "effectiveDateTime": "2025-10-26T08:00:00Z",
    "valueQuantity": {
      "value": 65,
      "unit": "milliseconds",
      "system": "http://unitsofmeasure.org",
      "code": "ms"
    }
  }'
```

### Create Sleep Observation

```bash
curl -X POST http://localhost:3001/fhir/Observation \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Observation",
    "status": "final",
    "code": {
      "coding": [{
        "system": "http://loinc.org",
        "code": "80404-7",
        "display": "Sleep duration"
      }],
      "text": "Sleep Duration"
    },
    "subject": {
      "reference": "Patient/<patient-id>"
    },
    "effectiveDateTime": "2025-10-26T08:00:00Z",
    "valueQuantity": {
      "value": 8.2,
      "unit": "hours",
      "system": "http://unitsofmeasure.org",
      "code": "h"
    }
  }'
```

---

## 🏥 FHIR Encounter Resources

### Create Encounter

```bash
curl -X POST http://localhost:3001/fhir/Encounter \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Encounter",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "subject": {
      "reference": "Patient/<patient-id>",
      "display": "Emily Johnson"
    },
    "period": {
      "start": "2025-10-26T10:00:00Z",
      "end": "2025-10-26T10:30:00Z"
    },
    "reasonCode": [{
      "coding": [{
        "system": "http://snomed.info/sct",
        "code": "73595000",
        "display": "Routine health maintenance"
      }],
      "text": "Annual checkup"
    }]
  }'
```

---

## 🩺 FHIR Condition Resources

### Create Condition

```bash
curl -X POST http://localhost:3001/fhir/Condition \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Condition",
    "clinicalStatus": {
      "coding": [{
        "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
        "code": "active"
      }]
    },
    "verificationStatus": {
      "coding": [{
        "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
        "code": "confirmed"
      }]
    },
    "code": {
      "coding": [{
        "system": "http://snomed.info/sct",
        "code": "38341003",
        "display": "Hypertension"
      }],
      "text": "High blood pressure"
    },
    "subject": {
      "reference": "Patient/<patient-id>"
    },
    "onsetDateTime": "2023-05-10",
    "recordedDate": "2023-05-10"
  }'
```

---

## 🔧 Violet Rails Internal API

### Get All API Namespaces

```bash
curl http://localhost:3001/api/v1/api_namespaces \
  -H "Authorization: Bearer $TOKEN"
```

### Get Specific Namespace

```bash
curl http://localhost:3001/api/v1/api_namespaces/<namespace-id> \
  -H "Authorization: Bearer $TOKEN"
```

### Create Custom Namespace (Admin Only)

```bash
curl -X POST http://localhost:3001/api/v1/api_namespaces \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CustomResource",
    "version": "1",
    "properties": {
      "resource_type": "custom",
      "description": "My custom resource type"
    }
  }'
```

### Get Resources in Namespace

```bash
curl "http://localhost:3001/api/v1/api_resources?namespace_id=<namespace-id>" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Resource Directly

```bash
curl -X POST http://localhost:3001/api/v1/api_resources \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "namespace_id": "<namespace-id>",
    "properties": {
      "custom_field": "value",
      "another_field": "data"
    }
  }'
```

---

## 📋 FHIR Metadata

### Get Capability Statement

```bash
curl http://localhost:3001/fhir/metadata
```

**Response:** Complete FHIR CapabilityStatement showing all supported resources and operations.

---

## 🏥 Health Check

```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-26T22:00:00.000Z"
}
```

---

## 🔍 FHIR Search Parameters

### Search Patients by Name

```bash
curl "http://localhost:3001/fhir/Patient?name=Johnson" \
  -H "Authorization: Bearer $TOKEN"
```

### Search Patients by Identifier

```bash
curl "http://localhost:3001/fhir/Patient?identifier=MRN12345" \
  -H "Authorization: Bearer $TOKEN"
```

### Search Observations by Patient

```bash
curl "http://localhost:3001/fhir/Observation?patient=Patient/<patient-id>" \
  -H "Authorization: Bearer $TOKEN"
```

### Search Observations by Code

```bash
curl "http://localhost:3001/fhir/Observation?code=8867-4" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📦 Batch Operations

### FHIR Bundle (Future Enhancement)

```bash
curl -X POST http://localhost:3001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Bundle",
    "type": "transaction",
    "entry": [
      {
        "request": {
          "method": "POST",
          "url": "Patient"
        },
        "resource": {
          "resourceType": "Patient",
          "name": [{"family": "Batch", "given": ["Test"]}]
        }
      }
    ]
  }'
```

---

## 🧪 Testing Tips

### Use jq for Pretty JSON

```bash
curl http://localhost:3001/fhir/Patient \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

### Save Token to Environment

```bash
# Login and extract token in one command
export TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@violet-rails.local","password":"doctor123"}' \
  | jq -r '.token')

echo "Token saved: $TOKEN"
```

### Check Token Expiry

```bash
# Decode JWT (requires jq)
echo $TOKEN | cut -d. -f2 | base64 -d 2>/dev/null | jq '.'
```

---

## 📊 Performance Testing

### Benchmark Patient Creation

```bash
# Create 10 patients
for i in {1..10}; do
  curl -s -X POST http://localhost:3001/fhir/Patient \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"resourceType\":\"Patient\",\"name\":[{\"family\":\"Test${i}\"}]}" \
    > /dev/null
done
```

---

## 🐛 Debugging

### View Audit Events

```sql
-- Run in Supabase SQL Editor
SELECT
  resource_type,
  action,
  properties->>'status_code' as status,
  created_at
FROM audit_events
ORDER BY created_at DESC
LIMIT 20;
```

### Check Resource Count

```sql
SELECT
  n.name as resource_type,
  COUNT(r.id) as count
FROM api_namespaces n
LEFT JOIN api_resources r ON r.api_namespace_id = n.id
GROUP BY n.name
ORDER BY count DESC;
```

---

**For more examples, see the React dashboard at http://localhost:5173 which uses these same endpoints.**

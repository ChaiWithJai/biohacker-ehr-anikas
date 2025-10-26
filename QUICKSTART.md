# 🚀 Quickstart - Violet Rails FHIR EHR

Get up and running in **5 minutes**.

## Step 1: Install (30 seconds)

```bash
npm install
```

## Step 2: Setup Database (2 minutes)

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. Copy **all** contents from `supabase-schema.sql`
3. Paste and click **Run**

## Step 3: Seed Data (30 seconds)

```bash
npm run db:seed
```

**Demo Accounts Created:**
- Admin: `admin@violet-rails.local` / `admin123`
- Doctor: `doctor@violet-rails.local` / `doctor123`

## Step 4: Start (10 seconds)

```bash
npm run dev:all
```

## Step 5: Login

Open http://localhost:5173 and login with:
- **Email:** `doctor@violet-rails.local`
- **Password:** `doctor123`

## ✅ You're Done!

You now have:
- ✅ FHIR R4 REST API running on `http://localhost:3001`
- ✅ Admin dashboard on `http://localhost:5173`
- ✅ 2 sample patients
- ✅ 2 sample observations
- ✅ 5 FHIR resource types configured

## 🧪 Test the API

```bash
# Login to get token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@violet-rails.local","password":"doctor123"}'

# Copy the token from response, then:
export TOKEN="<your-token-here>"

# Get all patients
curl http://localhost:3001/fhir/Patient \
  -H "Authorization: Bearer $TOKEN"

# Get FHIR metadata
curl http://localhost:3001/fhir/metadata
```

## 📚 What's Next?

- Read `SETUP.md` for detailed configuration
- Read `README.md` for full API documentation
- Explore the dashboard at http://localhost:5173
- Review FHIR endpoints: http://localhost:3001/fhir/metadata

## 🐛 Troubleshooting

**Database errors?**
- Make sure you ran `supabase-schema.sql` in Supabase SQL Editor

**Login fails?**
- Verify `npm run db:seed` completed successfully

**Port conflicts?**
- Backend uses port 3001, frontend uses 5173
- Kill processes: `lsof -ti:3001 | xargs kill -9`

## 🎯 Key Features

- **Violet Rails Pattern:** Schema-less JSONB resource storage
- **FHIR R4 Compliant:** Patient, Observation, Encounter, Condition, Medication
- **Role-Based Access:** Admin, Practitioner, Patient roles
- **Audit Logging:** Complete trail of all API operations
- **React Dashboard:** Modern admin interface
- **Whoop Ready:** OAuth integration prepared

---

**Need help?** See `SETUP.md` or `README.md` for detailed guides.

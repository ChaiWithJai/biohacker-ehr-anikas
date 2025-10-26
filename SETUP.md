# Setup Guide - Violet Rails FHIR EHR

Complete setup instructions for the Violet Rails + FSF Health EHR Boilerplate.

## 📋 Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**
- **Supabase Account** (already provisioned)
- Web browser for admin dashboard

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- Express.js server dependencies
- React frontend dependencies
- Supabase client
- FHIR validation tools
- Authentication libraries

### Step 2: Configure Environment

Your `.env` file is already configured with Supabase credentials:

```env
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=<your-key>
```

**Important:** For production, add:
```env
JWT_SECRET=<generate-a-secure-random-string>
NODE_ENV=production
```

### Step 3: Setup Database Schema

1. Open **Supabase Dashboard**
2. Navigate to **SQL Editor** → **New Query**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste and click **Run**

This creates:
- `api_namespaces` table
- `api_resources` table
- `users` table
- `audit_events` table
- Indexes for performance
- Triggers for timestamps

**Verify:** You should see success messages and no errors.

### Step 4: Seed Sample Data

```bash
npm run db:seed
```

This creates:
- ✅ Admin user: `admin@violet-rails.local` / `admin123`
- ✅ Practitioner user: `doctor@violet-rails.local` / `doctor123`
- ✅ 5 FHIR API Namespaces (Patient, Observation, Encounter, etc.)
- ✅ 2 Sample patients
- ✅ 2 Sample observations (heart rate, sleep)

**Expected output:**
```
🌱 Seeding Violet Rails FHIR database...

Creating admin user...
✅ Admin user created: admin@violet-rails.local / admin123

Creating practitioner user...
✅ Practitioner user created: doctor@violet-rails.local / doctor123

Creating FHIR API namespaces...
  ✓ Patient
  ✓ Observation
  ✓ Encounter
  ✓ Condition
  ✓ Medication

✅ FHIR namespaces created

Creating sample patients...
  ✓ Patient: John Doe
  ✓ Patient: Jane Smith

✅ Sample patients created

Creating sample observations...
  ✓ Observation: Heart Rate
  ✓ Observation: Sleep Duration

✅ Sample observations created

═════════════════════════════════════════════════════════════════
🎉 Database seeding completed successfully!
```

### Step 5: Start Development Servers

```bash
npm run dev:all
```

This starts:
- **Frontend** (React + Vite): http://localhost:5173
- **Backend** (Express API): http://localhost:3001

Or start individually:
```bash
# Terminal 1 - Frontend only
npm run dev

# Terminal 2 - Backend only
npm run dev:server
```

### Step 6: Access the Application

1. Open browser to http://localhost:5173
2. Login with demo credentials:
   - **Email:** `doctor@violet-rails.local`
   - **Password:** `doctor123`

You should see the dashboard with:
- Patient list
- Observation timeline
- API Namespaces (admin only)

## ✅ Verify Installation

### Test Backend API

```bash
# Health check
curl http://localhost:3001/health

# Get FHIR metadata
curl http://localhost:3001/fhir/metadata

# Login (get token)
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@violet-rails.local","password":"doctor123"}'

# Get patients (replace TOKEN)
curl http://localhost:3001/fhir/Patient \
  -H "Authorization: Bearer TOKEN"
```

### Test Frontend

1. ✅ Login page loads
2. ✅ Can login with demo credentials
3. ✅ Dashboard shows patients
4. ✅ Observations tab shows data
5. ✅ API Namespaces tab (admin only)

## 🔧 Troubleshooting

### Database Connection Issues

**Problem:** "Connection refused" or "Cannot connect to database"

**Solution:**
1. Verify Supabase URL in `.env` is correct
2. Check Supabase project is not paused
3. Verify anon key is valid
4. Check network connectivity

### Seeding Fails

**Problem:** "Table does not exist" errors

**Solution:**
1. Make sure you ran `supabase-schema.sql` in Supabase SQL Editor
2. Check for errors in SQL execution
3. Verify all tables were created:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

### Login Fails

**Problem:** "Invalid credentials" after seeding

**Solution:**
1. Verify seed script completed successfully
2. Check users table has records:
   ```sql
   SELECT email, role FROM users;
   ```
3. Use exact credentials from seed output

### Port Already in Use

**Problem:** "Port 3001 already in use"

**Solution:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in .env
echo "PORT=3002" >> .env
```

## 📚 Next Steps

### 1. Explore the FHIR API

**Test with curl or Postman:**

```bash
# Get all patients
GET /fhir/Patient

# Get specific patient
GET /fhir/Patient/{id}

# Create patient
POST /fhir/Patient
{
  "resourceType": "Patient",
  "name": [{
    "family": "Test",
    "given": ["Patient"]
  }],
  "gender": "male",
  "birthDate": "1990-01-01"
}

# Update patient
PUT /fhir/Patient/{id}

# Delete patient
DELETE /fhir/Patient/{id}
```

### 2. Add More FHIR Resources

The system supports:
- ✅ Patient
- ✅ Observation
- ✅ Encounter
- ✅ Condition
- ✅ Medication

Add more by:
1. Adding schema to `server/validators/fhirValidator.js`
2. Creating ApiNamespace (auto-created on first POST)
3. Posting FHIR resource to `/fhir/{ResourceType}`

### 3. Integrate Whoop

See `README.md` section on Whoop Integration for OAuth setup.

### 4. Customize for Your Use Case

**Extend Violet Rails patterns:**
- Create custom ApiNamespaces
- Add domain-specific resources
- Build custom validators
- Implement business logic

**Customize UI:**
- Add more dashboard widgets
- Create patient portal views
- Build practitioner workflows
- Add reporting features

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change admin password: `admin@violet-rails.local`
- [ ] Change practitioner password: `doctor@violet-rails.local`
- [ ] Set strong `JWT_SECRET` in `.env`
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for specific origins
- [ ] Set up rate limiting
- [ ] Enable Supabase Row Level Security (RLS) policies
- [ ] Review and harden API permissions
- [ ] Set up monitoring and logging
- [ ] Regular security audits

## 📦 Deployment

### Option 1: Vercel (Recommended)

```bash
# Build for production
npm run build

# Deploy
vercel deploy --prod
```

### Option 2: Self-Hosted

```bash
# Build
npm run build

# Serve with PM2
npm install -g pm2
pm2 start server/index.js --name violet-rails-api
pm2 startup
pm2 save
```

### Option 3: Docker

```dockerfile
# Coming soon - Docker configuration
```

## 🤝 Support

- **Documentation:** See `README.md` for full API reference
- **Issues:** GitHub Issues
- **Community:** Discussions tab

## 📝 Additional Resources

- [FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [Violet Rails GitHub](https://github.com/restarone/violet_rails)
- [GNU Health](https://www.gnuhealth.org/)
- [Supabase Docs](https://supabase.com/docs)

---

**Setup Complete! 🎉**

You now have a fully functional FHIR R4 EHR system built with Violet Rails architectural patterns.

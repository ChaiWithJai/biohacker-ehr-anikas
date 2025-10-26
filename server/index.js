import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import apiNamespacesRouter from './routes/apiNamespaces.js';
import apiResourcesRouter from './routes/apiResourcesRouter.js';
import fhirRouter from './routes/fhir.js';
import authRouter from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { auditLogger } from './middleware/auditLogger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase client
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(auditLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRouter);
app.use('/api/v1/api_namespaces', apiNamespacesRouter);
app.use('/api/v1/api_resources', apiResourcesRouter);
app.use('/fhir', fhirRouter);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Violet Rails FHIR Server running on http://localhost:${PORT}`);
  console.log(`📊 FHIR endpoint: http://localhost:${PORT}/fhir`);
});

export default app;

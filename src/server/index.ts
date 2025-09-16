import express from 'express';
import { systems } from '../mock/systems';

const app = express();

// Simple role extraction (demo): read from header x-user-role: 'FSysV' | 'BR'
app.use((req, res, next) => {
  const role = (req.header('x-user-role') || 'FSysV').toUpperCase();
  (req as any).userRole = role;
  next();
});

// BR write-protection: block non-GET except whitelisted endpoints/fields
app.use((req, res, next) => {
  const role = (req as any).userRole;
  if (role === 'BR' && req.method !== 'GET') {
    // allowlist example for profile and Bearbeiter exceptions
    const url = req.path;
    // Allow updating own profile settings
    if (url.startsWith('/api/profile')) return next();
    // Allow updating Bearbeiter ASP BR and Systemgruppe KBR
    if (url.startsWith('/api/bearbeiter/asp-br') || url.startsWith('/api/bearbeiter/systemgruppe')) return next();
    return res.status(403).json({ error: 'BR role has read-only access' });
  }
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/systems', (_req, res) => {
  res.json(systems);
});

// Example endpoints for allowlisted updates
app.post('/api/profile', (req, res) => {
  res.json({ ok: true });
});
app.post('/api/bearbeiter/asp-br', (req, res) => {
  res.json({ ok: true });
});
app.post('/api/bearbeiter/systemgruppe', (req, res) => {
  res.json({ ok: true });
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Server running on ${port}`);
  });
}

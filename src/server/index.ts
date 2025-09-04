import express from 'express';
import { systems } from '../mock/systems';

const app = express();

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/systems', (_req, res) => {
  res.json(systems);
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Server running on ${port}`);
  });
}

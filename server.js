import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const distPath = path.join(__dirname, 'dist');

// Ensure dist directory exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback
  app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).send('VERGROUP CRM - Compilando aplicação...');
    }
  });
} else {
  app.get('*', (req, res) => {
    res.status(200).send('VERGROUP CRM System - Servidor no ar.');
  });
}

app.listen(PORT, () => {
  console.log(`VERGROUP StayCloud Server rodando na porta ${PORT}`);
});

// Production Node.js server entry point for cPanel / CloudLinux Passenger
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Auto-restore .env from .env.example if missing
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');
if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  try {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('[cPanel Boot] Created .env from .env.example');
  } catch (e) {
    console.error('[cPanel Boot] Failed to copy .env.example:', e.message);
  }
}

// Auto-restore prisma/dev.db from seed.db if missing
const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const seedDbPath = path.join(__dirname, 'prisma', 'seed.db');
if (!fs.existsSync(dbPath) && fs.existsSync(seedDbPath)) {
  try {
    fs.copyFileSync(seedDbPath, dbPath);
    console.log('[cPanel Boot] Restored pre-configured prisma/dev.db');
  } catch (e) {
    console.error('[cPanel Boot] Failed to restore seed.db:', e.message);
  }
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
// cPanel / Phusion Passenger passes port through process.env.PORT
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

console.log(`[Hosting Portal] Starting server in ${process.env.NODE_ENV} mode on port ${port}...`);

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('[Server Error]', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`[Hosting Portal] Live and listening on port ${port}`);
  });
}).catch((err) => {
  console.error('[Hosting Portal Fatal Startup Error]', err);
  process.exit(1);
});

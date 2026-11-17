// Production Node.js server entry point for cPanel / CloudLinux Passenger
if (typeof PhusionPassenger !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
}

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Error diagnostic logger
function logError(label, err) {
  const errMsg = `[${new Date().toISOString()}] ${label}: ${err?.stack || err?.message || err}\n`;
  console.error(errMsg);
  try {
    fs.appendFileSync(path.join(__dirname, 'startup_error.log'), errMsg);
  } catch (_) {}
}

process.on('uncaughtException', (err) => logError('uncaughtException', err));
process.on('unhandledRejection', (reason) => logError('unhandledRejection', reason));

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Auto-restore .env from .env.example if missing
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');
if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  try {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('[cPanel Boot] Created .env from .env.example');
  } catch (e) {
    logError('Copy .env.example', e);
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
    logError('Restore seed.db', e);
  }
}

// Ensure Prisma always resolves absolute path to dev.db regardless of working directory
process.env.DATABASE_URL = `file:${path.resolve(__dirname, 'prisma', 'dev.db')}`;

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

console.log(`[Hosting Portal] Preparing Next.js in ${process.env.NODE_ENV} mode...`);

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      logError('Request Handler Error', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  if (typeof PhusionPassenger !== 'undefined') {
    // Under Phusion Passenger, listen to passenger pipe
    server.listen('passenger', () => {
      console.log('[Hosting Portal] Bound to Phusion Passenger socket successfully');
    });
  } else {
    // Normal TCP listen for local development or direct Node execution
    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`[Hosting Portal] Live and listening on port ${port}`);
    });
  }
}).catch((err) => {
  logError('Next.js app.prepare Fatal Error', err);
  process.exit(1);
});

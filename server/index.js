import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_FILE = path.join(__dirname, 'cases-db.json');
const INITIAL_DATA_FILE = path.join(__dirname, '../src/data/initialCases.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure data file exists
function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading cases-db.json:', e);
    }
  }

  if (fs.existsSync(INITIAL_DATA_FILE)) {
    try {
      const content = fs.readFileSync(INITIAL_DATA_FILE, 'utf-8');
      const data = JSON.parse(content);
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      return data;
    } catch (e) {
      console.error('Error reading initialCases.json:', e);
    }
  }

  return [];
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Authentication middleware
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token === ADMIN_PASSWORD) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
}

// Public: Login
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: ADMIN_PASSWORD });
  }
  return res.status(401).json({ error: 'Invalid password' });
});

// Public: Get all cases
app.get('/api/cases', (req, res) => {
  const cases = loadData();
  res.json(cases);
});

// Admin: Add or update case
app.post('/api/cases', requireAdmin, (req, res) => {
  const cases = loadData();
  const caseItem = req.body;
  const index = cases.findIndex(c => c.id === caseItem.id);

  if (index >= 0) {
    cases[index] = { ...caseItem, updatedAt: new Date().toISOString() };
  } else {
    const maxSerial = cases.reduce((max, c) => Math.max(max, c.serialNumber || 0), 0);
    const newCase = {
      ...caseItem,
      id: caseItem.id || `case-${Date.now()}`,
      serialNumber: caseItem.serialNumber || maxSerial + 1,
      updatedAt: new Date().toISOString()
    };
    cases.unshift(newCase);
  }

  saveData(cases);
  res.json({ success: true, cases });
});

// Admin: Quick update hearing
app.patch('/api/cases/:id/hearing', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { nextHearing, stage, hearingOrderText } = req.body;
  const cases = loadData();
  const target = cases.find(c => c.id === id);

  if (!target) {
    return res.status(404).json({ error: 'Case not found' });
  }

  let updatedLastBusiness = target.lastBusiness || '';
  if (hearingOrderText && hearingOrderText.trim()) {
    const todayFormatted = new Date().toLocaleDateString('en-GB');
    const newEntry = `${todayFormatted}: ${hearingOrderText.trim()}`;
    updatedLastBusiness = updatedLastBusiness
      ? `${updatedLastBusiness}\n${newEntry}`
      : newEntry;
  }

  target.nextHearing = nextHearing || target.nextHearing;
  target.stage = stage || target.stage;
  target.lastBusiness = updatedLastBusiness;
  target.updatedAt = new Date().toISOString();

  saveData(cases);
  res.json({ success: true, case: target });
});

// Admin: Delete case
app.delete('/api/cases/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  let cases = loadData();
  cases = cases.filter(c => c.id !== id);
  saveData(cases);
  res.json({ success: true });
});

// Serve frontend in production if built
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Urban Standz Case Tracker Server running on port ${PORT}`);
});

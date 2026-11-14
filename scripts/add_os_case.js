import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://jrrzjujjjrpzcgwidedi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iQkVpjlZJrYya1L2aUxgHg_JSdMPmWb';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const dataPath = path.join(__dirname, '../src/data/initialCases.json');
const currentCases = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const newCase = {
  id: 'case-74',
  serialNumber: 74,
  court: 'Principal City Civil & Sessions Court',
  cch: '31-CCH31',
  judge: 'XXX ADDL. CITY CIVIL AND SESSIONS JUDGE',
  cnr: 'KABC010300022026',
  registrationNumber: 'O.S./7309/2026',
  plaintiff1: 'AZIT KUMAR MISHRA',
  plaintiff2: '',
  plaintiff3: '',
  defendant1: 'URBAN STANDZ PVT LTD',
  defendant2: 'CHETAN KUMAR V',
  defendant3: 'KIRAN KUMAR V',
  defendant4: '',
  advocate: 'Ramesh Babu R',
  status: 'Pending',
  stage: 'Summons',
  filingDate: '2026-09-28',
  nextHearing: '2026-11-21',
  lastBusiness: '29/09/2026: Counsel for plaintiff present. Issue suit summons to the defendants through speed post and Court if PF and postal cover furnished in the office by 21/11/26.',
  linkedCase: 'P.C.R./6989/2026',
  category: 'Tenant vs Landlord & Urban Standz',
  updatedAt: new Date().toISOString()
};

const index = currentCases.findIndex(c => c.cnr === newCase.cnr || c.registrationNumber === newCase.registrationNumber);
if (index === -1) {
  currentCases.push(newCase);
  console.log(`Added ${newCase.registrationNumber} (${newCase.plaintiff1}) to initialCases.json`);
} else {
  currentCases[index] = { ...currentCases[index], ...newCase };
  console.log(`Updated ${newCase.registrationNumber} (${newCase.plaintiff1}) in initialCases.json`);
}

// Link PCR 6989/2026 to O.S./7309/2026
const pcrCase = currentCases.find(c => c.registrationNumber === 'P.C.R./6989/2026');
if (pcrCase) {
  pcrCase.linkedCase = 'O.S./7309/2026';
  console.log('Linked P.C.R./6989/2026 to O.S./7309/2026');
}

fs.writeFileSync(dataPath, JSON.stringify(currentCases, null, 2), 'utf-8');
console.log(`Total cases now: ${currentCases.length}`);

async function syncSupabase() {
  const casesToSync = [newCase, ...(pcrCase ? [pcrCase] : [])];
  const dbRows = casesToSync.map(item => ({
    id: item.id,
    serial_number: item.serialNumber,
    court: item.court,
    cch: item.cch || null,
    judge: item.judge || null,
    cnr: item.cnr || null,
    registration_number: item.registrationNumber,
    plaintiff_1: item.plaintiff1,
    plaintiff_2: item.plaintiff2 || null,
    plaintiff_3: item.plaintiff3 || null,
    defendant_1: item.defendant1,
    defendant_2: item.defendant2 || null,
    defendant_3: item.defendant3 || null,
    defendant_4: item.defendant4 || null,
    advocate: item.advocate || null,
    status: item.status || 'Pending',
    stage: item.stage || null,
    filing_date: item.filingDate || null,
    next_hearing: item.nextHearing || null,
    last_business: item.lastBusiness || null,
    linked_case: item.linkedCase || null,
    category: item.category,
    updated_at: item.updatedAt
  }));

  const { data, error } = await supabase
    .from('cases')
    .upsert(dbRows, { onConflict: 'id' });

  if (error) {
    console.error('Error inserting into Supabase:', error);
  } else {
    console.log('Successfully upserted cases to Supabase:', casesToSync.map(c => c.registrationNumber));
  }
}

syncSupabase();

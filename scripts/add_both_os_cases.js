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

const casesToAdd = [
  {
    id: 'case-76',
    serialNumber: 76,
    court: 'Principal City Civil & Sessions Court',
    cch: '25-CCH6',
    judge: 'XXIV ADDL. CITY CIVIL AND SESSIONS JUDGE',
    cnr: 'KABC010316472026',
    registrationNumber: 'O.S./7744/2026',
    plaintiff1: 'SMT VIJAYASHANKAR',
    plaintiff2: 'SHAILAJA JAYASHANKAR',
    plaintiff3: '',
    defendant1: 'URBAN STANDZ PRIVATE LIMITED',
    defendant2: 'NITHIN H ALIAS HONNE GOWDA NITHIN',
    defendant3: 'MADAN RAJ M ALIAS MUNIRAJU MADANRAJ',
    defendant4: 'RASHMI SIMLAI',
    advocate: 'Divakar',
    status: 'Pending',
    stage: 'Summons',
    filingDate: '2026-10-14',
    nextHearing: '2026-11-25',
    lastBusiness: '15/10/2026: Plaintiff Counsel present and filed memo along with Statement of Truth as per prescribed form and comply the office objections Counsel for plaintiff filed memo requesting to keep the original document in safe custody. Office is hereby directed keep the documents in safe custody. Heard the arguments of plaintiff Counsel on IA.No.1. Call on for orders on IA.No.1 by 16.10.2026.\n16/10/2026: Defendants, their agents or any persons claiming through them are hereby restrained by an order of ad-interim temporary injunction from creating any third party interest over the suit schedule property in any manner whatsoever, as prayed in I.A.No.I till next date of hearing. Plaintiffs shall comply with the provisions u/o XXXIX Rule 3(A) C.P.C. Issue suit summons, notice of IA No.1 along with T.I notice to the defendants through Court and RPAD if P.F is paid and suit summons r/by 25.11.2026',
    linkedCase: '',
    category: 'Landlord vs Tenant & Urban Standz',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'case-77',
    serialNumber: 77,
    court: 'Principal City Civil & Sessions Court',
    cch: '6-CCH13',
    judge: 'V ADDL. CITY CIVIL AND SESSIONS JUDGE',
    cnr: 'KABC010319082026',
    registrationNumber: 'O.S./7825/2026',
    plaintiff1: 'VIJAYLAXMI',
    plaintiff2: '',
    plaintiff3: '',
    defendant1: 'URBAN STANDZ PRIVATE LIMITED',
    defendant2: 'SOLOMON BHAGYANATHAN S',
    defendant3: '',
    defendant4: '',
    advocate: 'PRADEEP',
    status: 'Pending',
    stage: 'Summons',
    filingDate: '2026-10-16',
    nextHearing: '2026-11-25',
    lastBusiness: '16/10/2026: O.S. 7825/2026 Issue suit Summons to defendant No.1 and 2. Call on 25.11.2026.',
    linkedCase: '',
    category: 'Tenant vs Landlord & Urban Standz',
    updatedAt: new Date().toISOString()
  }
];

for (const nc of casesToAdd) {
  const index = currentCases.findIndex(c => c.cnr === nc.cnr || c.registrationNumber === nc.registrationNumber);
  if (index === -1) {
    currentCases.push(nc);
    console.log(`Added ${nc.registrationNumber} (${nc.plaintiff1}) to initialCases.json`);
  } else {
    currentCases[index] = { ...currentCases[index], ...nc };
    console.log(`Updated ${nc.registrationNumber} (${nc.plaintiff1}) in initialCases.json`);
  }
}

fs.writeFileSync(dataPath, JSON.stringify(currentCases, null, 2), 'utf-8');
console.log(`Total cases now: ${currentCases.length}`);

async function syncSupabase() {
  const dbRows = casesToAdd.map(item => ({
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
    console.log('Successfully upserted cases to Supabase:', casesToAdd.map(c => c.registrationNumber));
  }
}

syncSupabase();

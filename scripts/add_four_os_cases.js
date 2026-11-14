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

const newBatch = [
  {
    id: 'case-78',
    serialNumber: 78,
    court: 'Principal City Civil & Sessions Court',
    cch: '10-CCH2',
    judge: 'I ADDL. CITY CIVIL AND SESSIONS JUDGE',
    cnr: 'KABC010328882026',
    registrationNumber: 'O.S./8089/2026',
    plaintiff1: 'Jayarama B',
    plaintiff2: '',
    plaintiff3: '',
    defendant1: 'Urban standz Private Ltd',
    defendant2: 'GLORY N',
    defendant3: '',
    defendant4: '',
    advocate: 'Harisha B.C',
    status: 'Pending',
    stage: 'Summons',
    filingDate: '2026-10-31',
    nextHearing: '2026-11-28',
    lastBusiness: '02/11/2026: Case called. Issue summons to defendants. Call on 28.11.2026.',
    linkedCase: 'O.S./4788/2026',
    category: 'Landlord vs Tenant & Urban Standz',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'case-79',
    serialNumber: 79,
    court: 'Principal City Civil & Sessions Court',
    cch: '798-CCH36',
    judge: 'XXXV ADDL. CITY CIVIL AND SESSIONS JUDGE',
    cnr: 'KABC010329112026',
    registrationNumber: 'O.S./8095/2026',
    plaintiff1: 'Arjuman Nisar Ahamed',
    plaintiff2: '',
    plaintiff3: '',
    defendant1: 'URBAN STANDZ Private Limited Represented By its Managing Director',
    defendant2: 'Danny Ganapathy M S',
    defendant3: '',
    defendant4: '',
    advocate: 'S. Guruprasad',
    status: 'Pending',
    stage: 'Notice',
    filingDate: '2026-10-31',
    nextHearing: '2026-12-03',
    lastBusiness: '02/11/2026: Advocate for plaintiff prays time, for compliance of office objection. Call on 03-11-2026, for compliance of office objection.\n03/11/2026: Call on 03-12-2026, for compliance of office objection.',
    linkedCase: '',
    category: 'Tenant vs Landlord & Urban Standz',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'case-80',
    serialNumber: 80,
    court: 'Principal City Civil & Sessions Court',
    cch: '23-CCH7',
    judge: 'XXII ADDL. CITY CIVIL AND SESSIONS JUDGE',
    cnr: 'KABC010332472026',
    registrationNumber: 'O.S./8183/2026',
    plaintiff1: 'Lokanath',
    plaintiff2: '',
    plaintiff3: '',
    defendant1: 'Urban Standz Pvt Ltd',
    defendant2: 'Pavithra',
    defendant3: '',
    defendant4: '',
    advocate: 'A c Thomasappa',
    status: 'Pending',
    stage: 'Notice',
    filingDate: '2026-11-04',
    nextHearing: '2026-11-19',
    lastBusiness: '05/11/2026: Case called out. Learned Counsel for plaintiff prays time. For compliance of office objections by 19.11.2026.',
    linkedCase: '',
    category: 'Tenant vs Landlord & Urban Standz',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'case-81',
    serialNumber: 81,
    court: 'Principal City Civil & Sessions Court',
    cch: '13-CCH27',
    judge: 'XII ADDL. CITY CIVIL AND SESSIONS JUDGE',
    cnr: 'KABC010334532026',
    registrationNumber: 'O.S./8238/2026',
    plaintiff1: 'CHIDAMBARA M',
    plaintiff2: 'MUNIRAJ M',
    plaintiff3: '',
    defendant1: 'URBAN STANDZ PVT LTD',
    defendant2: 'NITHIN HONNEGOWDA',
    defendant3: 'MADAN RAJ',
    defendant4: 'MARIAMMA JOSEPH, ASHLY MARY JOSEPH',
    advocate: 'B M KUSHALAPPA',
    status: 'Pending',
    stage: 'Summons',
    filingDate: '2026-11-06',
    nextHearing: '2027-01-18',
    lastBusiness: '06/11/2026: L/c for the plaintiff submits that original rental agreement dt 04.02.2026 is with the custody of the defendants. In view of the submission on perusal of the plaint averments, suit is for ejectment and also arrears of rent, the defendants are the tenants. Considering the nature of the suit and averments in para no.3 of the plaint production of the original rental agreement dt 04.02.2026 is hereby dispensed. Issue SS to the defendants. Call on 18-01-2027',
    linkedCase: 'O.S./5520/2026',
    category: 'Landlord vs Tenant & Urban Standz',
    updatedAt: new Date().toISOString()
  }
];

for (const nc of newBatch) {
  const index = currentCases.findIndex(c => c.cnr === nc.cnr || c.registrationNumber === nc.registrationNumber);
  if (index === -1) {
    currentCases.push(nc);
    console.log(`Added ${nc.registrationNumber} (${nc.plaintiff1}) to initialCases.json`);
  } else {
    currentCases[index] = { ...currentCases[index], ...nc };
    console.log(`Updated ${nc.registrationNumber} (${nc.plaintiff1}) in initialCases.json`);
  }
}

// Cross-link 1: O.S./4788/2026 (Glory N) <-> O.S./8089/2026 (Jayarama B)
const gloryCase = currentCases.find(c => c.registrationNumber === 'O.S./4788/2026');
if (gloryCase) {
  gloryCase.linkedCase = 'O.S./8089/2026';
  console.log('Linked O.S./4788/2026 (Glory N) to O.S./8089/2026 (Jayarama B)');
}

// Cross-link 2: O.S./5520/2026 (Mariamma Joseph) <-> O.S./8238/2026 (Chidambara M & Muniraj M)
const mariammaCase = currentCases.find(c => c.registrationNumber === 'O.S./5520/2026');
if (mariammaCase) {
  mariammaCase.linkedCase = 'O.S./8238/2026';
  console.log('Linked O.S./5520/2026 (Mariamma Joseph) to O.S./8238/2026 (Chidambara M)');
}

fs.writeFileSync(dataPath, JSON.stringify(currentCases, null, 2), 'utf-8');
console.log(`Total cases now: ${currentCases.length}`);

async function syncSupabase() {
  const casesToSync = [
    ...newBatch,
    ...(gloryCase ? [gloryCase] : []),
    ...(mariammaCase ? [mariammaCase] : [])
  ];

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

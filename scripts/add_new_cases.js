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

const newCases = [
  {
    id: 'case-70',
    serialNumber: 70,
    court: 'Chief Judicial Magistrate, Bengaluru City',
    cch: '1035-XXIII',
    judge: 'XXIII ADDL CHIEF JUDICIAL MAGISTRATE',
    cnr: 'KABC031043922026',
    registrationNumber: 'C.C./77346/2026',
    plaintiff1: 'PAWAN PRASAD N',
    plaintiff2: '',
    plaintiff3: '',
    defendant1: 'URBAN STANDZ PVT. LTD.',
    defendant2: 'NITHIN HONNEGOWDA H',
    defendant3: '',
    defendant4: '',
    advocate: 'JYOTHI C',
    status: 'Pending',
    stage: 'SUMMONS',
    filingDate: '2026-11-13',
    nextHearing: '2027-02-01',
    lastBusiness: '13/11/2026: ISSUE SS TO ACCUSED IF PF PAID, CALL ON',
    linkedCase: 'P.C.R./8205/2026',
    category: 'Criminal / Cheating / 138 NI Act',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'case-71',
    serialNumber: 71,
    court: 'Chief Judicial Magistrate, Bengaluru City',
    cch: '1035-XXIII',
    judge: 'XXIII ADDL CHIEF JUDICIAL MAGISTRATE',
    cnr: 'KABC031010882026',
    registrationNumber: 'C.C./74589/2026',
    plaintiff1: 'KIRAN KUMAR V',
    plaintiff2: '',
    plaintiff3: '',
    defendant1: 'M/S URBAN STANDZ PVT. LTD.',
    defendant2: '',
    defendant3: '',
    defendant4: '',
    advocate: 'THEJESH P',
    status: 'Pending',
    stage: 'SUMMONS',
    filingDate: '2026-11-04',
    nextHearing: '2027-01-27',
    lastBusiness: '04/11/2026: ISSUE SS TO ACCUSED IF PF PAID, CALL ON',
    linkedCase: '',
    category: 'Criminal / Cheating / 138 NI Act',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'case-72',
    serialNumber: 72,
    court: 'Chief Judicial Magistrate, Bengaluru City',
    cch: '1348-XXXVI',
    judge: 'XXXVI ADDL CHIEF JUDICIAL MAGISTRATE',
    cnr: 'KABC030977812026',
    registrationNumber: 'C.C./72016/2026',
    plaintiff1: 'DINESH RAJ STANISLAUS',
    plaintiff2: '',
    plaintiff3: '',
    defendant1: 'URBAN STANDZ PVT LTD',
    defendant2: '',
    defendant3: '',
    defendant4: '',
    advocate: '',
    status: 'Pending',
    stage: 'SUMMONS',
    filingDate: '2026-10-24',
    nextHearing: '2026-12-05',
    lastBusiness: '24/10/2026: SUMMONS',
    linkedCase: '',
    category: 'Criminal / Cheating / 138 NI Act',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'case-73',
    serialNumber: 73,
    court: 'Chief Judicial Magistrate, Bengaluru City',
    cch: '1033-XXI',
    judge: 'XXI ADDL CHIEF JUDICIAL MAGISTRATE',
    cnr: 'KABC030889062026',
    registrationNumber: 'C.C./65324/2026',
    plaintiff1: 'NITHIN KUMAR V',
    plaintiff2: '',
    plaintiff3: '',
    defendant1: 'M/S URBAN STANDZ PRIVATE LIMITED',
    defendant2: 'HONNE GOWDA NITHIN',
    defendant3: 'MUNI RAJU MADHAN RAJ',
    defendant4: 'KARUNA',
    advocate: 'ANAND R B',
    status: 'Pending',
    stage: 'SUMMONS',
    filingDate: '2026-09-29',
    nextHearing: '2026-12-30',
    lastBusiness: '29/09/2026: Issue summons to accused.\n24/10/2026: Call on\n27/10/2026: P O is on training. Hence, case adjourned.',
    linkedCase: 'P.C.R./7027/2026',
    category: 'Criminal / Cheating / 138 NI Act',
    updatedAt: new Date().toISOString()
  }
];

// Check if already in initialCases.json
for (const nc of newCases) {
  const index = currentCases.findIndex(c => c.cnr === nc.cnr || c.registrationNumber === nc.registrationNumber);
  if (index === -1) {
    currentCases.push(nc);
    console.log(`Added ${nc.registrationNumber} (${nc.plaintiff1}) to initialCases.json`);
  } else {
    currentCases[index] = { ...currentCases[index], ...nc };
    console.log(`Updated ${nc.registrationNumber} (${nc.plaintiff1}) in initialCases.json`);
  }
}

// Link PCR 8205/2026 <-> C.C./77346/2026
const pcr8205 = currentCases.find(c => c.registrationNumber === 'P.C.R./8205/2026');
if (pcr8205) {
  pcr8205.linkedCase = 'C.C./77346/2026';
}

// Link PCR 7027/2026 <-> C.C./65324/2026
const pcr7027 = currentCases.find(c => c.registrationNumber === 'P.C.R./7027/2026');
if (pcr7027) {
  pcr7027.linkedCase = 'C.C./65324/2026';
  pcr7027.lastBusiness = '27/08/2026: For sworn statement\n23/09/2026: Converted to C.C./65324/2026';
}

fs.writeFileSync(dataPath, JSON.stringify(currentCases, null, 2), 'utf-8');
console.log(`initialCases.json now has ${currentCases.length} cases.`);

// Convert all new & updated cases to Supabase DB rows
async function syncSupabase() {
  const casesToSync = [
    ...newCases,
    ...(pcr8205 ? [pcr8205] : []),
    ...(pcr7027 ? [pcr7027] : [])
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
    category: item.category || 'Criminal / Cheating / 138 NI Act',
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

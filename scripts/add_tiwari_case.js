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
  id: 'case-75',
  serialNumber: 75,
  court: 'Principal City Civil & Sessions Court',
  cch: '4-CCH25',
  judge: 'III ADDL. CITY CIVIL AND SESSIONS JUDGE',
  cnr: 'KABC010316322026',
  registrationNumber: 'O.S./7734/2026',
  plaintiff1: 'Harshit Tiwari',
  plaintiff2: 'Manju Tiwari',
  plaintiff3: '',
  defendant1: 'Urban Standz Pvt Ltd',
  defendant2: 'Nithin Honnegowda',
  defendant3: 'Madan Raj',
  defendant4: 'Shivkumar, Rita Mithai Lal',
  advocate: 'JITENDRA VARMA',
  status: 'Pending',
  stage: 'Summons',
  filingDate: '2026-10-14',
  nextHearing: '2026-11-16',
  lastBusiness: '14/10/2026: Learned counsel for plaintiff present and files an application u/O 6 R 14(a) of CPC, partly complied office objections. Counsel for Plaintiff prays time to pay deficit court fee. Issue Suit summons to Defendant No.1 to 5 if deficit court fee paid by the Plaintiff and PF paid, r/by 16.11.2026.\n16/10/2026: Case is advanced and taken on todays board. Learned counsel for plaintiff present and files memo along with DD bearing No.604534 for total sum of Rs.8,432/- drawn on Punjab National Bank, dated: 15.10.2026 to wards deficit court fee. Office to receive the DD. Issue Suit summons to Defendant No.1 to 5, r/by 16.11.2026.',
  linkedCase: '',
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

fs.writeFileSync(dataPath, JSON.stringify(currentCases, null, 2), 'utf-8');
console.log(`Total cases now: ${currentCases.length}`);

async function syncSupabase() {
  const dbRows = [{
    id: newCase.id,
    serial_number: newCase.serialNumber,
    court: newCase.court,
    cch: newCase.cch || null,
    judge: newCase.judge || null,
    cnr: newCase.cnr || null,
    registration_number: newCase.registrationNumber,
    plaintiff_1: newCase.plaintiff1,
    plaintiff_2: newCase.plaintiff2 || null,
    plaintiff_3: newCase.plaintiff3 || null,
    defendant_1: newCase.defendant1,
    defendant_2: newCase.defendant2 || null,
    defendant_3: newCase.defendant3 || null,
    defendant_4: newCase.defendant4 || null,
    advocate: newCase.advocate || null,
    status: newCase.status || 'Pending',
    stage: newCase.stage || null,
    filing_date: newCase.filingDate || null,
    next_hearing: newCase.nextHearing || null,
    last_business: newCase.lastBusiness || null,
    linked_case: newCase.linkedCase || null,
    category: newCase.category,
    updated_at: newCase.updatedAt
  }];

  const { data, error } = await supabase
    .from('cases')
    .upsert(dbRows, { onConflict: 'id' });

  if (error) {
    console.error('Error inserting into Supabase:', error);
  } else {
    console.log('Successfully upserted case to Supabase:', newCase.registrationNumber);
  }
}

syncSupabase();

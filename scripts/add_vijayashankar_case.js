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

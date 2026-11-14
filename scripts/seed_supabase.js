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
const rawCases = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

async function seed() {
  console.log(`Seeding ${rawCases.length} cases to Supabase...`);

  const dbRows = rawCases.map(item => ({
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
    category: item.category || 'Tenant vs Landlord & Urban Standz'
  }));

  // Batch insert/upsert in chunks of 20
  for (let i = 0; i < dbRows.length; i += 20) {
    const chunk = dbRows.slice(i, i + 20);
    const { error } = await supabase.from('cases').upsert(chunk, { onConflict: 'id' });
    if (error) {
      console.error(`Error inserting chunk ${i}-${i + chunk.length}:`, error);
    } else {
      console.log(`Uploaded cases ${i + 1} to ${Math.min(i + chunk.length, dbRows.length)}`);
    }
  }

  const { count, error: countErr } = await supabase.from('cases').select('*', { count: 'exact', head: true });
  console.log(`Total cases now in Supabase database: ${count}`);
}

seed().catch(console.error);

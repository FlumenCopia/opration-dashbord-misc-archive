const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

let envText = '';
try {
  envText = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
} catch (e) {}

const env = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initDayBoard() {
  console.log('Initializing day_board table via Supabase client...');
  const initialDays = [
    { id: 'db_mon_1', day_key: 'Mon', text: 'Run 09:15 money hour & check bank position', done: false },
    { id: 'db_mon_2', day_key: 'Mon', text: '13:30 Collection calls to top 3 accounts', done: false },
    { id: 'db_tue_1', day_key: 'Tue', text: '11:00 Client review meeting with Masters', done: false },
    { id: 'db_wed_1', day_key: 'Wed', text: '15:00 Delivery audit with team leads', done: false },
    { id: 'db_thu_1', day_key: 'Thu', text: '07:30 BNI Matrix meeting & 14:00 1-to-1 session', done: false },
    { id: 'db_fri_1', day_key: 'Fri', text: '16:00 Scorecard update & week close report', done: false },
    { id: 'db_sat_1', day_key: 'Sat', text: 'Complete one personal priority task', done: false },
    { id: 'db_sun_1', day_key: 'Sun', text: 'Rest day — no laptop', done: false }
  ];

  try {
    for (const item of initialDays) {
      const { error } = await supabase.from('day_board').upsert(item);
      if (error) console.warn(`Upsert note for ${item.id}:`, error.message);
    }
    console.log('Day board seeded successfully!');
  } catch (err) {
    console.error('Error seeding day board:', err);
  }
}

initDayBoard();

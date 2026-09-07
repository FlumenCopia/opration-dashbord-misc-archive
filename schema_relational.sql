-- ============================================================
-- SUPABASE RELATIONAL TABLES SCHEMA & SEED FOR OPERATING CONSOLE
-- ============================================================
-- Copy & run this script in your Supabase SQL Editor.
-- It creates separate, clean tables for every database model!

-- 1. HERO METRICS
CREATE TABLE IF NOT EXISTS hero_metrics (
  id TEXT PRIMARY KEY DEFAULT 'main',
  billed NUMERIC NOT NULL DEFAULT 646617,
  banked NUMERIC NOT NULL DEFAULT 179863,
  subtext TEXT,
  notice TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. DATED ITEMS
CREATE TABLE IF NOT EXISTS dated_items (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT,
  urgent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  week_key TEXT NOT NULL, -- 'w1' or 'w2'
  title TEXT NOT NULL,
  why TEXT,
  done BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. COLLECTIONS
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'a',
  done BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. OUTFLOWS
CREATE TABLE IF NOT EXISTS outflows (
  id TEXT PRIMARY KEY,
  item TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  type TEXT DEFAULT 'business',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. DEBT LADDER
CREATE TABLE IF NOT EXISTS debt_ladder (
  id TEXT PRIMARY KEY,
  order_num INT DEFAULT 1,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  emi NUMERIC NOT NULL DEFAULT 0,
  rate TEXT,
  is_car BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TEAM MEMBERS
CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  pay NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. SCORECARD METRICS
CREATE TABLE IF NOT EXISTS scorecard (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  target NUMERIC DEFAULT 0,
  target_label TEXT,
  value TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. PHASES
CREATE TABLE IF NOT EXISTS phases (
  id TEXT PRIMARY KEY,
  phase_num TEXT NOT NULL,
  timeline TEXT NOT NULL,
  title TEXT NOT NULL,
  done_looks_like TEXT,
  callout TEXT,
  is_current BOOLEAN DEFAULT false
);

-- 10. PHASE ITEMS
CREATE TABLE IF NOT EXISTS phase_items (
  id TEXT PRIMARY KEY,
  phase_id TEXT REFERENCES phases(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT false
);

-- ============================================================
-- ENABLE RLS & PUBLIC POLICIES FOR ALL TABLES
-- ============================================================
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow public access" ON %I;', t);
    EXECUTE format('CREATE POLICY "Allow public access" ON %I FOR ALL USING (true) WITH CHECK (true);', t);
  END LOOP;
END $$;

-- ENABLE REALTIME ON ALL TABLES
ALTER PUBLICATION supabase_realtime ADD TABLE hero_metrics, dated_items, tasks, collections, outflows, debt_ladder, team_members, scorecard, phases, phase_items;

-- ============================================================
-- INITIAL SEED DATA
-- ============================================================

-- Hero
INSERT INTO hero_metrics (id, billed, banked, subtext, notice)
VALUES ('main', 646617, 179863, 'Misc Archive Private Limited. From here the whole outcome turns on a single number.', 'At 85% collection you break even. At 90% plus ₹1L of new recurring revenue you build wealth.')
ON CONFLICT (id) DO UPDATE SET billed = EXCLUDED.billed, banked = EXCLUDED.banked, subtext = EXCLUDED.subtext, notice = EXCLUDED.notice;

-- Dated Items
INSERT INTO dated_items (id, date, title, details, urgent) VALUES
('dt1', '3 Nov', 'INC-20A', '₹50,000 plus ₹1,000 per director per day after.', true),
('dt2', '5 Oct', 'First car EMI', 'Monthly car EMI payment starts.', false),
('dt3', '10 Mar', 'Bajaj premium auto-debits', '₹1,02,250 unless you decide otherwise.', false),
('dt4', 'Thozhukkal title', 'Property Title Clearance', 'No deadline, longest lead time, blocks the ₹1 crore sale until cleared.', false)
ON CONFLICT (id) DO NOTHING;

-- Tasks
INSERT INTO tasks (id, week_key, title, why, done) VALUES
('w1_0', 'w1', 'Compute April to July billing, month by month', 'Settles whether GST liability already exists on past supplies.', false),
('w1_1', 'w1', 'Send those figures to the CA with invoice copies', 'Ask directly: was the threshold crossed, and what is owed.', false),
('w1_2', 'w1', 'Tell every client GST is additional from this month', 'Your terms already say prices exclude taxes.', false),
('w1_3', 'w1', 'Call all four card issuers, convert balances to EMI', '₹43,700 a year for four phone calls.', false),
('w1_4', 'w1', 'Call every collectible client personally', '₹6.78L collectible excluding TWC.', false),
('w2_0', 'w2', 'Put new payment terms in writing to every client', '100% advance month one, due by the 5th.', false),
('w2_1', 'w2', 'Rank all 13 people on billing against salary', 'Data first. Use the matrix in Team.', false)
ON CONFLICT (id) DO NOTHING;

-- Collections
INSERT INTO collections (id, name, amount, category, done) VALUES
('c0', 'Masters', 250000, 'a', false),
('c1', 'iLearn', 62125, 'a', false),
('c2', 'Welgate', 60300, 'a', false),
('c3', 'RWEN', 59000, 'a', false),
('c4', 'Susrutha', 53000, 'a', false),
('c5', 'Pole Marks', 42800, 'a', false),
('c6', 'S Team', 37880, 'a', false),
('c7', 'Perfect Interior', 31380, 'a', false),
('c8', 'Nova Innovation', 28000, 'a', false),
('c9', 'Parshi', 19375, 'a', false),
('c10', 'Pranalaya', 18349, 'a', false),
('c11', 'RRV', 12000, 'a', false),
('c12', 'Moon Holidays', 3925, 'a', false),
('c13', 'TWC', 43000, 'c', false)
ON CONFLICT (id) DO NOTHING;

-- Outflows
INSERT INTO outflows (id, item, amount, type) VALUES
('o1', 'Team salaries', 240000, 'business'),
('o2', 'Office rent', 18000, 'business'),
('o3', 'Space Bar / systems', 32800, 'business'),
('o4', 'Admin, power, water', 20000, 'business'),
('o5', 'Software and tools', 7394, 'business'),
('o6', 'Internet and phone', 5866, 'business'),
('o7', 'Cleaning', 3000, 'business'),
('o8', 'Car EMI', 32066, 'committed'),
('o9', 'Card minimums', 12000, 'committed'),
('o10', 'Personal living', 15000, 'committed')
ON CONFLICT (id) DO NOTHING;

-- Debt Ladder
INSERT INTO debt_ladder (id, order_num, name, amount, emi, rate, is_car) VALUES
('d1', 1, 'RBL card', 57598, 2500, '~40% a year', false),
('d2', 2, 'One Card', 49878, 2000, '~40% a year', false),
('d3', 3, 'Axis card', 41507, 1800, '~40% a year', false),
('d4', 4, 'SBI card', 25688, 1200, '~40% a year', false),
('d5', 5, 'Gold pledge, via Kannan', 220000, 2200, 'family gold at risk', false),
('d6', 6, 'Space Bar / systems', 229600, 32800, '₹32,800 × ~7 left', false),
('d7', 7, 'Sunny — expenses recognised now', 294000, 0, 'salary claim deferred', false),
('d8', 8, 'Vishnu, net of ₹25,000 back', 136000, 0, 'informal', false),
('d9', 9, 'Rohini, incl. rent', 105000, 0, 'informal', false),
('d10', 10, 'Sonu', 50000, 0, 'informal', false),
('d11', 11, 'Ramani', 50000, 0, 'informal', false),
('d12', 12, 'ICICI car loan', 2000000, 32066, '8.85% — car loan', true)
ON CONFLICT (id) DO NOTHING;

-- Team Members
INSERT INTO team_members (id, name, role, pay) VALUES
('tm1', 'Lead Developer', 'Full Stack Tech', 65000),
('tm2', 'Senior Designer', 'UI/UX Brand', 50000),
('tm3', 'Marketing Specialist', 'SEO & Performance', 45000),
('tm4', 'Account Executive', 'Client Success', 40000),
('tm5', 'Junior Content Writer', 'Copy & Social', 40000)
ON CONFLICT (id) DO NOTHING;

-- Scorecard
INSERT INTO scorecard (id, label, target, target_label, value) VALUES
('sc1', 'New conversations started', 5, '5', ''),
('sc2', 'Proposals sent', 2, '2', ''),
('sc3', 'Upsell conversations with clients', 2, '2', ''),
('sc4', 'Referrals asked for', 3, '3', ''),
('sc5', 'Collection calls made', 5, '5', ''),
('sc6', 'Money banked this week', 100000, '₹1L', '')
ON CONFLICT (id) DO NOTHING;

-- Phases
INSERT INTO phases (id, phase_num, timeline, title, done_looks_like, is_current) VALUES
('ph1', '1', 'Phase 1 · September – October · survive', 'Close the unknowns', 'October closes without new borrowing.', true),
('ph2', '2', 'Phase 2 · November – February · stabilise', 'Positive months, consecutively', '₹1L monthly surplus and a reserve.', false),
('ph3', '3', 'Phase 3 · March – August 2027 · build', 'Margin, then second income line', 'Debt-free except car.', false),
('ph4', '4', 'Phase 4 · September 2027 onward · compound', 'Assets that earn without you', 'Assets earning passively.', false)
ON CONFLICT (id) DO NOTHING;

-- Phase Items
INSERT INTO phase_items (id, phase_id, text, done) VALUES
('phi1', 'ph1', 'Collect ₹4L+ of the ₹7.2L outstanding', false),
('phi2', 'ph1', 'Size the GST position from April–July turnover', false),
('phi3', 'ph1', 'File INC-20A before 3 November', false),
('phi4', 'ph1', 'Convert all four cards to bank EMI', false),
('phi7', 'ph2', 'Collection above 85% for three months running', false),
('phi8', 'ph2', '₹1,00,000 of new recurring revenue added', false),
('phi13', 'ph3', '₹6.5–8L monthly billing with the same team', false),
('phi19', 'ph4', 'Property proceeds deployed to a plan written before money lands', false)
ON CONFLICT (id) DO NOTHING;

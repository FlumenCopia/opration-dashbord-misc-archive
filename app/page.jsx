'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Modal from '@/components/Modal';
import * as XLSX from 'xlsx';

export default function Dashboard() {
  const [hero, setHero] = useState({
    billed: 646617,
    banked: 179863,
    subtext: 'Misc Archive Private Limited. One obligation was being counted twice, and removing it puts the business at break-even. From here the whole outcome turns on a single number.',
    notice: 'At 28% collection you fail whatever else you do. At 85% you break even. At 90% plus ₹1L of new recurring revenue you build wealth. That is the entire business in one line.'
  });
  const [collections, setCollections] = useState([]);
  const [outflows, setOutflows] = useState([]);
  const [debtLadder, setDebtLadder] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState({ w1: [], w2: [] });
  const [datedItems, setDatedItems] = useState([]);
  const [scorecard, setScorecard] = useState([]);
  const [phases, setPhases] = useState([]);
  const [dayBoard, setDayBoard] = useState({ Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] });
  
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [curDay, setCurDay] = useState(DAYS[(new Date().getDay() + 6) % 7]);
  const [newDayTaskInput, setNewDayTaskInput] = useState('');

  const [activeTab, setActiveTab] = useState('p-now');
  const [statusMsg, setStatusMsg] = useState('Connecting to Supabase...');
  const [isLoading, setIsLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', content: null, onSave: null });

  // Format currency helper
  const inr = (n) => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');

  const showFlag = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => {
      setStatusMsg((prev) => (prev === msg ? 'Synced with Supabase DB' : prev));
    }, 3000);
  };

  // Fetch relational data from Supabase tables
  const loadData = async () => {
    try {
      const [
        { data: hData },
        { data: cData },
        { data: oData },
        { data: dData },
        { data: tmData },
        { data: tData },
        { data: dtData },
        { data: scData },
        { data: phData },
        { data: phiData },
        { data: dbData }
      ] = await Promise.all([
        supabase.from('hero_metrics').select('*').single(),
        supabase.from('collections').select('*').order('created_at', { ascending: true }),
        supabase.from('outflows').select('*').order('created_at', { ascending: true }),
        supabase.from('debt_ladder').select('*').order('order_num', { ascending: true }),
        supabase.from('team_members').select('*').order('created_at', { ascending: true }),
        supabase.from('tasks').select('*').order('created_at', { ascending: true }),
        supabase.from('dated_items').select('*').order('created_at', { ascending: true }),
        supabase.from('scorecard').select('*').order('created_at', { ascending: true }),
        supabase.from('phases').select('*'),
        supabase.from('phase_items').select('*'),
        supabase.from('day_board').select('*')
      ]);

      if (hData) setHero(hData);
      if (cData) setCollections(cData);
      if (oData) setOutflows(oData);
      if (dData) setDebtLadder(dData);
      if (tmData) setTeamMembers(tmData);
      if (dtData) setDatedItems(dtData);
      if (scData) setScorecard(scData);

      if (tData) {
        setTasks({
          w1: tData.filter(t => t.week_key === 'w1'),
          w2: tData.filter(t => t.week_key === 'w2')
        });
      }

      if (phData) {
        setPhases(phData.map(ph => ({
          ...ph,
          items: phiData ? phiData.filter(item => item.phase_id === ph.id) : []
        })));
      }

      if (dbData) {
        const grouped = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] };
        dbData.forEach(item => {
          if (grouped[item.day_key]) grouped[item.day_key].push(item);
        });
        setDayBoard(grouped);
      }

      setIsLoading(false);
      setStatusMsg('Relational Supabase DB Connected');
    } catch (err) {
      console.error('Relational fetch error:', err);
      setIsLoading(false);
      setStatusMsg('Offline / Fallback Mode');
    }
  };

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('public:relational_tables')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        loadData();
        showFlag('Realtime Update Synced!');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Modal Helpers
  const openModal = (title, content, onSave) => {
    setModalConfig({ isOpen: true, title, content, onSave });
  };
  const closeModal = () => {
    setModalConfig({ isOpen: false, title: '', content: null, onSave: null });
  };

  // Computations
  const billed = Number(hero?.billed || 0);
  const banked = Number(hero?.banked || 0);
  const bankedPct = billed > 0 ? Math.min(100, Math.round((banked / billed) * 100)) : 0;
  
  const bankedSum = collections.filter(c => c.done).reduce((acc, c) => acc + Number(c.amount || 0), 0);
  const grandSum = collections.reduce((acc, c) => acc + Number(c.amount || 0), 0);
  const gap85Pct = Math.round(billed * 0.85) - banked;

  const totalOutflow = outflows.reduce((acc, o) => acc + Number(o.amount || 0), 0);
  const debtExCar = debtLadder.filter(d => !d.is_car).reduce((acc, d) => acc + Number(d.amount || 0), 0);

  const salarySum = teamMembers.reduce((acc, m) => acc + Number(m.pay || 0), 0);
  const headCount = teamMembers.length;

  // Fixed Anchors for Day Board
  const ANCHORS = {
    Mon: ['06:30 Movement', '07:20 Morning brief', '09:00 Stand-up', '09:15 Money hour', '13:30 Collection calls', '18:00 Evening brief', '18:30 Hard stop'],
    Tue: ['06:30 Movement', '07:20 Morning brief', '09:00 Stand-up', '11:00 Client meeting', '13:30 Collection calls', '15:30 Client meeting', '18:00 Evening brief', '18:30 Hard stop'],
    Wed: ['06:30 Movement', '07:20 Morning brief', '09:00 Stand-up', '11:00 Client meeting', '13:30 Collection calls', '15:00 Delivery audit', '18:00 Evening brief', '18:30 Hard stop'],
    Thu: ['07:30 BNI Matrix', '09:15 Brief + stand-up', '10:00 New business — proposals out', '13:30 Collection calls', '14:00 BNI one-to-one', '15:30 Client meeting', '18:00 Evening brief', '18:30 Hard stop'],
    Fri: ['06:30 Movement', '07:20 Morning brief', '09:00 Stand-up', '11:00 Client meeting', '13:30 Collection calls', '16:00 Week close + scorecard', '18:00 Evening brief', '18:30 Hard stop'],
    Sat: ['09:00 One personal task, then off'],
    Sun: ['Off. Last Sunday of the month — day out, no laptop.']
  };

  // 13 WEEKS DATA
  const WEEKS = [
    ['1', 'Cash truth', 'Collections blitz on all thirteen. Cards converted to EMI. GST communicated to every client. April–July figures to the CA.'],
    ['2', 'Terms and team', 'New payment terms in writing everywhere. Rank all 13 on billing versus salary. Sunny’s number agreed and dated.'],
    ['3', 'Compliance', 'Subscription money in, INC-20A filed. Lawyer engaged on Thozhukkal. First GST invoices out clean.'],
    ['4', 'First upsells', 'Two existing clients offered a second service line. October close reviewed against the ₹3.86L baseline.'],
    ['5', 'Vertical positioning', 'Build the Ayurveda and wellness case study from Susrutha and Pranalaya. This is what lets you charge more.'],
    ['6', 'Pipeline build', 'Six proposals out using the vertical story. One BNI one-to-one every week from here.'],
    ['7', 'Delivery audit', 'Every client current. Fix anything slipping before it becomes a payment delay.'],
    ['8', 'First close', 'Target the first new retainer signed. Gold pledge cleared if collections held.'],
    ['9', 'Systems', 'Document the two processes only one person knows. Reduce single points of failure.'],
    ['10', 'Second close', 'Second retainer. Cards cleared. Reserve account opened, however small.'],
    ['11', 'Pricing', 'Review every client against the rate card. Dated increases at renewal for anyone below it.'],
    ['12', 'Quarter close', 'Full team matrix. Client profitability. Debt ladder recalculated on actual balances.'],
    ['13', 'Reset', 'Two days off. Then set the next quarter from real numbers instead of projections.']
  ];

  // EXPORTS
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const summaryData = [
      ['Metric', 'Value'],
      ['Billed Monthly Run Rate', billed],
      ['Banked Revenue', banked],
      ['Banked Percentage', `${bankedPct}%`],
      ['Subtext', hero.subtext || ''],
      ['Notice', hero.notice || '']
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(collections), 'Collections');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(outflows), 'Outflows');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(debtLadder), 'Debt Ladder');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teamMembers), 'Team');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([...tasks.w1, ...tasks.w2]), 'Tasks');
    XLSX.writeFile(wb, `misc-archive-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
    showFlag('Excel Report Exported!');
  };

  const exportToPDF = () => {
    window.print();
  };

  const downloadReport = () => {
    const L = [];
    L.push('MISC ARCHIVE PRIVATE LIMITED — OPERATING REPORT');
    L.push('Generated ' + new Date().toLocaleString('en-IN'));
    L.push('');
    L.push('COLLECTIONS');
    L.push(`  Collected: ${inr(bankedSum)} of ${inr(grandSum)} (${Math.round((bankedSum / (grandSum || 1)) * 100)}%)`);
    L.push(`  Outstanding: ${inr(grandSum - bankedSum)}`);
    L.push('');
    L.push('ACTION LISTS');
    L.push(`  Week 1: ${tasks.w1.filter(t => t.done).length} of ${tasks.w1.length} complete`);
    tasks.w1.forEach(t => L.push(`    [${t.done ? 'x' : ' '}] ${t.title}`));
    L.push(`  Week 2: ${tasks.w2.filter(t => t.done).length} of ${tasks.w2.length} complete`);
    tasks.w2.forEach(t => L.push(`    [${t.done ? 'x' : ' '}] ${t.title}`));
    L.push('');
    L.push('BASELINE');
    L.push('  Monthly committed outflow: ₹3,86,126');
    L.push(`  Billing run rate: ${inr(billed)}`);
    L.push(`  Banked revenue: ${inr(banked)}`);
    
    const blob = new Blob([L.join('\n')], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `misc-archive-report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    showFlag('Text Report Downloaded');
  };

  const downloadBackup = () => {
    const backup = { hero, collections, outflows, debtLadder, teamMembers, tasks, datedItems, scorecard, dayBoard };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `misc-archive-console-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    showFlag('JSON Backup Downloaded');
  };

  if (isLoading) {
    return (
      <div className="wrap" style={{ display: 'grid', placeItems: 'center', minHeight: '80vh' }}>
        <div className="block" style={{ textAlign: 'center', padding: '40px 60px' }}>
          <div className="pulse-badge" style={{ marginBottom: '16px' }}>
            <span className="pulse-dot"></span>
            Fetching relational tables from Supabase...
          </div>
          <h2>Operating Console</h2>
          <p className="muted small">Loading models: hero_metrics, collections, outflows, debt_ladder, team_members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      {/* HERO HEADER */}
      <header className="hero">
        <div className="hero-top">
          <div>
            <h1>Operating console</h1>
            <p className="tiny muted">Misc Archive Private Limited</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className="pulse-badge">
              <span className="pulse-dot"></span>
              {statusMsg}
            </span>
            <button className="ghost sm-btn" onClick={exportToExcel} style={{ borderColor: 'var(--teal)', color: 'var(--teal)', fontWeight: 600 }}>
              📊 Export Excel (.xlsx)
            </button>
            <button className="ghost sm-btn" onClick={exportToPDF} style={{ borderColor: 'var(--ochre)', color: 'var(--ochre)', fontWeight: 600 }}>
              📄 Export PDF Report
            </button>
            <button className="btn-primary sm-btn" onClick={() => editHeroStats()}>
              ✏️ Edit Hero Stats
            </button>
          </div>
        </div>

        <p className="hero-sub">{hero.subtext}</p>

        <div className="gapviz">
          <div className="gapbar">
            <span className="lbl">Billed</span>
            <div className="gaptrack">
              <div className="gapfill f-a" style={{ width: '100%' }}></div>
            </div>
            <span className="val">{inr(billed)}</span>
          </div>

          <div className="gapbar">
            <span className="lbl">Banked</span>
            <div className="gaptrack">
              <div className="gapfill f-b" style={{ width: `${bankedPct}%` }}></div>
            </div>
            <span className="val">{inr(banked)} ({bankedPct}%)</span>
          </div>

          <p className="tiny muted" style={{ marginTop: '4px' }}>
            {hero.notice} | <strong>85% Break-even Gap:</strong> {gap85Pct > 0 ? inr(gap85Pct) : 'Achieved!'}
          </p>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="tabs" role="tablist">
        {[
          { id: 'p-now', label: 'This week' },
          { id: 'p-board', label: 'Day board' },
          { id: 'p-cash', label: 'Cash' },
          { id: 'p-growth', label: 'Growth engine' },
          { id: 'p-90', label: '13 weeks' },
          { id: 'p-debt', label: 'Debt ladder' },
          { id: 'p-team', label: 'Team' },
          { id: 'p-rhythm', label: 'Rhythm' },
          { id: 'p-plan', label: 'The 4 phases' },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* TAB 1: THIS WEEK */}
      {activeTab === 'p-now' && (
        <section className="panel">
          <div className="callout red">
            <div className="block-header" style={{ marginBottom: '8px' }}>
              <h3>Dated items</h3>
              <button className="btn-edit sm-btn" onClick={() => addDatedItem()}>+ Add Item</button>
            </div>
            <p className="small" style={{ margin: '6px 0 12px' }}>
              <strong>3 Nov</strong> — INC-20A, ₹50,000 plus ₹1,000 per director per day after. <strong>5 Oct</strong> — first car EMI. <strong>10 Mar</strong> — Bajaj premium auto-debits ₹1,02,250 unless you decide otherwise. <strong>Thozhukkal title</strong> — no deadline, longest lead time, blocks the ₹1 crore sale until cleared.
            </p>
            {datedItems.map((it, idx) => (
              <div key={it.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '4px' }}>
                <div>
                  <strong>{it.date}: {it.title}</strong> — {it.details}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn-edit sm-btn" onClick={() => editDatedItem(it)}>✏️ Edit</button>
                  <button className="btn-danger sm-btn" onClick={() => deleteDatedItem(it.id)}>Del</button>
                </div>
              </div>
            ))}
          </div>

          <div className="block">
            <div className="block-header">
              <div>
                <h2>Week one</h2>
                <p className="small muted">None of this costs money. All of it is a phone call or an hour.</p>
              </div>
              <button className="btn-edit sm-btn" onClick={() => addTask('w1')}>+ Add Task</button>
            </div>
            {tasks.w1.map((t) => (
              <div key={t.id} className={`task ${t.done ? 'done' : ''}`}>
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={(e) => toggleTask(t.id, e.target.checked)}
                />
                <label>
                  <strong>{t.title}</strong>
                  <span className="why">{t.why}</span>
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn-edit sm-btn" onClick={() => editTaskItem(t)}>✏️ Edit</button>
                  <button className="btn-danger sm-btn" onClick={() => deleteTask(t.id)}>Del</button>
                </div>
              </div>
            ))}
            <div className="progress">
              <div style={{ width: `${tasks.w1.length > 0 ? Math.round((tasks.w1.filter(t => t.done).length / tasks.w1.length) * 100) : 0}%` }}></div>
            </div>
            <p className="tiny muted" style={{ marginTop: '6px' }}>
              {tasks.w1.filter(t => t.done).length} of {tasks.w1.length} done
            </p>
          </div>

          <div className="block">
            <div className="block-header">
              <h2>Week two</h2>
              <button className="btn-edit sm-btn" onClick={() => addTask('w2')}>+ Add Task</button>
            </div>
            {tasks.w2.map((t) => (
              <div key={t.id} className={`task ${t.done ? 'done' : ''}`}>
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={(e) => toggleTask(t.id, e.target.checked)}
                />
                <label>
                  <strong>{t.title}</strong>
                  <span className="why">{t.why}</span>
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn-edit sm-btn" onClick={() => editTaskItem(t)}>✏️ Edit</button>
                  <button className="btn-danger sm-btn" onClick={() => deleteTask(t.id)}>Del</button>
                </div>
              </div>
            ))}
            <div className="progress">
              <div style={{ width: `${tasks.w2.length > 0 ? Math.round((tasks.w2.filter(t => t.done).length / tasks.w2.length) * 100) : 0}%` }}></div>
            </div>
            <p className="tiny muted" style={{ marginTop: '6px' }}>
              {tasks.w2.filter(t => t.done).length} of {tasks.w2.length} done
            </p>
          </div>
        </section>
      )}

      {/* TAB 2: DAY BOARD */}
      {activeTab === 'p-board' && (
        <section className="panel">
          <div className="block">
            <h2>Day board</h2>
            <p className="small muted">Your own tasks, per day, saved between sessions. The fixed anchors below each day come from the calendar and do not move.</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '14px 0 16px' }}>
              {DAYS.map((d) => (
                <button
                  key={d}
                  className="ghost"
                  onClick={() => setCurDay(d)}
                  style={d === curDay ? { borderColor: 'var(--teal)', color: 'var(--teal)', fontWeight: '600' } : {}}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="daybox" style={{ margin: '12px 0' }}>
              <h3>{curDay} — fixed anchors</h3>
              {(ANCHORS[curDay] || []).map((a, idx) => {
                const p = a.indexOf(' ');
                return (
                  <div className="slot" key={idx}>
                    <span className="t">{a.slice(0, p)}</span>
                    <span>{a.slice(p + 1)}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '20px' }}>
              <h3>{curDay} tasks</h3>
              {(dayBoard[curDay] || []).length === 0 ? (
                <p className="small muted" style={{ padding: '10px 0' }}>No custom tasks yet for {curDay}. Add one below!</p>
              ) : (
                (dayBoard[curDay] || []).map((t, idx) => (
                  <div key={t.id || idx} className={`task ${t.done ? 'done' : ''}`}>
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={(e) => toggleDayTask(t.id, e.target.checked)}
                    />
                    <label>{t.text}</label>
                    <button className="btn-danger sm-btn" onClick={() => deleteDayTask(t.id)}>Remove</button>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <input
                type="text"
                placeholder={`Add a task for ${curDay}`}
                value={newDayTaskInput}
                onChange={(e) => setNewDayTaskInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addDayTask()}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--ink)', borderRadius: 'var(--radius-sm)' }}
              />
              <button className="btn-primary sm-btn" onClick={addDayTask}>Add Task</button>
            </div>
            <p className="tiny muted" style={{ marginTop: '10px' }}>Tasks carry over until you tick or remove them. Use “Download report” below to export.</p>
          </div>
        </section>
      )}

      {/* TAB 3: CASH */}
      {activeTab === 'p-cash' && (
        <section className="panel">
          <div className="block">
            <div className="block-header">
              <div>
                <h2>Collections board</h2>
                <p className="small muted">{inr(grandSum - bankedSum)} outstanding. Tick when the money lands in the bank, not when it is promised.</p>
              </div>
              <button className="btn-edit sm-btn" onClick={() => addCollection()}>+ Add Client</button>
            </div>

            <div className="progress" style={{ margin: '12px 0' }}>
              <div style={{ width: `${grandSum > 0 ? Math.round((bankedSum / grandSum) * 100) : 0}%` }}></div>
            </div>
            <p className="small" style={{ marginBottom: '14px' }}>
              <strong>{inr(bankedSum)}</strong> of {inr(grandSum)} <span className="muted">— {grandSum > 0 ? Math.round((bankedSum / grandSum) * 100) : 0}%</span>
            </p>
            <div className="rule"></div>

            <table>
              <thead>
                <tr>
                  <th>Paid</th>
                  <th>Client</th>
                  <th className="n">Amount</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={c.done}
                        onChange={(e) => toggleCollection(c.id, e.target.checked)}
                      />
                    </td>
                    <td><strong>{c.name}</strong></td>
                    <td className="n">{inr(c.amount)}</td>
                    <td>
                      <span className={`tagl ${c.category === 'c' ? 'c' : 'a'}`}>
                        {c.category === 'c' ? 'doubtful' : 'collectible'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button className="btn-edit sm-btn" onClick={() => editCollectionItem(c)}>✏️ Edit</button>
                        <button className="btn-danger sm-btn" onClick={() => deleteCollection(c.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid2">
            <div className="block">
              <div className="block-header">
                <h3>Monthly outflow from October</h3>
                <button className="btn-edit sm-btn" onClick={() => addOutflow()}>+ Add Outflow</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Commitment</th>
                    <th className="n">Monthly Cost</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {outflows.map((o) => (
                    <tr key={o.id}>
                      <td>{o.item}</td>
                      <td className="n">{inr(o.amount)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          <button className="btn-edit sm-btn" onClick={() => editOutflowItem(o)}>✏️ Edit</button>
                          <button className="btn-danger sm-btn" onClick={() => deleteOutflow(o.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="total">
                    <td>Total Outflows</td>
                    <td className="n">{inr(totalOutflow)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
              <p className="tiny muted" style={{ marginTop: '10px' }}>The ₹30,472 computer EMI is the same obligation as Space Bar and has been removed. Two entries, one debt.</p>
            </div>

            <div className="block">
              <h3>Break-even, narrowly</h3>
              <div className="grid3" style={{ margin: '14px 0' }}>
                <div className="stat"><span class="k">₹3.86L</span><span className="l">Needed monthly</span></div>
                <div className="stat"><span class="k">₹3.77L</span><span className="l">Landing at 85% collection</span></div>
                <div className="stat warn"><span class="k">–₹9,000</span><span className="l">Monthly gap</span></div>
              </div>
              <p className="small">Nine thousand rupees is a rounding error, not a crisis. It also means zero margin for a late payer, a bad month, or one client leaving. The target is not break-even. It is ₹1,00,000 a month of surplus, which comes from collection discipline plus ₹1L of new recurring revenue.</p>
              <div className="rule"></div>
              <h3>Cash rules</h3>
              <ul className="plain small">
                <li>Salary money is ring-fenced the day it arrives</li>
                <li>No new monthly commitment until three consecutive positive months</li>
                <li>100% advance for month one, every client, no exception</li>
                <li>Personal and company money cross only through a written director's loan entry</li>
              </ul>
            </div>
          </div>

          <div className="block">
            <h3>GST, from this month</h3>
            <ul className="plain small">
              <li><strong>Charge on top, not absorbed.</strong> Your published terms state prices exclude applicable taxes. Say so explicitly when you tell clients. Absorbing 18% is a 15.25% revenue cut, roughly ₹67,000 a month, and it turns break-even into a hole.</li>
              <li><strong>Claim input credit</strong> on software, rent, internet and equipment. Likely ₹5,000–8,000 a month recovered.</li>
              <li><strong>The open question is backward, not forward.</strong> If turnover crossed ₹20 lakh earlier in the financial year, liability runs from the crossing date, not the registration date. April–July figures settle it.</li>
              <li><strong>Returns are now a monthly obligation.</strong> Late filing carries daily penalties and blocks input credit. This is what the 20th on the calendar is for.</li>
            </ul>
          </div>
        </section>
      )}

      {/* TAB 4: GROWTH ENGINE */}
      {activeTab === 'p-growth' && (
        <section className="panel">
          <div className="block">
            <h2>The target, in units of work</h2>
            <p className="small">₹1,00,000 of new monthly recurring revenue is four retainers at ₹25,000. At a 25% close rate that needs 16 proposals. Over a quarter that is <strong>5–6 proposals a month</strong>, or <strong>one qualified conversation every three days</strong>.</p>
            <div className="grid3" style={{ marginTop: '14px' }}>
              <div className="stat"><span className="k">16</span><span className="l">Proposals per quarter</span></div>
              <div className="stat"><span className="k">5–6</span><span className="l">Proposals per month</span></div>
              <div className="stat"><span className="k">4</span><span className="l">New retainers needed</span></div>
            </div>
          </div>

          <div className="block">
            <h2>Weekly scorecard</h2>
            <p className="small muted">Fill in every Friday. Six inputs. Activity is controllable, revenue is not — weeks where all six hit target produce months that look after themselves.</p>
            <div style={{ marginTop: '12px' }}>
              {scorecard.map((sc) => {
                const valNum = parseFloat(sc.value || 0);
                const isMet = valNum >= Number(sc.target);
                return (
                  <div key={sc.id} className="score">
                    <label>{sc.label}</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={sc.value || ''}
                      onChange={(e) => updateScorecardVal(sc.id, e.target.value)}
                    />
                    <span className={`tgt ${isMet ? 'met' : ''}`}>{sc.target_label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid2">
            <div className="block">
              <h3>Where the four clients come from</h3>
              <ol className="steps">
                <li><strong>Upsell what you already have.</strong> Thirteen live clients on one service line each. A digital marketing client never offered SEO or SAG·EO is the easiest sale in the business — no pitching, no trust-building, no acquisition cost. Two upsell conversations a month.</li>
                <li><strong>Own the wellness vertical.</strong> Susrutha, Pranalaya, Ayushi. Three Ayurveda and wellness clients is not coincidence, it is a specialism with proof. "We run digital for Ayurveda hospitals in Kerala" beats "we do digital marketing", and it lets you charge more.</li>
                <li><strong>BNI, used properly.</strong> You are Social Media Coordinator at Matrix — a room of business owners who see your work weekly. One structured one-to-one a week with someone you have never pitched.</li>
                <li><strong>Referrals, asked for on a schedule.</strong> Every client who says something positive gets asked the same day who else you should be talking to. Most agencies never ask.</li>
                <li><strong>Cold outreach, narrow only.</strong> Into verticals where you hold a case study — education after iLearn, real estate after Masters, interiors after Perfect Interior. Never generic.</li>
              </ol>
            </div>

            <div className="block">
              <h3>The revenue ladder</h3>
              <p className="small">Each rung is more durable than the one below. Climb in order — skipping to the top is what stalled Floxa.</p>
              <table>
                <tbody>
                  <tr><td>Project work</td><td><span className="tagl c">paid once</span></td></tr>
                  <tr><td>Monthly retainers</td><td><span className="tagl b">predictable</span></td></tr>
                  <tr><td>Multi-service accounts</td><td><span className="tagl b">harder to leave</span></td></tr>
                  <tr><td>SAG·EO as a named product</td><td><span className="tagl a">premium, proprietary</span></td></tr>
                  <tr><td>COSMICX, second market</td><td><span className="tagl a">new customer base</span></td></tr>
                  <tr><td>Software subscriptions</td><td><span className="tagl a">earns without you</span></td></tr>
                </tbody>
              </table>
              <div className="rule"></div>
              <p className="small"><strong>Concentration.</strong> Masters is ₹2.5L of a ₹7.2L book. Once past survival, no single client above 20% of monthly revenue.</p>
            </div>
          </div>

          <div className="block">
            <h3>Assets, built from surplus only</h3>
            <p className="small">Nothing here starts until three consecutive positive months. Building assets from borrowed money is what created the current position.</p>
            <ol className="steps">
              <li><strong>One month of payroll in reserve.</strong> ₹2.4 lakh, separate account, untouched. This is the first asset and the one that ends the cycle of pledging gold to make salaries.</li>
              <li><strong>Clear the 40% debt.</strong> Paying off a card returns 40% guaranteed. No investment available to you beats that.</li>
              <li><strong>Three months of expenses.</strong> ₹11.5 lakh. The business now survives a bad quarter without you funding it personally.</li>
              <li><strong>Systematic investing, small and automatic.</strong> ₹10,000 a month on a standing instruction. The amount is irrelevant; the habit and the date are the point.</li>
              <li><strong>Property proceeds, deployed to a plan written before the money lands.</strong> Liabilities, buffer, Section 54 reinvestment, then growth. Money that arrives without a plan gets spent.</li>
              <li><strong>Three income sources:</strong> services, products, capital. That is what makes wealth durable rather than a good year.</li>
            </ol>
          </div>
        </section>
      )}

      {/* TAB 5: 13 WEEKS */}
      {activeTab === 'p-90' && (
        <section className="panel">
          <div className="block">
            <h2>Thirteen weeks</h2>
            <p className="small muted">One theme per week. The daily rhythm runs underneath all of them without changing.</p>
          </div>
          {WEEKS.map((w, idx) => (
            <div key={idx} className="wk">
              <span className="wknum">Week {w[0]}</span>
              <h3>{w[1]}</h3>
              <p className="small" style={{ margin: '4px 0 0' }}>{w[2]}</p>
            </div>
          ))}
        </section>
      )}

      {/* TAB 6: DEBT LADDER */}
      {activeTab === 'p-debt' && (
        <section className="panel">
          <div className="block">
            <div className="block-header">
              <div>
                <h2>Where the debt sits</h2>
                <p className="small muted">Structured debt ladder order & monthly carry cost</p>
              </div>
              <button className="btn-edit sm-btn" onClick={() => addDebtItem()}>+ Add Debt</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Obligation</th>
                  <th className="n">Amount</th>
                  <th className="n">EMI / Month</th>
                  <th>Cost of carrying it</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {debtLadder.map((d) => (
                  <tr key={d.id}>
                    <td className="num">{d.order_num}</td>
                    <td><strong>{d.name}</strong></td>
                    <td className="n">{inr(d.amount)}</td>
                    <td className="n">{inr(d.emi)}</td>
                    <td><span className={`tagl ${d.is_car ? 'a' : 'b'}`}>{d.rate}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button className="btn-edit sm-btn" onClick={() => editDebtItemDetails(d)}>✏️ Edit</button>
                        <button className="btn-danger sm-btn" onClick={() => deleteDebtItem(d.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="total">
                  <td colSpan="2">Total Debt (excl. Car)</td>
                  <td className="n">{inr(debtExCar)}</td>
                  <td colSpan="3"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid2">
            <div className="block">
              <h3>Your order</h3>
              <ol className="steps">
                <li>Kannan ₹2,20,000 — releases the family gold</li>
                <li>Ramani ₹50,000</li>
                <li>Credit cards ₹1,74,671</li>
                <li>Space Bar, then Sonu, Vishnu, Rohini, Sunny</li>
                <li>Car loan last</li>
              </ol>
            </div>

            <div className="block">
              <h3>What that order costs</h3>
              <p className="small">Cards burn about <strong>₹5,800 a month</strong> at 40%. A gold pledge at 12% on ₹2.2 lakh burns about <strong>₹2,200</strong>. Gold first costs roughly ₹3,600 a month — a defensible price for protecting family gold, as long as it is a choice and not an accident.</p>
              <div className="callout" style={{ marginBottom: 0 }}>
                <p className="small" style={{ margin: 0 }}><strong>Ask first:</strong> ₹2.2 lakh borrowed against ₹10 lakh of gold is 22% loan-to-value, where lenders go to 75%. Partial repayment should free far more gold than it costs. If partial release works, you protect the gold and clear the cards, and the trade-off disappears.</p>
              </div>
            </div>
          </div>

          <div className="block">
            <h3>Convert the cards this month</h3>
            <p class="small">₹1,74,671 at ~40% costs ₹69,900 a year. The same balance at 15% on a bank EMI plan costs ₹26,200. <strong>Four phone calls, ₹43,700 a year.</strong> The highest return per hour anywhere in this file.</p>
          </div>

          <div className="block">
            <h3>Two rules for the rolling gold buffer</h3>
            <p className="small">Releasing ₹70,000 a month as an EMI backstop will get you through a bad month, and it is also how family gold becomes permanently pledged. Set a written cap on total gold pledged at any one time, and attach a repayment date to every draw before you take it. A buffer without an exit date is not a buffer.</p>
          </div>
        </section>
      )}

      {/* TAB 7: TEAM */}
      {activeTab === 'p-team' && (
        <section className="panel">
          <div className="block">
            <h2>Thirteen people, ₹2,22,000</h2>
            <div className="grid3" style={{ margin: '14px 0' }}>
              <div className="stat"><span className="k">{inr(headCount > 0 ? billed / headCount : 0)}</span><span className="l">Billed per head</span></div>
              <div className="stat neg"><span className="k">{salarySum > 0 ? (billed / salarySum).toFixed(1) : 0}×</span><span className="l">Revenue to salary today</span></div>
              <div className="stat"><span className="k">3.0×</span><span className="l">Where an agency is safe</span></div>
            </div>
            <p className="small">At 3× this team supports itself at ₹6.66 lakh of billing. You are at ₹4.44 lakh. The gap is ₹2.2 lakh of revenue, or four people, or a mix. You raised payroll deliberately to buy capability — treat this as a revenue target first and a headcount question second.</p>
          </div>

          <div className="grid2">
            <div className="block">
              <div className="block-header">
                <h2>Team Roster</h2>
                <button className="btn-edit sm-btn" onClick={() => addTeamMember()}>+ Add Member</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th className="n">Monthly Pay</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((m) => (
                    <tr key={m.id}>
                      <td><strong>{m.name}</strong></td>
                      <td>{m.role}</td>
                      <td className="n">{inr(m.pay)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          <button className="btn-edit sm-btn" onClick={() => editTeamMemberDetails(m)}>✏️ Edit</button>
                          <button className="btn-danger sm-btn" onClick={() => deleteTeamMember(m.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="total">
                    <td colSpan="2">Total Payroll ({headCount} heads)</td>
                    <td className="n">{inr(salarySum)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="block">
              <h3>The matrix — every person, every quarter</h3>
              <table>
                <thead>
                  <tr><th>Signal</th><th>Reading</th><th>Action</th></tr>
                </thead>
                <tbody>
                  <tr><td>Bills 3×+, clients ask for them</td><td><span className="tagl a">Anchor</span></td><td>Raise before they ask. Add responsibility.</td></tr>
                  <tr><td>Bills 2–3×, delivery reliable</td><td><span className="tagl a">Core</span></td><td>Keep. One measurable target this quarter.</td></tr>
                  <tr><td>Bills 1.5–2×, underloaded</td><td><span className="tagl b">Underused</span></td><td>Load them before hiring anyone.</td></tr>
                  <tr><td>Under 1.5×, output needs rework</td><td><span className="tagl b">On notice</span></td><td>Written 30-day expectation.</td></tr>
                  <tr><td>Still under after 30 days</td><td><span className="tagl c">Exit</span></td><td>Settle in full, in writing.</td></tr>
                  <tr><td>Only person who can do a thing</td><td><span className="tagl c">Single point</span></td><td>Document process this month.</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="block">
            <h3>Equity and salary, from here</h3>
            <p className="small">Shares already filed at MCA cannot be reversed unilaterally — a transfer needs the holder's signature. The reset applies forward. One rule prevents a repeat: <strong>no equity without either capital in or a written vesting agreement tied to time and milestones.</strong></p>
            <p className="small">Unpaid salary is a statutory claim regardless of goodwill or shareholding. Acknowledge the number in writing and attach a date tied to profitability. An acknowledged deferred debt is safe; an unacknowledged one becomes a dispute.</p>
          </div>
        </section>
      )}

      {/* TAB 8: RHYTHM */}
      {activeTab === 'p-rhythm' && (
        <section className="panel">
          <div className="block">
            <h2>The day</h2>
            <p className="small muted">Built for 7.5 hours of sleep and a hard stop. The previous version assumed 60+ hours indefinitely, and that is what broke the last cycle.</p>
            <div className="grid2" style={{ marginTop: '14px' }}>
              <div className="daybox">
                <h3>Weekday</h3>
                <div className="slot"><span className="t">06:30</span><span>Wake. Move for 30 minutes.</span></div>
                <div className="slot"><span className="t">07:30</span><span>Bank balances and overnight receipts. Two minutes.</span></div>
                <div className="slot"><span className="t">09:00</span><span>Stand-up, 15 minutes, standing. Blockers only.</span></div>
                <div className="slot"><span className="t">09:15</span><span>Deep work — the one thing that matters today.</span></div>
                <div className="slot"><span className="t">12:30</span><span>Lunch, away from the desk.</span></div>
                <div className="slot"><span className="t">13:30</span><span>Collection calls, then sales calls. Never skipped.</span></div>
                <div className="slot"><span className="t">15:00</span><span>Client delivery and review.</span></div>
                <div className="slot"><span className="t">17:00</span><span>Team, one-to-ones, unblocking.</span></div>
                <div className="slot"><span className="t">18:00</span><span>Log cash in and out. Set tomorrow's one thing.</span></div>
                <div className="slot"><span className="t">18:30</span><span>Stop. Laptop closed.</span></div>
                <div className="slot"><span className="t">23:00</span><span>Sleep.</span></div>
              </div>

              <div className="daybox">
                <h3>The week</h3>
                <div className="slot"><span className="t">Mon</span><span>09:15 money hour — ageing, bank position, week plan.</span></div>
                <div className="slot"><span className="t">Tue</span><span>11:00 & 15:30 client meetings. Relationship before invoice.</span></div>
                <div className="slot"><span className="t">Wed</span><span>11:00 client meeting · 15:00 delivery audit with leads.</span></div>
                <div className="slot"><span className="t">Thu</span><span>07:30 BNI · 10:00 new business · 14:00 1-2-1 · 15:30 client.</span></div>
                <div className="slot"><span className="t">Fri</span><span>11:00 client meeting · 16:00 scorecard and week close.</span></div>
                <div className="slot"><span className="t">Sat</span><span>One personal task, then off.</span></div>
                <div className="slot"><span className="t">Sun</span><span>Off. Last Sunday of the month, day out no laptop.</span></div>
                <div className="slot"><span className="t">Quarterly</span><span>Three days away, Sat to Mon, booked 2 weeks ahead.</span></div>
              </div>
            </div>
          </div>

          <div className="grid2">
            <div className="block">
              <h3>The month</h3>
              <div className="slot"><span className="t">1st</span><span>Salaries out, before anything else leaves.</span></div>
              <div className="slot"><span className="t">3rd</span><span>Last month closed: billed, collected, spent, kept.</span></div>
              <div className="slot"><span className="t">5th</span><span>Retainers due. Chase on the 6th.</span></div>
              <div className="slot"><span className="t">10th</span><span>Ageing review. Past 45 days escalates.</span></div>
              <div className="slot"><span className="t">15th</span><span>Debt payment day. One line off the ladder.</span></div>
              <div className="slot"><span className="t">20th</span><span>CA call and GST return. Non-negotiable now.</span></div>
              <div className="slot"><span className="t">25th</span><span>Next month forecast and hiring check.</span></div>
              <div className="slot"><span className="t">Last</span><span>One-to-ones. Run the matrix.</span></div>
            </div>

            <div className="block">
              <h3>The quarter</h3>
              <ul className="plain small">
                <li>Team matrix, everyone, written</li>
                <li>Client profitability after delivery hours</li>
                <li>Price review against the rate card</li>
                <li>Debt ladder recalculated on actual balances</li>
                <li>One skill invested in</li>
                <li>Two days completely away</li>
              </ul>
              <div className="rule"></div>
              <p className="small"><strong>Six numbers, monthly, and only these six:</strong> cash in bank, collection rate, billing, total debt, revenue per head, months of runway.</p>
            </div>
          </div>
        </section>
      )}

      {/* TAB 9: THE 4 PHASES */}
      {activeTab === 'p-plan' && (
        <section className="panel">
          <div className="block">
            <h2>The 4 Strategic Phases</h2>
            {phases.map((ph) => (
              <div key={ph.id} className={`phase ${ph.is_current ? 'now' : ''}`}>
                <p className="when">{ph.timeline}</p>
                <h2>{ph.title}</h2>
                <ul className="plain small" style={{ marginTop: '8px' }}>
                  {(ph.items || []).map((it) => (
                    <li key={it.id}>• {it.text}</li>
                  ))}
                </ul>
                <p className="small muted" style={{ marginTop: '8px' }}>
                  <strong>Done looks like:</strong> {ph.done_looks_like}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FOOTER ACTION BAR */}
      <div className="resetbar">
        <button className="ghost" onClick={exportToExcel} style={{ borderColor: 'var(--teal)', color: 'var(--teal)', fontWeight: 600 }}>
          📊 Export Excel (.xlsx)
        </button>
        <button className="ghost" onClick={exportToPDF} style={{ borderColor: 'var(--ochre)', color: 'var(--ochre)', fontWeight: 600 }}>
          📄 Export PDF Report
        </button>
        <button className="ghost" onClick={downloadReport}>
          📥 Download Report (.txt)
        </button>
        <button className="ghost" onClick={downloadBackup}>
          💾 Download Data (.json)
        </button>
        <button className="ghost" onClick={clearAllEntries} style={{ borderColor: 'var(--oxide)', color: 'var(--oxide)' }}>
          🗑️ Reset Data
        </button>
        <span className="saveflag">{statusMsg}</span>
      </div>

      {/* CRUD MODAL */}
      <Modal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        onClose={closeModal}
        onSubmit={() => {
          if (modalConfig.onSave) modalConfig.onSave();
          closeModal();
        }}
      >
        {modalConfig.content}
      </Modal>
    </div>
  );

  // --- CRUD ACTIONS ---
  async function editHeroStats() {
    let bVal = hero.billed;
    let kVal = hero.banked;
    let sub = hero.subtext || '';
    let not = hero.notice || '';

    openModal(
      'Edit Hero Financial Stats',
      (
        <>
          <div className="form-group"><label>Billed Monthly Run Rate (₹)</label><input type="number" defaultValue={bVal} onChange={(e) => (bVal = e.target.value)} /></div>
          <div className="form-group"><label>Banked Monthly Revenue (₹)</label><input type="number" defaultValue={kVal} onChange={(e) => (kVal = e.target.value)} /></div>
          <div className="form-group"><label>Headline Subtext</label><textarea defaultValue={sub} onChange={(e) => (sub = e.target.value)} /></div>
          <div className="form-group"><label>Critical Notice Banner</label><textarea defaultValue={not} onChange={(e) => (not = e.target.value)} /></div>
        </>
      ),
      async () => {
        const payload = { id: 'main', billed: Number(bVal), banked: Number(kVal), subtext: sub, notice: not };
        setHero(payload);
        await supabase.from('hero_metrics').upsert(payload);
        showFlag('Hero Metrics Saved');
      }
    );
  }

  async function addDatedItem() {
    let date = '', title = '', details = '';
    openModal(
      'Add Dated & Critical Item',
      (
        <>
          <div className="form-group"><label>Date / Deadline</label><input type="text" onChange={(e) => (date = e.target.value)} /></div>
          <div className="form-group"><label>Title</label><input type="text" onChange={(e) => (title = e.target.value)} /></div>
          <div className="form-group"><label>Details</label><textarea onChange={(e) => (details = e.target.value)} /></div>
        </>
      ),
      async () => {
        const item = { id: 'dt_' + Date.now(), date, title, details, urgent: true };
        setDatedItems([...datedItems, item]);
        await supabase.from('dated_items').insert(item);
        showFlag('Item Added');
      }
    );
  }
  async function editDatedItem(item) {
    let date = item.date, title = item.title, details = item.details;
    openModal(
      'Edit Dated & Critical Item',
      (
        <>
          <div className="form-group"><label>Date / Deadline</label><input type="text" defaultValue={date} onChange={(e) => (date = e.target.value)} /></div>
          <div className="form-group"><label>Title</label><input type="text" defaultValue={title} onChange={(e) => (title = e.target.value)} /></div>
          <div className="form-group"><label>Details</label><textarea defaultValue={details} onChange={(e) => (details = e.target.value)} /></div>
        </>
      ),
      async () => {
        const payload = { ...item, date, title, details };
        setDatedItems(datedItems.map(it => it.id === item.id ? payload : it));
        await supabase.from('dated_items').update(payload).eq('id', item.id);
        showFlag('Item Updated');
      }
    );
  }
  async function deleteDatedItem(id) {
    setDatedItems(datedItems.filter(it => it.id !== id));
    await supabase.from('dated_items').delete().eq('id', id);
    showFlag('Item Deleted');
  }

  async function addTask(week_key) {
    let title = '', why = '';
    openModal(
      `Add ${week_key === 'w1' ? 'Week One' : 'Week Two'} Task`,
      (
        <>
          <div className="form-group"><label>Task Title</label><input type="text" onChange={(e) => (title = e.target.value)} /></div>
          <div className="form-group"><label>Why / Rationale</label><textarea onChange={(e) => (why = e.target.value)} /></div>
        </>
      ),
      async () => {
        const item = { id: `${week_key}_` + Date.now(), week_key, title, why, done: false };
        setTasks({ ...tasks, [week_key]: [...tasks[week_key], item] });
        await supabase.from('tasks').insert(item);
        showFlag('Task Added');
      }
    );
  }
  async function editTaskItem(t) {
    let title = t.title, why = t.why;
    openModal(
      'Edit Task Action',
      (
        <>
          <div className="form-group"><label>Task Title</label><input type="text" defaultValue={title} onChange={(e) => (title = e.target.value)} /></div>
          <div className="form-group"><label>Why / Rationale</label><textarea defaultValue={why} onChange={(e) => (why = e.target.value)} /></div>
        </>
      ),
      async () => {
        const payload = { ...t, title, why };
        setTasks({
          w1: tasks.w1.map(x => x.id === t.id ? payload : x),
          w2: tasks.w2.map(x => x.id === t.id ? payload : x)
        });
        await supabase.from('tasks').update({ title, why }).eq('id', t.id);
        showFlag('Task Updated');
      }
    );
  }
  async function toggleTask(id, done) {
    setTasks({
      w1: tasks.w1.map(t => (t.id === id ? { ...t, done } : t)),
      w2: tasks.w2.map(t => (t.id === id ? { ...t, done } : t))
    });
    await supabase.from('tasks').update({ done }).eq('id', id);
  }
  async function deleteTask(id) {
    setTasks({
      w1: tasks.w1.filter(t => t.id !== id),
      w2: tasks.w2.filter(t => t.id !== id)
    });
    await supabase.from('tasks').delete().eq('id', id);
  }

  // Day Board Tasks
  async function addDayTask() {
    if (!newDayTaskInput.trim()) return;
    const item = { id: 'db_' + Date.now(), day_key: curDay, text: newDayTaskInput.trim(), done: false };
    const updated = { ...dayBoard, [curDay]: [...(dayBoard[curDay] || []), item] };
    setDayBoard(updated);
    setNewDayTaskInput('');
    await supabase.from('day_board').insert(item);
    showFlag('Day Task Added');
  }
  async function toggleDayTask(id, done) {
    const updated = {
      ...dayBoard,
      [curDay]: (dayBoard[curDay] || []).map(t => t.id === id ? { ...t, done } : t)
    };
    setDayBoard(updated);
    await supabase.from('day_board').update({ done }).eq('id', id);
  }
  async function deleteDayTask(id) {
    const updated = {
      ...dayBoard,
      [curDay]: (dayBoard[curDay] || []).filter(t => t.id !== id)
    };
    setDayBoard(updated);
    await supabase.from('day_board').delete().eq('id', id);
  }

  // Collections
  async function addCollection() {
    let name = '', amount = 0, category = 'a';
    openModal(
      'Add Retainer Client Collection',
      (
        <>
          <div className="form-group"><label>Client Name</label><input type="text" onChange={(e) => (name = e.target.value)} /></div>
          <div className="form-group"><label>Amount (₹)</label><input type="number" onChange={(e) => (amount = e.target.value)} /></div>
          <div className="form-group">
            <label>Category</label>
            <select onChange={(e) => (category = e.target.value)}>
              <option value="a">Collectible</option>
              <option value="c">Doubtful</option>
            </select>
          </div>
        </>
      ),
      async () => {
        const item = { id: 'col_' + Date.now(), name, amount: Number(amount), category, done: false };
        setCollections([...collections, item]);
        await supabase.from('collections').insert(item);
        showFlag('Collection Added');
      }
    );
  }
  async function editCollectionItem(c) {
    let name = c.name, amount = c.amount, category = c.category;
    openModal(
      'Edit Retainer Collection',
      (
        <>
          <div className="form-group"><label>Client Name</label><input type="text" defaultValue={name} onChange={(e) => (name = e.target.value)} /></div>
          <div className="form-group"><label>Amount (₹)</label><input type="number" defaultValue={amount} onChange={(e) => (amount = e.target.value)} /></div>
          <div className="form-group">
            <label>Category</label>
            <select defaultValue={category} onChange={(e) => (category = e.target.value)}>
              <option value="a">Collectible</option>
              <option value="c">Doubtful</option>
            </select>
          </div>
        </>
      ),
      async () => {
        const payload = { ...c, name, amount: Number(amount), category };
        setCollections(collections.map(x => x.id === c.id ? payload : x));
        await supabase.from('collections').update({ name, amount: Number(amount), category }).eq('id', c.id);
        showFlag('Collection Updated');
      }
    );
  }
  async function toggleCollection(id, done) {
    setCollections(collections.map(c => (c.id === id ? { ...c, done } : c)));
    await supabase.from('collections').update({ done }).eq('id', id);
  }
  async function deleteCollection(id) {
    setCollections(collections.filter(c => c.id !== id));
    await supabase.from('collections').delete().eq('id', id);
  }

  // Outflows
  async function addOutflow() {
    let item = '', amount = 0;
    openModal(
      'Add Monthly Outflow Commitment',
      (
        <>
          <div className="form-group"><label>Expense Name</label><input type="text" onChange={(e) => (item = e.target.value)} /></div>
          <div className="form-group"><label>Monthly Cost (₹)</label><input type="number" onChange={(e) => (amount = e.target.value)} /></div>
        </>
      ),
      async () => {
        const payload = { id: 'out_' + Date.now(), item, amount: Number(amount), type: 'business' };
        setOutflows([...outflows, payload]);
        await supabase.from('outflows').insert(payload);
        showFlag('Outflow Added');
      }
    );
  }
  async function editOutflowItem(o) {
    let item = o.item, amount = o.amount;
    openModal(
      'Edit Monthly Outflow',
      (
        <>
          <div className="form-group"><label>Expense Name</label><input type="text" defaultValue={item} onChange={(e) => (item = e.target.value)} /></div>
          <div className="form-group"><label>Monthly Cost (₹)</label><input type="number" defaultValue={amount} onChange={(e) => (amount = e.target.value)} /></div>
        </>
      ),
      async () => {
        const payload = { ...o, item, amount: Number(amount) };
        setOutflows(outflows.map(x => x.id === o.id ? payload : x));
        await supabase.from('outflows').update({ item, amount: Number(amount) }).eq('id', o.id);
        showFlag('Outflow Updated');
      }
    );
  }
  async function deleteOutflow(id) {
    setOutflows(outflows.filter(o => o.id !== id));
    await supabase.from('outflows').delete().eq('id', id);
  }

  // Debt Ladder
  async function addDebtItem() {
    let name = '', amount = 0, emi = 0, rate = 'EMI';
    openModal(
      'Add Debt Entry',
      (
        <>
          <div className="form-group"><label>Creditor Name</label><input type="text" onChange={(e) => (name = e.target.value)} /></div>
          <div className="form-group"><label>Principal Balance (₹)</label><input type="number" onChange={(e) => (amount = e.target.value)} /></div>
          <div className="form-group"><label>Monthly EMI (₹)</label><input type="number" onChange={(e) => (emi = e.target.value)} /></div>
          <div className="form-group"><label>Rate / Terms</label><input type="text" onChange={(e) => (rate = e.target.value)} /></div>
        </>
      ),
      async () => {
        const item = { id: 'debt_' + Date.now(), order_num: debtLadder.length + 1, name, amount: Number(amount), emi: Number(emi), rate, is_car: false };
        setDebtLadder([...debtLadder, item]);
        await supabase.from('debt_ladder').insert(item);
        showFlag('Debt Item Added');
      }
    );
  }
  async function editDebtItemDetails(d) {
    let name = d.name, amount = d.amount, emi = d.emi, rate = d.rate;
    openModal(
      'Edit Debt Entry',
      (
        <>
          <div className="form-group"><label>Creditor Name</label><input type="text" defaultValue={name} onChange={(e) => (name = e.target.value)} /></div>
          <div className="form-group"><label>Principal Balance (₹)</label><input type="number" defaultValue={amount} onChange={(e) => (amount = e.target.value)} /></div>
          <div className="form-group"><label>Monthly EMI (₹)</label><input type="number" defaultValue={emi} onChange={(e) => (emi = e.target.value)} /></div>
          <div className="form-group"><label>Rate / Terms</label><input type="text" defaultValue={rate} onChange={(e) => (rate = e.target.value)} /></div>
        </>
      ),
      async () => {
        const payload = { ...d, name, amount: Number(amount), emi: Number(emi), rate };
        setDebtLadder(debtLadder.map(x => x.id === d.id ? payload : x));
        await supabase.from('debt_ladder').update({ name, amount: Number(amount), emi: Number(emi), rate }).eq('id', d.id);
        showFlag('Debt Updated');
      }
    );
  }
  async function deleteDebtItem(id) {
    setDebtLadder(debtLadder.filter(d => d.id !== id));
    await supabase.from('debt_ladder').delete().eq('id', id);
  }

  // Team
  async function addTeamMember() {
    let name = '', role = '', pay = 0;
    openModal(
      'Add Team Member',
      (
        <>
          <div className="form-group"><label>Member Name</label><input type="text" onChange={(e) => (name = e.target.value)} /></div>
          <div className="form-group"><label>Role</label><input type="text" onChange={(e) => (role = e.target.value)} /></div>
          <div className="form-group"><label>Monthly Pay (₹)</label><input type="number" onChange={(e) => (pay = e.target.value)} /></div>
        </>
      ),
      async () => {
        const item = { id: 'tm_' + Date.now(), name, role, pay: Number(pay) };
        setTeamMembers([...teamMembers, item]);
        await supabase.from('team_members').insert(item);
        showFlag('Member Added');
      }
    );
  }
  async function editTeamMemberDetails(m) {
    let name = m.name, role = m.role, pay = m.pay;
    openModal(
      'Edit Team Member',
      (
        <>
          <div className="form-group"><label>Member Name</label><input type="text" defaultValue={name} onChange={(e) => (name = e.target.value)} /></div>
          <div className="form-group"><label>Role</label><input type="text" defaultValue={role} onChange={(e) => (role = e.target.value)} /></div>
          <div className="form-group"><label>Monthly Pay (₹)</label><input type="number" defaultValue={pay} onChange={(e) => (pay = e.target.value)} /></div>
        </>
      ),
      async () => {
        const payload = { ...m, name, role, pay: Number(pay) };
        setTeamMembers(teamMembers.map(x => x.id === m.id ? payload : x));
        await supabase.from('team_members').update({ name, role, pay: Number(pay) }).eq('id', m.id);
        showFlag('Member Updated');
      }
    );
  }
  async function deleteTeamMember(id) {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
    await supabase.from('team_members').delete().eq('id', id);
  }

  // Scorecard update
  async function updateScorecardVal(id, val) {
    setScorecard(scorecard.map(sc => sc.id === id ? { ...sc, value: val } : sc));
    await supabase.from('scorecard').update({ value: val }).eq('id', id);
  }

  async function clearAllEntries() {
    if (!confirm('Are you sure you want to reset and reload clean default data from Supabase?')) return;
    loadData();
    showFlag('Dashboard state refreshed from DB');
  }
}

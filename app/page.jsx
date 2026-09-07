'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Modal from '@/components/Modal';
import * as XLSX from 'xlsx';

export default function Dashboard() {
  const [hero, setHero] = useState({ billed: 646617, banked: 179863, subtext: '', notice: '' });
  const [collections, setCollections] = useState([]);
  const [outflows, setOutflows] = useState([]);
  const [debtLadder, setDebtLadder] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState({ w1: [], w2: [] });
  const [datedItems, setDatedItems] = useState([]);
  const [scorecard, setScorecard] = useState([]);
  const [phases, setPhases] = useState([]);
  
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
        { data: phiData }
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
        supabase.from('phase_items').select('*')
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

    // Subscribe to Realtime changes across all tables
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

  // EXCEL REPORT EXPORT
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
            <h1>Operating Console</h1>
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
          { id: 'p-now', label: 'This Week' },
          { id: 'p-cash', label: 'Cash & Outflows' },
          { id: 'p-debt', label: 'Debt Ladder' },
          { id: 'p-team', label: 'Team' },
          { id: 'p-plan', label: 'The 4 Phases' },
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

      {/* PANEL 1: THIS WEEK */}
      {activeTab === 'p-now' && (
        <section className="panel">
          <div className="block-header">
            <h2>Dated & Critical Items</h2>
            <button className="ghost sm-btn" onClick={() => addDatedItem()}>+ Add Item</button>
          </div>
          
          <div className="callout red">
            {datedItems.map((it, idx) => (
              <div key={it.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
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
              <h2>Week One Actions</h2>
              <button className="ghost sm-btn" onClick={() => addTask('w1')}>+ Add Task</button>
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
          </div>

          <div className="block">
            <div className="block-header">
              <h2>Week Two Actions</h2>
              <button className="ghost sm-btn" onClick={() => addTask('w2')}>+ Add Task</button>
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
          </div>
        </section>
      )}

      {/* PANEL 2: CASH & OUTFLOWS */}
      {activeTab === 'p-cash' && (
        <section className="panel">
          <div className="grid2">
            <div className="block">
              <div className="block-header">
                <h2>Retainer Collections</h2>
                <button className="ghost sm-btn" onClick={() => addCollection()}>+ Add Client</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Paid</th>
                    <th>Client</th>
                    <th className="n">Amount</th>
                    <th>Actions</th>
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
                      <td>{c.name}</td>
                      <td className="n">{inr(c.amount)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          <button className="btn-edit sm-btn" onClick={() => editCollectionItem(c)}>✏️ Edit</button>
                          <button className="btn-danger sm-btn" onClick={() => deleteCollection(c.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="total">
                    <td colSpan="2">Banked Total</td>
                    <td className="n">{inr(bankedSum)} / {inr(grandSum)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="block">
              <div className="block-header">
                <h2>Monthly Outflows</h2>
                <button className="ghost sm-btn" onClick={() => addOutflow()}>+ Add Outflow</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Commitment</th>
                    <th className="n">Monthly Cost</th>
                    <th>Actions</th>
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
            </div>
          </div>
        </section>
      )}

      {/* PANEL 3: DEBT LADDER */}
      {activeTab === 'p-debt' && (
        <section className="panel">
          <div className="block">
            <div className="block-header">
              <h2>Structured Debt Ladder</h2>
              <button className="ghost sm-btn" onClick={() => addDebtItem()}>+ Add Debt</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Creditor</th>
                  <th className="n">Principal</th>
                  <th className="n">EMI / Month</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {debtLadder.map((d) => (
                  <tr key={d.id}>
                    <td className="num">{d.order_num}</td>
                    <td><strong>{d.name}</strong> <span className="tiny muted">({d.rate})</span></td>
                    <td className="n">{inr(d.amount)}</td>
                    <td className="n">{inr(d.emi)}</td>
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
                  <td colSpan="2"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* PANEL 4: TEAM */}
      {activeTab === 'p-team' && (
        <section className="panel">
          <div className="grid2">
            <div className="block">
              <div className="block-header">
                <h2>Team Roster</h2>
                <button className="ghost sm-btn" onClick={() => addTeamMember()}>+ Add Member</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th className="n">Monthly Pay</th>
                    <th>Actions</th>
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
              <h2>Key Team Metrics</h2>
              <div className="stat" style={{ marginBottom: '12px' }}>
                <span className="k">{inr(headCount > 0 ? billed / headCount : 0)}</span>
                <span className="l">Revenue Per Team Member</span>
              </div>
              <div className="stat">
                <span className="k">{salarySum > 0 ? (billed / salarySum).toFixed(2) : 0}x</span>
                <span className="l">Revenue to Payroll Multiple</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PANEL 5: 4 PHASES */}
      {activeTab === 'p-plan' && (
        <section className="panel">
          <div className="block">
            <h2>The 4 Strategic Phases</h2>
            {phases.map((ph) => (
              <div key={ph.id} style={{ borderLeft: '3px solid var(--teal)', paddingLeft: '16px', marginBottom: '20px' }}>
                <p className="tiny muted num">{ph.timeline}</p>
                <h3>{ph.title}</h3>
                <p className="small muted"><strong>Done looks like:</strong> {ph.done_looks_like}</p>
                <ul className="plain small" style={{ marginTop: '8px' }}>
                  {(ph.items || []).map((it) => (
                    <li key={it.id}>• {it.text}</li>
                  ))}
                </ul>
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

  // --- RELATIONAL CRUD & EDIT ACTIONS ---
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

  async function addCollection() {
    let name = '', amount = 0;
    openModal(
      'Add Retainer Client Collection',
      (
        <>
          <div className="form-group"><label>Client Name</label><input type="text" onChange={(e) => (name = e.target.value)} /></div>
          <div className="form-group"><label>Amount (₹)</label><input type="number" onChange={(e) => (amount = e.target.value)} /></div>
        </>
      ),
      async () => {
        const item = { id: 'col_' + Date.now(), name, amount: Number(amount), done: false };
        setCollections([...collections, item]);
        await supabase.from('collections').insert(item);
        showFlag('Collection Added');
      }
    );
  }
  async function editCollectionItem(c) {
    let name = c.name, amount = c.amount;
    openModal(
      'Edit Retainer Collection',
      (
        <>
          <div className="form-group"><label>Client Name</label><input type="text" defaultValue={name} onChange={(e) => (name = e.target.value)} /></div>
          <div className="form-group"><label>Amount (₹)</label><input type="number" defaultValue={amount} onChange={(e) => (amount = e.target.value)} /></div>
        </>
      ),
      async () => {
        const payload = { ...c, name, amount: Number(amount) };
        setCollections(collections.map(x => x.id === c.id ? payload : x));
        await supabase.from('collections').update({ name, amount: Number(amount) }).eq('id', c.id);
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

  async function addOutflow() {
    let item = '', amount = 0;
    openModal(
      'Add Monthly Outflow Commitment',
      (
        <>
          <div className="form-group"><label>Commitment / Expense Name</label><input type="text" onChange={(e) => (item = e.target.value)} /></div>
          <div className="form-group"><label>Monthly Amount (₹)</label><input type="number" onChange={(e) => (amount = e.target.value)} /></div>
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
}

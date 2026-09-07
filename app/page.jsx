'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Modal from '@/components/Modal';

const defaultState = {
  hero: { billed: 646617, banked: 179863, subtext: "Misc Archive Private Limited. From here the whole outcome turns on a single number.", notice: "At 85% collection you break even. At 90% plus ₹1L of new recurring revenue you build wealth." },
  datedItems: [],
  tasks: { w1: [], w2: [] },
  dayBoard: { morning: [], midday: [], afternoon: [] },
  collections: [],
  outflows: [],
  growthTarget: { label: "₹10L/mo" },
  revenueLadder: [],
  debtLadder: [],
  team: { members: [] },
  phases: []
};

export default function Dashboard() {
  const [state, setState] = useState(defaultState);
  const [activeTab, setActiveTab] = useState('p-now');
  const [statusMsg, setStatusMsg] = useState('Connecting to Supabase...');
  const [isLive, setIsLive] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', content: null, onSave: null });

  // Format currency helper
  const inr = (n) => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');

  const showFlag = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => {
      setStatusMsg((prev) => (prev === msg ? 'Synced with Supabase DB' : prev));
    }, 3000);
  };

  // Save state to Supabase & LocalStorage
  const saveState = async (newState) => {
    setState(newState);
    try {
      localStorage.setItem('ma_console_db_v4', JSON.stringify(newState));
    } catch (e) {}

    try {
      const { error } = await supabase
        .from('dashboard_state')
        .upsert({ id: 'main', data: newState, updated_at: new Date().toISOString() });
      if (error) console.error('Supabase Save Error:', error);
      else showFlag('Saved to Supabase');
    } catch (err) {
      console.error('Supabase Error:', err);
    }
  };

  // Fetch initial data & subscribe to Realtime
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await supabase
          .from('dashboard_state')
          .select('data')
          .eq('id', 'main')
          .single();

        if (data && data.data) {
          setState(data.data);
          setIsLive(true);
          setStatusMsg('Synced with Supabase DB');
        } else {
          // Try local storage
          const saved = localStorage.getItem('ma_console_db_v4');
          if (saved) setState(JSON.parse(saved));
          setIsLive(true);
          setStatusMsg('Loaded Local State');
        }
      } catch (err) {
        setIsLive(false);
        setStatusMsg('Offline / Local Mode');
      }
    };

    loadData();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('public:dashboard_state')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dashboard_state' }, (payload) => {
        if (payload.new && payload.new.data) {
          setState(payload.new.data);
          showFlag('Realtime Update Synced!');
        }
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

  // Financial Computations
  const billed = Number(state.hero?.billed || 0);
  const banked = Number(state.hero?.banked || 0);
  const bankedPct = billed > 0 ? Math.min(100, Math.round((banked / billed) * 100)) : 0;
  
  const collectionsList = state.collections || [];
  const bankedSum = collectionsList.filter(c => c.done).reduce((acc, c) => acc + Number(c.amount || 0), 0);
  const grandSum = collectionsList.reduce((acc, c) => acc + Number(c.amount || 0), 0);
  const gap85Pct = Math.round(billed * 0.85) - banked;

  const totalOutflow = (state.outflows || []).reduce((acc, o) => acc + Number(o.amount || 0), 0);
  const debtExCar = (state.debtLadder || []).filter(d => !d.isCar).reduce((acc, d) => acc + Number(d.amount || 0), 0);

  const teamList = state.team?.members || [];
  const salarySum = teamList.reduce((acc, m) => acc + Number(m.pay || 0), 0);
  const headCount = teamList.length;

  return (
    <div className="wrap">
      {/* HERO HEADER */}
      <header className="hero">
        <div className="hero-top">
          <div>
            <h1>Operating Console</h1>
            <p className="tiny muted">Misc Archive Private Limited</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span className="pulse-badge">
              <span className="pulse-dot"></span>
              {statusMsg}
            </span>
            <button className="ghost sm-btn" onClick={() => editHeroStats()}>
              Edit Stats
            </button>
          </div>
        </div>

        <p className="hero-sub">{state.hero?.subtext}</p>

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
            {state.hero?.notice} | <strong>85% Break-even Gap:</strong> {gap85Pct > 0 ? inr(gap85Pct) : 'Achieved!'}
          </p>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="tabs" role="tablist">
        {[
          { id: 'p-now', label: 'This Week' },
          { id: 'p-board', label: 'Day Board' },
          { id: 'p-cash', label: 'Cash & Outflows' },
          { id: 'p-growth', label: 'Growth Engine' },
          { id: 'p-90', label: '13 Weeks' },
          { id: 'p-debt', label: 'Debt Ladder' },
          { id: 'p-team', label: 'Team' },
          { id: 'p-rhythm', label: 'Rhythm' },
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
            {(state.datedItems || []).map((it, idx) => (
              <div key={it.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <strong>{it.date}: {it.title}</strong> — {it.details}
                </div>
                <button className="btn-danger sm-btn" onClick={() => deleteDatedItem(idx)}>del</button>
              </div>
            ))}
          </div>

          <div className="block">
            <div className="block-header">
              <h2>Week One Actions</h2>
              <button className="ghost sm-btn" onClick={() => addTask('w1')}>+ Add Task</button>
            </div>
            {(state.tasks?.w1 || []).map((t, idx) => (
              <div key={t.id || idx} className={`task ${t.done ? 'done' : ''}`}>
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={(e) => toggleTask('w1', idx, e.target.checked)}
                />
                <label>
                  <strong>{t.title}</strong>
                  <span className="why">{t.why}</span>
                </label>
                <button className="btn-danger sm-btn" onClick={() => deleteTask('w1', idx)}>del</button>
              </div>
            ))}
          </div>

          <div className="block">
            <div className="block-header">
              <h2>Week Two Actions</h2>
              <button className="ghost sm-btn" onClick={() => addTask('w2')}>+ Add Task</button>
            </div>
            {(state.tasks?.w2 || []).map((t, idx) => (
              <div key={t.id || idx} className={`task ${t.done ? 'done' : ''}`}>
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={(e) => toggleTask('w2', idx, e.target.checked)}
                />
                <label>
                  <strong>{t.title}</strong>
                  <span className="why">{t.why}</span>
                </label>
                <button className="btn-danger sm-btn" onClick={() => deleteTask('w2', idx)}>del</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PANEL 2: DAY BOARD */}
      {activeTab === 'p-board' && (
        <section className="panel">
          <div className="grid3">
            {['morning', 'midday', 'afternoon'].map((slotKey) => (
              <div key={slotKey} className="block">
                <div className="block-header">
                  <h3 style={{ textTransform: 'capitalize' }}>{slotKey} Block</h3>
                  <button className="ghost sm-btn" onClick={() => addDaySlot(slotKey)}>+ Slot</button>
                </div>
                {(state.dayBoard?.[slotKey] || []).map((slot, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <span className="num tiny muted">{slot.time}</span> — <strong>{slot.task}</strong>
                    </div>
                    <button className="btn-danger sm-btn" onClick={() => deleteDaySlot(slotKey, idx)}>del</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PANEL 3: CASH & OUTFLOWS */}
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
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(state.collections || []).map((c, idx) => (
                    <tr key={c.id || idx}>
                      <td>
                        <input
                          type="checkbox"
                          checked={c.done}
                          onChange={(e) => toggleCollection(idx, e.target.checked)}
                        />
                      </td>
                      <td>{c.name}</td>
                      <td className="n">{inr(c.amount)}</td>
                      <td><button className="btn-danger sm-btn" onClick={() => deleteCollection(idx)}>del</button></td>
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
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(state.outflows || []).map((o, idx) => (
                    <tr key={o.id || idx}>
                      <td>{o.item}</td>
                      <td className="n">{inr(o.amount)}</td>
                      <td><button className="btn-danger sm-btn" onClick={() => deleteOutflow(idx)}>del</button></td>
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

      {/* PANEL 4: GROWTH ENGINE */}
      {activeTab === 'p-growth' && (
        <section className="panel">
          <div className="block">
            <h2>Revenue Rungs</h2>
            <p className="small muted" style={{ marginBottom: '14px' }}>Target: {state.growthTarget?.label}</p>
            <div className="grid3">
              {(state.revenueLadder || []).map((rung, idx) => (
                <div key={rung.id || idx} className="stat">
                  <span className="k">{rung.name}</span>
                  <span className={`tagl ${rung.tagType || 'a'}`}>{rung.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PANEL 6: DEBT LADDER */}
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(state.debtLadder || []).map((d, idx) => (
                  <tr key={d.id || idx}>
                    <td className="num">{d.order}</td>
                    <td><strong>{d.name}</strong> <span className="tiny muted">({d.rate})</span></td>
                    <td className="n">{inr(d.amount)}</td>
                    <td className="n">{inr(d.emi)}</td>
                    <td><button className="btn-danger sm-btn" onClick={() => deleteDebtItem(idx)}>del</button></td>
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

      {/* PANEL 7: TEAM */}
      {activeTab === 'p-team' && (
        <section className="panel">
          <div className="grid2">
            <div className="block">
              <h2>Team Roster</h2>
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th className="n">Monthly Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {teamList.map((m, idx) => (
                    <tr key={m.id || idx}>
                      <td><strong>{m.name}</strong></td>
                      <td>{m.role}</td>
                      <td className="n">{inr(m.pay)}</td>
                    </tr>
                  ))}
                  <tr className="total">
                    <td colSpan="2">Total Monthly Payroll ({headCount} heads)</td>
                    <td className="n">{inr(salarySum)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="block">
              <h2>Key Metrics</h2>
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

      {/* PANEL 9: 4 PHASES */}
      {activeTab === 'p-plan' && (
        <section className="panel">
          <div className="block">
            <h2>The 4 Strategic Phases</h2>
            {(state.phases || []).map((ph, pIdx) => (
              <div key={ph.id || pIdx} style={{ borderLeft: '3px solid var(--teal)', paddingLeft: '16px', marginBottom: '20px' }}>
                <p className="tiny muted num">{ph.timeline}</p>
                <h3>{ph.title}</h3>
                <p className="small muted"><strong>Done looks like:</strong> {ph.doneLooksLike}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FOOTER ACTION BAR */}
      <div className="resetbar">
        <button className="ghost" onClick={() => resetToDefault()}>Reload db.json Defaults</button>
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

  // --- CRUD ACTION HANDLERS ---
  function editHeroStats() {
    let bVal = state.hero?.billed || 0;
    let kVal = state.hero?.banked || 0;
    let sub = state.hero?.subtext || '';
    let not = state.hero?.notice || '';

    openModal(
      'Edit Hero Financial Stats',
      (
        <>
          <div className="form-group">
            <label>Billed Monthly Run Rate (₹)</label>
            <input type="number" defaultValue={bVal} onChange={(e) => (bVal = e.target.value)} />
          </div>
          <div className="form-group">
            <label>Banked Monthly Revenue (₹)</label>
            <input type="number" defaultValue={kVal} onChange={(e) => (kVal = e.target.value)} />
          </div>
          <div className="form-group">
            <label>Headline Subtext</label>
            <textarea defaultValue={sub} onChange={(e) => (sub = e.target.value)} />
          </div>
          <div className="form-group">
            <label>Critical Notice Banner</label>
            <textarea defaultValue={not} onChange={(e) => (not = e.target.value)} />
          </div>
        </>
      ),
      () => {
        saveState({
          ...state,
          hero: { billed: Number(bVal), banked: Number(kVal), subtext: sub, notice: not },
        });
      }
    );
  }

  function addDatedItem() {
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
      () => {
        const list = [...(state.datedItems || []), { id: 'dt_' + Date.now(), date, title, details, urgent: true }];
        saveState({ ...state, datedItems: list });
      }
    );
  }
  function deleteDatedItem(idx) {
    const list = [...(state.datedItems || [])];
    list.splice(idx, 1);
    saveState({ ...state, datedItems: list });
  }

  function addTask(wKey) {
    let title = '', why = '';
    openModal(
      `Add ${wKey === 'w1' ? 'Week One' : 'Week Two'} Task`,
      (
        <>
          <div className="form-group"><label>Task Title</label><input type="text" onChange={(e) => (title = e.target.value)} /></div>
          <div className="form-group"><label>Why / Rationale</label><textarea onChange={(e) => (why = e.target.value)} /></div>
        </>
      ),
      () => {
        const list = [...(state.tasks?.[wKey] || []), { id: `${wKey}_` + Date.now(), title, why, done: false }];
        saveState({ ...state, tasks: { ...state.tasks, [wKey]: list } });
      }
    );
  }
  function toggleTask(wKey, idx, done) {
    const list = [...(state.tasks?.[wKey] || [])];
    list[idx].done = done;
    saveState({ ...state, tasks: { ...state.tasks, [wKey]: list } });
  }
  function deleteTask(wKey, idx) {
    const list = [...(state.tasks?.[wKey] || [])];
    list.splice(idx, 1);
    saveState({ ...state, tasks: { ...state.tasks, [wKey]: list } });
  }

  function addDaySlot(slotKey) {
    let time = '', task = '';
    openModal(
      `Add ${slotKey} Slot`,
      (
        <>
          <div className="form-group"><label>Time Label (e.g. 09:30)</label><input type="text" onChange={(e) => (time = e.target.value)} /></div>
          <div className="form-group"><label>Task Description</label><input type="text" onChange={(e) => (task = e.target.value)} /></div>
        </>
      ),
      () => {
        const list = [...(state.dayBoard?.[slotKey] || []), { time, task }];
        saveState({ ...state, dayBoard: { ...state.dayBoard, [slotKey]: list } });
      }
    );
  }
  function deleteDaySlot(slotKey, idx) {
    const list = [...(state.dayBoard?.[slotKey] || [])];
    list.splice(idx, 1);
    saveState({ ...state, dayBoard: { ...state.dayBoard, [slotKey]: list } });
  }

  function addCollection() {
    let name = '', amount = 0;
    openModal(
      'Add Retainer Client Collection',
      (
        <>
          <div className="form-group"><label>Client Name</label><input type="text" onChange={(e) => (name = e.target.value)} /></div>
          <div className="form-group"><label>Amount (₹)</label><input type="number" onChange={(e) => (amount = e.target.value)} /></div>
        </>
      ),
      () => {
        const list = [...(state.collections || []), { id: 'col_' + Date.now(), name, amount: Number(amount), done: false }];
        saveState({ ...state, collections: list });
      }
    );
  }
  function toggleCollection(idx, done) {
    const list = [...(state.collections || [])];
    list[idx].done = done;
    saveState({ ...state, collections: list });
  }
  function deleteCollection(idx) {
    const list = [...(state.collections || [])];
    list.splice(idx, 1);
    saveState({ ...state, collections: list });
  }

  function addOutflow() {
    let item = '', amount = 0;
    openModal(
      'Add Monthly Outflow Commitment',
      (
        <>
          <div className="form-group"><label>Commitment / Expense Name</label><input type="text" onChange={(e) => (item = e.target.value)} /></div>
          <div className="form-group"><label>Monthly Amount (₹)</label><input type="number" onChange={(e) => (amount = e.target.value)} /></div>
        </>
      ),
      () => {
        const list = [...(state.outflows || []), { id: 'out_' + Date.now(), item, amount: Number(amount) }];
        saveState({ ...state, outflows: list });
      }
    );
  }
  function deleteOutflow(idx) {
    const list = [...(state.outflows || [])];
    list.splice(idx, 1);
    saveState({ ...state, outflows: list });
  }

  function addDebtItem() {
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
      () => {
        const list = [...(state.debtLadder || []), { id: 'debt_' + Date.now(), order: (state.debtLadder?.length || 0) + 1, name, amount: Number(amount), emi: Number(emi), rate, isCar: false }];
        saveState({ ...state, debtLadder: list });
      }
    );
  }
  function deleteDebtItem(idx) {
    const list = [...(state.debtLadder || [])];
    list.splice(idx, 1);
    saveState({ ...state, debtLadder: list });
  }

  function resetToDefault() {
    if (confirm('Reset to initial db.json snapshot?')) {
      saveState(initialDb);
    }
  }
}

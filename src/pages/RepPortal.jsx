import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { T, VARIANTS, PAY_MODES, n, fc, tod } from '../lib/constants';
import { Btn, Card, Field, Chip, StatBox, TabBar, Spinner, Alert } from '../components/UI';

function PosScreen({ session, pricing, repId, onSaleComplete }) {
  const [step, setStep]       = useState('pick');
  const [variant, setVariant] = useState(null);
  const [kg, setKg]           = useState('');
  const [payMode, setPayMode] = useState('Cash');
  const [amtPaid, setAmtPaid] = useState('');
  const [notes, setNotes]     = useState('');
  const [saving, setSaving]   = useState(false);

  const pricePerKg = variant ? n(pricing[variant.key]) : 0;
  const total      = pricePerKg * n(kg);
  const change     = n(amtPaid) - total;

  const reset = () => { setStep('pick'); setVariant(null); setKg(''); setPayMode('Cash'); setAmtPaid(''); setNotes(''); };

  const confirmSale = async () => {
    setSaving(true);
    const sale = {
      session_id: session.id, rep_id: repId,
      variant: variant.key, kg: n(kg),
      price_per_kg: pricePerKg, total,
      pay_mode: payMode,
      amount_paid: payMode === 'Cash' ? n(amtPaid) : total,
      change_given: payMode === 'Cash' ? Math.max(0, change) : 0,
      notes,
    };
    const { error } = await supabase.from('sales').insert(sale);
    setSaving(false);
    if (!error) { onSaleComplete(); setStep('done'); }
  };

  const sales    = session?.sales || [];
  const todayRev = sales.reduce((s, x) => s + x.total, 0);
  const todayKg  = sales.reduce((s, x) => s + x.kg, 0);

  if (step === 'done') return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 3, color: T.green, marginBottom: 6 }}>Sale Recorded!</div>
      <div style={{ fontSize: 13, color: T.mid, marginBottom: 24 }}>{n(kg)}kg {variant?.label} — <strong style={{ color: '#fff' }}>{fc(total)}</strong></div>
      <Btn onClick={reset} size="lg" full>+ Next Sale</Btn>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        <StatBox label="Sales"   value={sales.length}             color={T.gold} />
        <StatBox label="Revenue" value={fc(todayRev)}             color={T.green} />
        <StatBox label="KG Sold" value={todayKg.toFixed(1)+'kg'}  color={T.goldL} />
      </div>

      {step === 'pick' && (
        <Card title="Select Product" icon="🌾">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {VARIANTS.map(v => {
              const price = n(pricing[v.key]);
              return (
                <button key={v.key} onClick={() => { setVariant(v); setStep('entry'); }}
                  style={{ background: v.bg, border: `1px solid ${v.border}`, borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{v.emoji}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, color: '#fff', fontSize: 14 }}>{v.label}</div>
                      <div style={{ fontSize: 10, color: T.dim, marginTop: 2 }}>Tap to sell</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: v.color, letterSpacing: 1 }}>{price ? fc(price)+'/kg' : 'No price'}</div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {step === 'entry' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <button onClick={reset} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: 20, padding: 0 }}>←</button>
            <Chip label={variant.label} color={variant.color} bg={variant.bg} border={variant.border} />
            <span style={{ fontSize: 11, color: T.dim }}>@ {fc(pricePerKg)}/kg</span>
          </div>
          <Card title="Enter Quantity" icon="⚖️">
            <Field label="Kilograms" value={kg} onChange={setKg} type="number" placeholder="0.0" suffix="kg" />
            {n(kg) > 0 && (
              <div style={{ padding: '14px 16px', background: 'rgba(201,168,76,0.08)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <span style={{ fontSize: 11, color: T.dim, letterSpacing: 1, textTransform: 'uppercase' }}>Amount Due</span>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: T.gold, letterSpacing: 2 }}>{fc(total)}</span>
              </div>
            )}
          </Card>
          <Btn onClick={() => setStep('payment')} size="lg" full disabled={n(kg) <= 0}>Proceed to Payment →</Btn>
        </>
      )}

      {step === 'payment' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <button onClick={() => setStep('entry')} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: 20, padding: 0 }}>←</button>
            <span style={{ fontSize: 12, color: T.mid }}>{n(kg)}kg {variant.label}</span>
            <span style={{ marginLeft: 'auto', fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: T.gold }}>{fc(total)}</span>
          </div>
          <Card title="Payment Method" icon="💳">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
              {PAY_MODES.map(m => (
                <button key={m} onClick={() => setPayMode(m)} style={{ padding: '12px 6px', borderRadius: 8, border: `1px solid ${payMode === m ? T.gold : T.border}`, background: payMode === m ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)', color: payMode === m ? T.gold : '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>{m}</button>
              ))}
            </div>
            {payMode === 'Cash' && (
              <>
                <Field label="Amount Paid" value={amtPaid} onChange={setAmtPaid} type="number" prefix="₦" placeholder="0" />
                {n(amtPaid) > 0 && (
                  <div style={{ padding: '12px 14px', background: change >= 0 ? 'rgba(93,187,122,0.1)' : 'rgba(224,85,85,0.1)', border: `1px solid ${change >= 0 ? 'rgba(93,187,122,0.25)' : 'rgba(224,85,85,0.25)'}`, borderRadius: 7, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: T.dim, textTransform: 'uppercase' }}>{change >= 0 ? 'Change to Return' : 'Shortfall'}</span>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: change >= 0 ? T.green : T.red }}>{fc(Math.abs(change))}</span>
                  </div>
                )}
              </>
            )}
            {(payMode === 'Transfer' || payMode === 'POS') && (
              <div style={{ padding: '12px 14px', background: 'rgba(93,187,122,0.08)', borderRadius: 7, fontSize: 11, color: T.mid }}>
                Amount: <strong style={{ color: '#fff' }}>{fc(total)}</strong> — confirm payment received before saving.
              </div>
            )}
          </Card>
          <Card title="Notes (optional)" icon="📝">
            <Field value={notes} onChange={setNotes} placeholder="e.g. Regular customer, gave discount..." />
          </Card>
          <Btn onClick={confirmSale} size="lg" full variant="green"
            disabled={saving || (payMode === 'Cash' && (n(amtPaid) <= 0 || n(amtPaid) < total))}>
            {saving ? 'Saving...' : '✓ Confirm Sale'}
          </Btn>
        </>
      )}
    </div>
  );
}

function MessagesScreen({ rep }) {
  const [messages, setMessages] = useState([]);
  const [reply, setReply]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:sender_id(full_name, role)')
      .or(`receiver_id.eq.${rep.id},sender_id.eq.${rep.id}`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setLoading(false);
    await supabase.from('messages').update({ is_read: true }).eq('receiver_id', rep.id).eq('is_read', false);
  }, [rep.id]);

  useEffect(() => { fetchMessages(); const t = setInterval(fetchMessages, 15000); return () => clearInterval(t); }, [fetchMessages]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    const { data: admin } = await supabase.from('profiles').select('id').eq('role', 'admin').single();
    await supabase.from('messages').insert({ sender_id: rep.id, receiver_id: admin?.id, body: reply.trim() });
    setReply('');
    await fetchMessages();
    setSending(false);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <Card title="Messages from Head Office" icon="📨" noPad>
        {messages.length === 0 && <div style={{ padding: 16, fontSize: 12, color: T.dim }}>No messages yet.</div>}
        <div style={{ maxHeight: 400, overflowY: 'auto', padding: '8px 0' }}>
          {messages.map(m => {
            const isMe = m.sender_id === rep.id;
            return (
              <div key={m.id} style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: isMe ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${isMe ? 'rgba(201,168,76,0.25)' : T.border}` }}>
                  <div style={{ fontSize: 12, color: '#fff', lineHeight: 1.5 }}>{m.body}</div>
                </div>
                <div style={{ fontSize: 9, color: T.dim, marginTop: 4, letterSpacing: 1 }}>
                  {isMe ? 'You' : 'Head Office'} · {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <Card title="Reply" icon="✏️">
        <Field value={reply} onChange={setReply} placeholder="Type your reply..." />
        <Btn onClick={sendReply} full disabled={sending || !reply.trim()}>{sending ? 'Sending...' : 'Send Reply'}</Btn>
      </Card>
    </div>
  );
}

function MySalesScreen({ rep }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*, sales(*)')
        .eq('rep_id', rep.id)
        .order('opened_at', { ascending: false })
        .limit(10);
      setSessions(data || []);
      setLoading(false);
    })();
  }, [rep.id]);

  if (loading) return <Spinner />;

  return (
    <div>
      {sessions.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px', color: T.dim, fontSize: 12 }}>No sessions recorded yet.</div>}
      {sessions.map(sess => {
        const rev = (sess.sales || []).reduce((s, x) => s + x.total, 0);
        return (
          <Card key={sess.id} title={sess.market_name} icon="📅" subtitle={sess.date}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
              <StatBox label="Sales"   value={(sess.sales || []).length} color={T.gold} />
              <StatBox label="Revenue" value={fc(rev)}                   color={T.green} />
              <StatBox label="Status"  value={sess.closed_at ? 'Closed' : 'Open'} color={sess.closed_at ? T.dim : T.green} />
            </div>
            {(sess.sales || []).map(sale => (
              <div key={sale.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: T.mid }}>{sale.kg}kg {sale.variant} · {sale.pay_mode}</span>
                <span style={{ color: T.gold, fontWeight: 700 }}>{fc(sale.total)}</span>
              </div>
            ))}
          </Card>
        );
      })}
    </div>
  );
}

export default function RepPortal({ rep, onLogout }) {
  const [tab, setTab]           = useState('sell');
  const [session, setSession]   = useState(null);
  const [pricing, setPricing]   = useState({});
  const [creating, setCreating] = useState(false);
  const [market, setMarket]     = useState('');
  const [date, setDate]         = useState(tod());
  const [sessionSales, setSessionSales] = useState([]);
  const [unread, setUnread]     = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('pricing').select('*');
      if (data) {
        const p = {};
        data.forEach(row => { p[row.variant] = row.selling_price; });
        setPricing(p);
      }
    })();
    (async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*, sales(*)')
        .eq('rep_id', rep.id)
        .is('closed_at', null)
        .order('opened_at', { ascending: false })
        .limit(1);
      if (data && data.length > 0) { setSession(data[0]); setSessionSales(data[0].sales || []); }
    })();
    const checkUnread = async () => {
      const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', rep.id).eq('is_read', false);
      setUnread(count || 0);
    };
    checkUnread();
    const t = setInterval(checkUnread, 20000);
    return () => clearInterval(t);
  }, [rep.id]);

  const openSession = async () => {
    if (!market.trim()) return;
    const { data } = await supabase.from('sessions').insert({ rep_id: rep.id, market_name: market.trim(), date }).select().single();
    if (data) { setSession({ ...data, sales: [] }); setSessionSales([]); setCreating(false); }
  };

  const closeSession = async () => {
    if (!window.confirm('Close this market day? No more sales can be added.')) return;
    await supabase.from('sessions').update({ closed_at: new Date().toISOString() }).eq('id', session.id);
    setSession(null); setSessionSales([]);
  };

  const refreshSales = async () => {
    const { data } = await supabase.from('sales').select('*').eq('session_id', session.id).order('created_at', { ascending: true });
    setSession(s => ({ ...s, sales: data || [] }));
    setSessionSales(data || []);
  };

  const tabs = [
    { key: 'sell',     label: '🛒 Sell' },
    { key: 'mysales',  label: '📋 My Sales' },
    { key: 'messages', label: unread > 0 ? `📨 (${unread})` : '📨 Msgs' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: T.dark, overflowX: 'hidden' }}>
      <div style={{ background: T.navy, padding: '14px 16px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 4, color: '#fff', lineHeight: 1 }}>VKI Farms</div>
          <div style={{ fontSize: 8, letterSpacing: 2, color: T.gold, marginTop: 3, textTransform: 'uppercase' }}>Field Rep · {rep.full_name || rep.username}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {session && !session.closed_at && <div style={{ fontSize: 8, color: T.green, letterSpacing: 1 }}>🟢 {session.market_name}</div>}
          <button onClick={onLogout} style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 6, color: T.dim, fontSize: 10, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>Logout</button>
        </div>
      </div>
      <TabBar tabs={tabs} active={tab} onChange={setTab} />
      <div style={{ padding: '18px 14px 70px', maxWidth: 520, margin: '0 auto' }}>
        {tab === 'sell' && (
          <>
            {!session ? (
              creating ? (
                <Card title="Open Market Day" icon="📅">
                  <Field label="Market Name" value={market} onChange={setMarket} placeholder="e.g. Uselu Market" />
                  <Field label="Date" value={date} onChange={setDate} type="date" />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn onClick={openSession} size="sm">Open Day</Btn>
                    <Btn onClick={() => setCreating(false)} variant="ghost" size="sm">Cancel</Btn>
                  </div>
                </Card>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🛒</div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 3, color: T.gold, marginBottom: 8 }}>No Active Market Day</div>
                  <div style={{ fontSize: 12, color: T.dim, marginBottom: 20, lineHeight: 1.8 }}>Open a session to start recording sales.</div>
                  <Btn onClick={() => setCreating(true)} size="lg" full>+ Open Market Day</Btn>
                </div>
              )
            ) : (
              <>
                {session.closed_at ? (
                  <Alert msg="This session is closed." type="warn" />
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                    <Btn onClick={closeSession} variant="danger" size="sm">Close Day</Btn>
                  </div>
                )}
                <PosScreen session={{ ...session, sales: sessionSales }} pricing={pricing} repId={rep.id} onSaleComplete={refreshSales} />
              </>
            )}
          </>
        )}
        {tab === 'mysales'  && <MySalesScreen rep={rep} />}
        {tab === 'messages' && <MessagesScreen rep={rep} />}
      </div>
    </div>
  );
}

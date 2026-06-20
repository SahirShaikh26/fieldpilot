import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../api/client';
import colors from '../theme';

const s = {
  h1: { fontSize: 22, fontWeight: 700, color: colors.navy, marginBottom: 4 },
  sub: { fontSize: 13, color: colors.textMuted, marginBottom: 24 },
  card: { background: colors.white, borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.08)', marginBottom: 20 },
  btnRow: { display: 'flex', gap: 10, marginBottom: 24 },
  btn: { padding: '10px 18px', background: colors.blue, color: colors.white, border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: colors.navy, marginBottom: 10 },
  summary: { fontSize: 14, color: colors.text, lineHeight: 1.6, marginBottom: 4 },
  anomaly: { display: 'flex', gap: 8, padding: '8px 0', fontSize: 13.5, color: colors.text, borderBottom: `1px solid ${colors.bgAlt}` },
  anomalyType: { fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: colors.redBg, color: colors.red, textTransform: 'uppercase', flexShrink: 0 },
  blurbBox: { background: colors.bg, borderRadius: 8, padding: 14, fontSize: 13.5, color: colors.text, marginBottom: 10 },
  copyBtn: { padding: '6px 12px', background: colors.white, border: `1.5px solid ${colors.blue}`, color: colors.blue, borderRadius: 6, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' },
  historyRow: { padding: '10px 0', borderBottom: `1px solid ${colors.bgAlt}`, fontSize: 13 },
  historyMeta: { color: colors.textMuted, fontSize: 11.5, marginBottom: 3 },
  empty: { color: colors.textMuted, fontSize: 13.5 },
};

export default function Digest() {
  const qc = useQueryClient();
  const [current, setCurrent] = useState(null);

  const { data: history } = useQuery({
    queryKey: ['digest-history'],
    queryFn: () => api.get('/digest').then((r) => r.data),
  });

  const generate = useMutation({
    mutationFn: (period) => api.post('/digest/generate', { period }).then((r) => r.data),
    onSuccess: (d) => {
      setCurrent(d);
      qc.invalidateQueries({ queryKey: ['digest-history'] });
      toast.success('Digest generated');
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Could not generate digest'),
  });

  const copyBlurb = () => {
    if (!current?.customer_blurb) return;
    navigator.clipboard.writeText(current.customer_blurb);
    toast.success('Copied to clipboard');
  };

  return (
    <div>
      <h1 style={s.h1}>Daily Digest</h1>
      <p style={s.sub}>AI-generated summary of your team's activity — no more scrolling through logs</p>

      <div style={s.btnRow}>
        <button
          style={{ ...s.btn, ...(generate.isPending ? s.btnDisabled : {}) }}
          onClick={() => generate.mutate('day')}
          disabled={generate.isPending}
        >
          {generate.isPending ? 'Generating…' : "Generate Today's Digest"}
        </button>
        <button
          style={{ ...s.btn, background: colors.purple, ...(generate.isPending ? s.btnDisabled : {}) }}
          onClick={() => generate.mutate('week')}
          disabled={generate.isPending}
        >
          {generate.isPending ? 'Generating…' : "Generate This Week's Digest"}
        </button>
      </div>

      {current && (
        <>
          <div style={s.card}>
            <div style={s.sectionTitle}>Summary</div>
            <p style={s.summary}>{current.summary}</p>
          </div>

          <div style={s.card}>
            <div style={s.sectionTitle}>Anomalies & Flags</div>
            {(!current.anomalies || current.anomalies.length === 0) ? (
              <p style={s.empty}>No anomalies flagged for this period 🎉</p>
            ) : (
              current.anomalies.map((a, i) => (
                <div style={s.anomaly} key={i}>
                  <span style={s.anomalyType}>{a.type?.replace('_', ' ')}</span>
                  <span>{a.description}</span>
                </div>
              ))
            )}
          </div>

          <div style={s.card}>
            <div style={s.sectionTitle}>Customer-Facing Summary</div>
            <div style={s.blurbBox}>{current.customer_blurb}</div>
            <button style={s.copyBtn} onClick={copyBlurb}>📋 Copy</button>
          </div>
        </>
      )}

      <div style={s.card}>
        <div style={s.sectionTitle}>History</div>
        {(!history || history.length === 0) ? (
          <p style={s.empty}>No digests generated yet.</p>
        ) : (
          history.map((h) => (
            <div style={s.historyRow} key={h.id}>
              <div style={s.historyMeta}>
                {h.period_type === 'day' ? 'Daily' : 'Weekly'} · {format(new Date(h.period_start), 'MMM d')} – {format(new Date(h.period_end), 'MMM d, yyyy')}
              </div>
              {h.summary}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

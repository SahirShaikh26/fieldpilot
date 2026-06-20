import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import api from '../api/client';
import colors from '../theme';

const card = { background: colors.white, borderRadius: 10, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.08)' };

const s = {
  h1: { fontSize: 22, fontWeight: 700, color: colors.navy, marginBottom: 4 },
  sub: { fontSize: 13, color: colors.textMuted, marginBottom: 20 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 24 },
  statValue: { fontSize: 28, fontWeight: 800, color: colors.navy },
  statLabel: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '8px 10px', borderBottom: `2px solid ${colors.border}`, color: colors.textMuted, fontWeight: 600 },
  td: { padding: '8px 10px', borderBottom: `1px solid ${colors.bgAlt}`, color: colors.text },
  sectionTitle: { fontSize: 15, fontWeight: 600, marginBottom: 12, color: colors.navy },
};

export default function Status() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['status-summary'],
    queryFn: () => api.get('/status/summary').then((r) => r.data),
    refetchInterval: 60000,
  });

  if (error) {
    return <p style={{ color: colors.red }}>Could not load status — you may not have owner access.</p>;
  }

  return (
    <div>
      <h1 style={s.h1}>System Status</h1>
      <p style={s.sub}>Platform-wide error overview across all tenants</p>

      {isLoading ? <p>Loading…</p> : (
        <>
          <div style={s.grid}>
            <div style={card}>
              <div style={s.statValue}>{data.count_24h}</div>
              <div style={s.statLabel}>Errors — last 24h</div>
            </div>
            <div style={card}>
              <div style={s.statValue}>{data.count_7d}</div>
              <div style={s.statLabel}>Errors — last 7 days</div>
            </div>
          </div>

          <div style={{ ...card, marginBottom: 20 }}>
            <h3 style={s.sectionTitle}>Errors by Route (last 7 days)</h3>
            {data.by_route.length === 0 ? <p style={{ color: colors.textMuted, fontSize: 13 }}>No errors recorded 🎉</p> : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Route</th>
                    <th style={s.th}>Method</th>
                    <th style={s.th}>Count</th>
                    <th style={s.th}>Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {data.by_route.map((r, i) => (
                    <tr key={i}>
                      <td style={s.td}>{r.route}</td>
                      <td style={s.td}>{r.method}</td>
                      <td style={s.td}>{r.count}</td>
                      <td style={s.td}>{format(new Date(r.last_seen), 'MMM d, HH:mm')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={card}>
            <h3 style={s.sectionTitle}>Recent Errors</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Time</th>
                    <th style={s.th}>Route</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((e) => (
                    <tr key={e.id}>
                      <td style={s.td}>{format(new Date(e.created_at), 'MMM d, HH:mm:ss')}</td>
                      <td style={s.td}>{e.method} {e.route}</td>
                      <td style={s.td}>{e.status_code}</td>
                      <td style={s.td}>{e.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

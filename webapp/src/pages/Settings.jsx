import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../hooks/useAuth';
import colors from '../theme';

const s = {
  h1: { fontSize: 22, fontWeight: 700, color: colors.navy, marginBottom: 4 },
  sub: { fontSize: 13, color: colors.textMuted, marginBottom: 24 },
  card: { background: colors.white, borderRadius: 10, padding: 22, boxShadow: '0 1px 4px rgba(0,0,0,.08)', maxWidth: 560 },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  label: { fontSize: 15, fontWeight: 700, color: colors.navy, marginBottom: 4 },
  desc: { fontSize: 13, color: colors.textMuted },
  toggle: (on) => ({
    width: 46, height: 26, borderRadius: 20, border: 'none', cursor: 'pointer', flexShrink: 0,
    background: on ? colors.blue : colors.borderInput, position: 'relative', transition: 'background .2s ease',
  }),
  knob: (on) => ({
    position: 'absolute', top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: '50%',
    background: colors.white, transition: 'left .2s ease', boxShadow: '0 1px 3px rgba(0,0,0,.3)',
  }),
};

export default function Settings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isDirector = user?.role === 'Director';

  const { data, isLoading } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: () => api.get('/tenant').then((r) => r.data),
  });

  const update = useMutation({
    mutationFn: (photo_capture_enabled) => api.put('/tenant/settings', { photo_capture_enabled }).then((r) => r.data),
    onSuccess: (d) => { qc.setQueryData(['tenant-settings'], d); toast.success('Settings updated'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Could not update settings'),
  });

  if (!isDirector) {
    return <p style={{ color: colors.textMuted }}>Only Directors can change company settings.</p>;
  }

  return (
    <div>
      <h1 style={s.h1}>Settings</h1>
      <p style={s.sub}>Company-wide preferences for {data?.name || 'your company'}</p>

      {isLoading ? <p>Loading…</p> : (
        <div style={s.card}>
          <div style={s.row}>
            <div>
              <div style={s.label}>Photo Capture on Activity Logs</div>
              <div style={s.desc}>
                Let engineers attach before/after photos when logging activity from the mobile app.
                Requires Cloudinary to be configured.
              </div>
            </div>
            <button
              style={s.toggle(data?.photo_capture_enabled)}
              onClick={() => update.mutate(!data?.photo_capture_enabled)}
              disabled={update.isPending}
              aria-label="Toggle photo capture"
            >
              <span style={s.knob(data?.photo_capture_enabled)} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

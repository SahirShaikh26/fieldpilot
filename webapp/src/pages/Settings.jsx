import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../hooks/useAuth';
import colors from '../theme';

const s = {
  h1: { fontSize: 22, fontWeight: 700, color: colors.navy, marginBottom: 4 },
  sub: { fontSize: 13, color: colors.textMuted, marginBottom: 24 },
  card: { background: colors.white, borderRadius: 10, padding: 22, boxShadow: '0 1px 4px rgba(0,0,0,.08)', maxWidth: 560, marginBottom: 20 },
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
  typeRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${colors.bgAlt}` },
  swatch: { width: 16, height: 16, borderRadius: 4, flexShrink: 0 },
  typeCode: { fontWeight: 700, color: colors.navy, fontSize: 13, width: 50 },
  typeLabel: { fontSize: 13.5, color: colors.text, flex: 1 },
  delBtn: { padding: '4px 10px', background: colors.redBg, color: colors.red, border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12 },
  addBtn: { padding: '8px 16px', background: colors.blue, color: colors.white, border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 12 },
  form: { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' },
  input: { padding: '8px 10px', border: `1px solid ${colors.borderInput}`, borderRadius: 6, fontSize: 13 },
};

export default function Settings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isDirector = user?.role === 'Director';
  const [newType, setNewType] = useState({ code: '', label: '', color: '#2563eb' });
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: () => api.get('/tenant').then((r) => r.data),
  });

  const update = useMutation({
    mutationFn: (photo_capture_enabled) => api.put('/tenant/settings', { photo_capture_enabled }).then((r) => r.data),
    onSuccess: (d) => { qc.setQueryData(['tenant-settings'], d); toast.success('Settings updated'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Could not update settings'),
  });

  const { data: activityTypes, isLoading: typesLoading } = useQuery({
    queryKey: ['activity-types'],
    queryFn: () => api.get('/activity-types').then((r) => r.data),
  });

  const createType = useMutation({
    mutationFn: (d) => api.post('/activity-types', d).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activity-types'] });
      toast.success('Activity type added');
      setNewType({ code: '', label: '', color: '#2563eb' });
      setShowForm(false);
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Could not add activity type'),
  });

  const deleteType = useMutation({
    mutationFn: (id) => api.delete(`/activity-types/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['activity-types'] }); toast.success('Removed'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Could not remove activity type'),
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

      <div style={s.card}>
        <div style={s.label}>Activity Types</div>
        <div style={s.desc}>
          The job types your team logs against — customize these to match your trade
          (e.g. "Leak Repair" instead of "Preventive Maintenance" for a plumbing business).
        </div>

        {typesLoading ? <p>Loading…</p> : (
          <div style={{ marginTop: 14 }}>
            {activityTypes?.map((t) => (
              <div style={s.typeRow} key={t.id}>
                <span style={{ ...s.swatch, background: t.color }} />
                <span style={s.typeCode}>{t.code}</span>
                <span style={s.typeLabel}>{t.label}</span>
                <button style={s.delBtn} onClick={() => deleteType.mutate(t.id)}>Remove</button>
              </div>
            ))}
          </div>
        )}

        {showForm ? (
          <form
            style={s.form}
            onSubmit={(e) => { e.preventDefault(); createType.mutate(newType); }}
          >
            <input
              style={{ ...s.input, width: 70 }}
              placeholder="Code"
              maxLength={10}
              value={newType.code}
              onChange={(e) => setNewType((f) => ({ ...f, code: e.target.value }))}
              required
            />
            <input
              style={{ ...s.input, flex: 1, minWidth: 160 }}
              placeholder="Label, e.g. Leak Repair"
              value={newType.label}
              onChange={(e) => setNewType((f) => ({ ...f, label: e.target.value }))}
              required
            />
            <input
              type="color"
              style={{ width: 36, height: 34, padding: 2, border: `1px solid ${colors.borderInput}`, borderRadius: 6 }}
              value={newType.color}
              onChange={(e) => setNewType((f) => ({ ...f, color: e.target.value }))}
            />
            <button type="submit" style={s.addBtn} disabled={createType.isPending}>
              {createType.isPending ? 'Adding…' : 'Add'}
            </button>
            <button type="button" style={{ ...s.addBtn, background: colors.bgAlt, color: colors.text }} onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </form>
        ) : (
          <button style={s.addBtn} onClick={() => setShowForm(true)}>+ Add Activity Type</button>
        )}
      </div>
    </div>
  );
}

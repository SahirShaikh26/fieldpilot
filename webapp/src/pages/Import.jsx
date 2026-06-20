import { useState, useRef } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import api from '../api/client';
import colors from '../theme';

const ENTITIES = {
  customers: {
    label: 'Customers',
    icon: '🏭',
    columns: ['name', 'code', 'city', 'region', 'contact_name', 'contact_phone', 'address'],
    required: ['name'],
    sample: [
      { name: 'Acme Corp', code: 'AC001', city: 'Mumbai', region: 'West', contact_name: 'Raj Patel', contact_phone: '9876543210', address: '12 MG Road' },
      { name: 'Beta Industries', code: 'BI002', city: 'Pune', region: 'West', contact_name: 'Sunita Shah', contact_phone: '9123456789', address: '45 Baner Rd' },
    ],
  },
  engineers: {
    label: 'Engineers',
    icon: '👷',
    columns: ['name', 'email', 'password', 'dept', 'role'],
    required: ['name', 'email', 'password'],
    sample: [
      { name: 'Amit Kumar', email: 'amit@company.com', password: 'Pass@1234', dept: 'Electrical', role: 'Engineer' },
      { name: 'Priya Singh', email: 'priya@company.com', password: 'Pass@1234', dept: 'HVAC', role: 'Manager' },
    ],
  },
  projects: {
    label: 'Projects',
    icon: '🗂️',
    columns: ['name', 'customer_name', 'status', 'category', 'start_date', 'end_date', 'value_inr'],
    required: ['name'],
    sample: [
      { name: 'HVAC Install Phase 1', customer_name: 'Acme Corp', status: 'Active', category: 'Installation', start_date: '2024-01-15', end_date: '2024-06-30', value_inr: '250000' },
      { name: 'Annual Maintenance', customer_name: 'Beta Industries', status: 'Planned', category: 'AMC', start_date: '2024-03-01', end_date: '2025-02-28', value_inr: '85000' },
    ],
  },
  machines: {
    label: 'Machines',
    icon: '⚙️',
    columns: ['name', 'customer_name', 'model', 'product_type', 'serial_no', 'install_year', 'warranty_until'],
    required: ['name', 'customer_name'],
    sample: [
      { name: 'Chiller Unit 1', customer_name: 'Acme Corp', model: 'CH-500', product_type: 'Chiller', serial_no: 'SN-2024-001', install_year: '2022', warranty_until: '2025-12-31' },
      { name: 'AHU Block A', customer_name: 'Beta Industries', model: 'AHU-200', product_type: 'AHU', serial_no: 'SN-2023-045', install_year: '2023', warranty_until: '2026-06-30' },
    ],
  },
};

const s = {
  page:      { padding: 24 },
  heading:   { fontSize: 22, fontWeight: 800, color: colors.navy, marginBottom: 4 },
  sub:       { color: colors.textMuted, fontSize: 14, marginBottom: 24 },
  tabs:      { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  tab:       { padding: '8px 18px', borderRadius: 8, border: `1.5px solid ${colors.borderInput}`, background: colors.white, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: colors.text },
  tabActive: { background: colors.blue, color: colors.white, borderColor: colors.blue },
  card:      { background: colors.white, borderRadius: 12, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,.06)', marginBottom: 20 },
  dropzone:  { border: '2px dashed #cbd5e1', borderRadius: 10, padding: 40, textAlign: 'center', cursor: 'pointer', background: colors.bgSlate, transition: 'border-color .2s' },
  dropHover: { borderColor: colors.blue, background: '#eff6ff' },
  dropText:  { color: colors.textMuted, fontSize: 15 },
  dropBtn:   { display: 'inline-block', marginTop: 10, padding: '8px 20px', background: colors.blue, color: colors.white, borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  tplBtn:    { padding: '6px 14px', background: colors.bgAlt, border: `1px solid ${colors.border}`, borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: colors.text },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 12 },
  th:        { background: colors.bgAlt, padding: '8px 12px', textAlign: 'left', color: colors.text, fontWeight: 700, borderBottom: `2px solid ${colors.border}` },
  td:        { padding: '7px 12px', borderBottom: `1px solid ${colors.bgAlt}`, color: colors.text },
  actions:   { display: 'flex', gap: 10, marginTop: 16 },
  importBtn: { padding: '10px 24px', background: colors.green, color: colors.white, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 },
  clearBtn:  { padding: '10px 20px', background: colors.bgAlt, border: `1px solid ${colors.border}`, color: colors.text, borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  badge:     { display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 },
  colHint:   { fontSize: 12, color: colors.textFaint, marginTop: 8 },
};

function downloadTemplate(entity) {
  const { columns, sample } = ENTITIES[entity];
  const header = columns.join(',');
  const rows = sample.map(r => columns.map(c => `"${r[c] || ''}"`).join(','));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fieldpilot_${entity}_template.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Import() {
  const [entity, setEntity] = useState('customers');
  const [rows, setRows] = useState([]);
  const [hover, setHover] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const parseFile = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        setRows(data);
        toast.success(`Parsed ${data.length} rows — review and confirm import`);
      },
      error: () => toast.error('Failed to parse CSV'),
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setHover(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) parseFile(file);
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!rows.length) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/import/${entity}`, { records: rows });
      toast.success(data.message);
      setRows([]);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const cfg = ENTITIES[entity];
  const previewCols = cfg.columns.filter(c => rows.some(r => r[c]));

  return (
    <div style={s.page}>
      <div style={s.heading}>Import Data</div>
      <div style={s.sub}>Upload a CSV file to bulk-import customers, engineers, projects, or machines.</div>

      <div style={s.tabs}>
        {Object.entries(ENTITIES).map(([key, { label, icon }]) => (
          <button
            key={key}
            style={{ ...s.tab, ...(entity === key ? s.tabActive : {}) }}
            onClick={() => { setEntity(key); setRows([]); }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 700, color: colors.navy }}>Upload {cfg.label} CSV</span>
          <button style={s.tplBtn} onClick={() => downloadTemplate(entity)}>
            ⬇ Download Template
          </button>
        </div>

        <div
          style={{ ...s.dropzone, ...(hover ? s.dropHover : {}) }}
          onDragOver={(e) => { e.preventDefault(); setHover(true); }}
          onDragLeave={() => setHover(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
          <div style={s.dropText}>Drag & drop your CSV here, or</div>
          <div style={s.dropBtn}>Browse File</div>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        <div style={s.colHint}>
          Required columns: <strong>{cfg.required.join(', ')}</strong>
          {' · '}All columns: {cfg.columns.join(', ')}
        </div>
      </div>

      {rows.length > 0 && (
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: colors.navy }}>
              Preview — {rows.length} rows
            </span>
            <span style={{ ...s.badge, background: colors.blueBg, color: colors.blueDark }}>
              Ready to import
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>{previewCols.map(c => <th key={c} style={s.th}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((r, i) => (
                  <tr key={i}>
                    {previewCols.map(c => <td key={c} style={s.td}>{r[c] || '—'}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 10 && (
              <div style={{ textAlign: 'center', padding: 10, color: colors.textFaint, fontSize: 13 }}>
                + {rows.length - 10} more rows not shown
              </div>
            )}
          </div>

          <div style={s.actions}>
            <button style={s.importBtn} onClick={handleImport} disabled={loading}>
              {loading ? 'Importing…' : `Import ${rows.length} ${cfg.label}`}
            </button>
            <button style={s.clearBtn} onClick={() => setRows([])}>Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}

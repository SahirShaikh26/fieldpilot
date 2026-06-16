import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { format } from 'date-fns';
import api from '../api/client';

const ACTIVITY_CODES = [
  { code:'PM', label:'PM — Preventive Maintenance' },
  { code:'BD', label:'BD — Breakdown' },
  { code:'IN', label:'IN — Installation' },
  { code:'TR', label:'TR — Training' },
  { code:'SV', label:'SV — Site Visit' },
  { code:'OF', label:'OF — Office Work' },
  { code:'TL', label:'TL — Travel' },
  { code:'LV', label:'LV — Leave' },
];

export default function LogActivityScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    activity_code: 'SV',
    customer_id: '',
    project_id: '',
    query_type: '',
    product_type: '',
    hours: '',
    billing_inr: '',
    cost_inr: '',
    status: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    api.get('/customers').then(r => setCustomers(r.data)).catch(() => {});
    api.get('/projects').then(r => setProjects(r.data)).catch(() => {});
  }, []);

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.activity_code) { Alert.alert('Required', 'Select an activity code'); return; }
    setSaving(true);
    try {
      await api.post('/logs', form);
      Alert.alert('Saved!', 'Activity logged successfully', [{ text:'OK', onPress:()=>navigation.navigate('Logs') }]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, children }) => (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Field label="Date">
        <TextInput style={s.input} value={form.date} onChangeText={set('date')} placeholder="YYYY-MM-DD" />
      </Field>

      <Field label="Activity Code *">
        <View style={s.pickerWrap}>
          <Picker selectedValue={form.activity_code} onValueChange={set('activity_code')}>
            {ACTIVITY_CODES.map(a => <Picker.Item key={a.code} label={a.label} value={a.code} />)}
          </Picker>
        </View>
      </Field>

      <Field label="Customer">
        <View style={s.pickerWrap}>
          <Picker selectedValue={form.customer_id} onValueChange={set('customer_id')}>
            <Picker.Item label="Select customer…" value="" />
            {customers.map(c => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
          </Picker>
        </View>
      </Field>

      <Field label="Project">
        <View style={s.pickerWrap}>
          <Picker selectedValue={form.project_id} onValueChange={set('project_id')}>
            <Picker.Item label="Select project…" value="" />
            {projects.map(p => <Picker.Item key={p.id} label={p.name} value={p.id} />)}
          </Picker>
        </View>
      </Field>

      <View style={s.row}>
        <Field label="Hours">
          <TextInput style={[s.input, s.half]} value={form.hours} onChangeText={set('hours')} keyboardType="numeric" placeholder="0.0" />
        </Field>
        <Field label="Location">
          <TextInput style={[s.input, s.half]} value={form.location} onChangeText={set('location')} placeholder="City / Site" />
        </Field>
      </View>

      <View style={s.row}>
        <Field label="Billing (₹)">
          <TextInput style={[s.input, s.half]} value={form.billing_inr} onChangeText={set('billing_inr')} keyboardType="numeric" placeholder="0" />
        </Field>
        <Field label="Cost (₹)">
          <TextInput style={[s.input, s.half]} value={form.cost_inr} onChangeText={set('cost_inr')} keyboardType="numeric" placeholder="0" />
        </Field>
      </View>

      <Field label="Query Type">
        <TextInput style={s.input} value={form.query_type} onChangeText={set('query_type')} placeholder="e.g. Breakdown query" />
      </Field>

      <Field label="Notes">
        <TextInput style={[s.input, s.textarea]} value={form.notes} onChangeText={set('notes')}
          placeholder="Describe what was done…" multiline numberOfLines={3} textAlignVertical="top" />
      </Field>

      <TouchableOpacity style={[s.btn, saving && s.btnDisabled]} onPress={handleSave} disabled={saving}>
        <Text style={s.btnText}>{saving ? 'Saving…' : 'Save Log'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:  { flex:1, backgroundColor:'#f0f4ff' },
  content:    { padding:16, paddingBottom:40 },
  field:      { marginBottom:14, flex:1 },
  label:      { fontSize:13, fontWeight:'600', color:'#374151', marginBottom:5 },
  input:      { backgroundColor:'#fff', borderWidth:1, borderColor:'#d1d5db', borderRadius:8, padding:11, fontSize:14, color:'#1e293b' },
  textarea:   { height:80 },
  half:       { flex:1 },
  pickerWrap: { backgroundColor:'#fff', borderWidth:1, borderColor:'#d1d5db', borderRadius:8, overflow:'hidden' },
  row:        { flexDirection:'row', gap:12 },
  btn:        { backgroundColor:'#2563eb', borderRadius:12, padding:16, alignItems:'center', marginTop:8 },
  btnDisabled:{ opacity:.6 },
  btnText:    { color:'#fff', fontSize:16, fontWeight:'700' },
});

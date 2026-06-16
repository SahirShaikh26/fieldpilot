import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { format } from 'date-fns';
import api from '../api/client';

const ACT_COLOR = { PM:'#dbeafe', BD:'#fee2e2', IN:'#dcfce7', TR:'#fef9c3', SV:'#f3e8ff', OF:'#e0f2fe', TL:'#fce7f3', LV:'#f1f5f9' };
const ACT_TEXT  = { PM:'#1d4ed8', BD:'#dc2626', IN:'#16a34a', TR:'#ca8a04', SV:'#7c3aed', OF:'#0369a1', TL:'#be185d', LV:'#475569' };

export default function LogsScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const { data } = await api.get('/logs', { params: { limit:50 } });
      setLogs(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, []);

  const renderItem = ({ item: log }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.date}>{format(new Date(log.date), 'dd MMM yyyy')}</Text>
        <View style={[s.badge, { backgroundColor: ACT_COLOR[log.activity_code]||'#f1f5f9' }]}>
          <Text style={[s.badgeText, { color: ACT_TEXT[log.activity_code]||'#475569' }]}>{log.activity_code}</Text>
        </View>
      </View>
      {log.customer_name && <Text style={s.customer}>🏭 {log.customer_name}</Text>}
      <View style={s.cardFooter}>
        {log.hours && <Text style={s.meta}>{log.hours}h</Text>}
        {log.billing_inr > 0 && <Text style={s.meta}>₹{Number(log.billing_inr).toLocaleString('en-IN')}</Text>}
        {log.status && <Text style={s.status}>{log.status}</Text>}
      </View>
      {log.notes ? <Text style={s.notes} numberOfLines={2}>{log.notes}</Text> : null}
    </View>
  );

  if (loading) return <View style={s.center}><Text>Loading…</Text></View>;

  return (
    <FlatList
      style={s.container}
      data={logs}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding:16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{ setRefreshing(true); fetchLogs(); }} />}
      ListEmptyComponent={<View style={s.center}><Text style={s.empty}>No logs yet. Tap "Log Activity" to add one.</Text></View>}
    />
  );
}

const s = StyleSheet.create({
  container:   { flex:1, backgroundColor:'#f0f4ff' },
  center:      { flex:1, alignItems:'center', justifyContent:'center', padding:32 },
  empty:       { color:'#94a3b8', textAlign:'center' },
  card:        { backgroundColor:'#fff', borderRadius:12, padding:14, marginBottom:10, elevation:2 },
  cardHeader:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:6 },
  date:        { fontWeight:'700', color:'#1e3a5f', fontSize:14 },
  badge:       { paddingHorizontal:10, paddingVertical:3, borderRadius:20 },
  badgeText:   { fontSize:12, fontWeight:'700' },
  customer:    { color:'#64748b', fontSize:13, marginBottom:6 },
  cardFooter:  { flexDirection:'row', gap:12 },
  meta:        { fontSize:13, color:'#2563eb', fontWeight:'600' },
  status:      { fontSize:12, color:'#64748b', backgroundColor:'#f1f5f9', paddingHorizontal:8, paddingVertical:2, borderRadius:10 },
  notes:       { marginTop:6, fontSize:12, color:'#64748b', fontStyle:'italic' },
});

import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { format } from 'date-fns';
import api from '../api/client';
import COLORS from '../theme';

export default function LogsScreen() {
  const [logs, setLogs] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
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

  useEffect(() => {
    fetchLogs();
    api.get('/activity-types').then(r => setActivityTypes(r.data)).catch(() => {});
  }, []);

  const typeFor = (code) => activityTypes.find(t => t.code === code);

  const renderItem = ({ item: log }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.date}>{format(new Date(log.date), 'dd MMM yyyy')}</Text>
        <View style={[s.badge, { backgroundColor: typeFor(log.activity_code)?.color ? `${typeFor(log.activity_code).color}1A` : '#f1f5f9' }]}>
          <Text style={[s.badgeText, { color: typeFor(log.activity_code)?.color || '#475569' }]}>{log.activity_code}</Text>
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
  container:   { flex:1, backgroundColor:COLORS.bg },
  center:      { flex:1, alignItems:'center', justifyContent:'center', padding:32 },
  empty:       { color:COLORS.textFaint, textAlign:'center' },
  card:        { backgroundColor:COLORS.white, borderRadius:12, padding:14, marginBottom:10, elevation:2 },
  cardHeader:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:6 },
  date:        { fontWeight:'700', color:COLORS.navy, fontSize:14 },
  badge:       { paddingHorizontal:10, paddingVertical:3, borderRadius:20 },
  badgeText:   { fontSize:12, fontWeight:'700' },
  customer:    { color:COLORS.textMuted, fontSize:13, marginBottom:6 },
  cardFooter:  { flexDirection:'row', gap:12 },
  meta:        { fontSize:13, color:COLORS.blue, fontWeight:'600' },
  status:      { fontSize:12, color:COLORS.textMuted, backgroundColor:COLORS.bgAlt, paddingHorizontal:8, paddingVertical:2, borderRadius:10 },
  notes:       { marginTop:6, fontSize:12, color:COLORS.textMuted, fontStyle:'italic' },
});

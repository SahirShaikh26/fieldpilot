import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { format, startOfMonth } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import api from '../api/client';

function StatCard({ label, value, color = '#2563eb' }) {
  return (
    <View style={s.statCard}>
      <Text style={[s.statValue, { color }]}>{value ?? '—'}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dateFrom = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    api.get('/reports/summary', { params: { date_from: dateFrom } })
      .then(r => setSummary(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text:'Cancel', style:'cancel' },
      { text:'Logout', style:'destructive', onPress: logout },
    ]);
  };

  const t = summary?.totals;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={s.month}>{format(new Date(), 'MMMM yyyy')} MTD</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? <Text style={s.loading}>Loading…</Text> : (
        <>
          <View style={s.statsGrid}>
            <StatCard label="Logs" value={t?.total_logs} />
            <StatCard label="Hours" value={Number(t?.total_hours||0).toFixed(1)} color="#059669" />
            <StatCard label="Billing" value={t?.total_billing ? `₹${Math.round(t.total_billing/1000)}K` : '₹0'} color="#d97706" />
            <StatCard label="Customers" value={t?.customers_served} color="#7c3aed" />
          </View>

          <TouchableOpacity style={s.primaryBtn} onPress={() => navigation.navigate('Log Activity')}>
            <Text style={s.primaryBtnText}>✏️  Log Today's Activity</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.secondaryBtn} onPress={() => navigation.navigate('Check In')}>
            <Text style={s.secondaryBtnText}>📍  Check In / Out</Text>
          </TouchableOpacity>

          {summary?.by_activity?.length > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Activity Breakdown</Text>
              {summary.by_activity.map(a => (
                <View key={a.activity_code} style={s.row}>
                  <Text style={s.rowCode}>{a.activity_code}</Text>
                  <Text style={s.rowVal}>{a.count} logs</Text>
                  <Text style={s.rowVal}>{Number(a.hours||0).toFixed(1)}h</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    { flex:1, backgroundColor:'#f0f4ff' },
  content:      { padding:16 },
  header:       { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  greeting:     { fontSize:20, fontWeight:'800', color:'#1e3a5f' },
  month:        { fontSize:13, color:'#64748b', marginTop:2 },
  logoutBtn:    { backgroundColor:'#fee2e2', paddingHorizontal:12, paddingVertical:6, borderRadius:8 },
  logoutText:   { color:'#dc2626', fontSize:13, fontWeight:'600' },
  loading:      { textAlign:'center', marginTop:40, color:'#64748b' },
  statsGrid:    { flexDirection:'row', flexWrap:'wrap', gap:12, marginBottom:16 },
  statCard:     { flex:1, minWidth:'40%', backgroundColor:'#fff', borderRadius:12, padding:16, alignItems:'center', elevation:2 },
  statValue:    { fontSize:22, fontWeight:'800', marginBottom:4 },
  statLabel:    { fontSize:12, color:'#64748b' },
  primaryBtn:   { backgroundColor:'#2563eb', borderRadius:12, padding:16, alignItems:'center', marginBottom:10 },
  primaryBtnText:{ color:'#fff', fontSize:16, fontWeight:'700' },
  secondaryBtn: { backgroundColor:'#fff', borderRadius:12, padding:16, alignItems:'center', marginBottom:20, borderWidth:1, borderColor:'#e2e8f0' },
  secondaryBtnText:{ color:'#1e3a5f', fontSize:16, fontWeight:'700' },
  card:         { backgroundColor:'#fff', borderRadius:12, padding:16, elevation:2, marginBottom:16 },
  cardTitle:    { fontSize:15, fontWeight:'700', color:'#1e3a5f', marginBottom:12 },
  row:          { flexDirection:'row', justifyContent:'space-between', paddingVertical:6, borderBottomWidth:1, borderBottomColor:'#f1f5f9' },
  rowCode:      { fontWeight:'700', color:'#2563eb', width:40 },
  rowVal:       { color:'#374151', fontSize:13 },
});

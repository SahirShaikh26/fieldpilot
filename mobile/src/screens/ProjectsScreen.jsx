import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import COLORS from '../theme';

const STATUS_COLORS = {
  Planned:'#dbeafe', 'In Progress':'#dcfce7', Completed:'#f0fdf4',
  'On Hold':'#fef9c3', Cancelled:'#fee2e2',
};
const STATUS_TEXT = {
  Planned:'#1d4ed8', 'In Progress':'#16a34a', Completed:'#15803d',
  'On Hold':'#ca8a04', Cancelled:'#dc2626',
};

export default function ProjectsScreen() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchProjects(); }, [fetchProjects]));

  const renderItem = ({ item: p }) => (
    <View style={s.card}>
      <View style={[s.badge, { backgroundColor: STATUS_COLORS[p.status]||'#f1f5f9' }]}>
        <Text style={[s.badgeText, { color: STATUS_TEXT[p.status]||'#475569' }]}>{p.status}</Text>
      </View>
      <Text style={s.name}>{p.name}</Text>
      {p.customer_name && <Text style={s.meta}>🏭 {p.customer_name}</Text>}
      {p.engineer_name && <Text style={s.meta}>👷 {p.engineer_name}</Text>}
      {p.value_inr && <Text style={s.meta}>💰 ₹{Number(p.value_inr).toLocaleString('en-IN')}</Text>}
    </View>
  );

  if (loading) return <View style={s.center}><Text>Loading…</Text></View>;

  return (
    <FlatList
      style={s.container}
      data={projects}
      keyExtractor={i => i.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding:16 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchProjects} />}
      ListEmptyComponent={<View style={s.center}><Text style={{ color:'#94a3b8' }}>No projects found</Text></View>}
    />
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:COLORS.bg },
  center:    { flex:1, alignItems:'center', justifyContent:'center', padding:32 },
  card:      { backgroundColor:COLORS.white, borderRadius:12, padding:16, marginBottom:10, elevation:2 },
  badge:     { alignSelf:'flex-start', paddingHorizontal:10, paddingVertical:3, borderRadius:20, marginBottom:8 },
  badgeText: { fontSize:12, fontWeight:'700' },
  name:      { fontSize:15, fontWeight:'700', color:COLORS.navy, marginBottom:6 },
  meta:      { fontSize:13, color:COLORS.textMuted, marginBottom:3 },
});

import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { format } from 'date-fns';
import api from '../api/client';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import COLORS from '../theme';

export default function VisitCheckinScreen() {
  const { submit } = useOfflineQueue();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);

  useEffect(() => {
    fetchToday();
  }, []);

  const fetchToday = async () => {
    const today = format(new Date(), 'yyyy-MM');
    try {
      const { data } = await api.get(`/engineers/me`);
      const att = await api.get(`/engineers/${data.id}/attendance`, { params: { month: today } });
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const todayRec = att.data.find(a => a.date?.startsWith(todayStr));
      setTodayRecord(todayRec || null);
    } catch (err) {
      console.error(err);
    }
  };

  const getLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for check-in');
        return null;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      return { lat: loc.coords.latitude, lng: loc.coords.longitude };
    } catch {
      return null;
    } finally {
      setLocLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    const loc = await getLocation();
    try {
      const { queued, data } = await submit('/engineers/attendance/checkin', {
        lat: loc?.lat,
        lng: loc?.lng,
        location: 'Field',
      });
      if (queued) {
        setTodayRecord({ check_in: new Date().toISOString(), check_out: null });
        Alert.alert('Checked In (offline)', "No connection — this will sync automatically once you're back online.");
      } else {
        setTodayRecord(data);
        Alert.alert('Checked In!', `Check-in recorded at ${format(new Date(data.check_in), 'hh:mm a')}`);
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const { queued, data } = await submit('/engineers/attendance/checkout', {});
      if (queued) {
        setTodayRecord((r) => ({ ...r, check_out: new Date().toISOString() }));
        Alert.alert('Checked Out (offline)', "No connection — this will sync automatically once you're back online.");
      } else {
        setTodayRecord(data);
        Alert.alert('Checked Out!', `Check-out recorded at ${format(new Date(data.check_out), 'hh:mm a')}`);
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  const isCheckedIn = !!todayRecord?.check_in;
  const isCheckedOut = !!todayRecord?.check_out;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Today's Attendance</Text>
      <Text style={s.date}>{format(new Date(), 'EEEE, dd MMMM yyyy')}</Text>

      <View style={s.card}>
        <View style={s.statusRow}>
          <View style={[s.dot, { backgroundColor: isCheckedIn ? '#22c55e' : '#e2e8f0' }]} />
          <Text style={s.statusText}>
            {isCheckedOut ? 'Completed' : isCheckedIn ? 'Currently Checked In' : 'Not yet checked in'}
          </Text>
        </View>

        {todayRecord?.check_in && (
          <View style={s.timeRow}>
            <Text style={s.timeLabel}>Check-in</Text>
            <Text style={s.timeValue}>{format(new Date(todayRecord.check_in), 'hh:mm a')}</Text>
          </View>
        )}
        {todayRecord?.check_out && (
          <View style={s.timeRow}>
            <Text style={s.timeLabel}>Check-out</Text>
            <Text style={s.timeValue}>{format(new Date(todayRecord.check_out), 'hh:mm a')}</Text>
          </View>
        )}
      </View>

      {!isCheckedIn && (
        <TouchableOpacity style={[s.btn, s.btnGreen]} onPress={handleCheckIn} disabled={loading || locLoading}>
          {(loading || locLoading) ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>📍  Check In</Text>}
        </TouchableOpacity>
      )}

      {isCheckedIn && !isCheckedOut && (
        <TouchableOpacity style={[s.btn, s.btnRed]} onPress={handleCheckOut} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>🏁  Check Out</Text>}
        </TouchableOpacity>
      )}

      {isCheckedOut && (
        <View style={s.doneCard}>
          <Text style={s.doneText}>✅ Attendance complete for today</Text>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:  { flex:1, backgroundColor:COLORS.bg },
  content:    { padding:20 },
  title:      { fontSize:22, fontWeight:'800', color:COLORS.navy, marginBottom:4 },
  date:       { fontSize:14, color:COLORS.textMuted, marginBottom:24 },
  card:       { backgroundColor:COLORS.white, borderRadius:14, padding:20, elevation:2, marginBottom:20 },
  statusRow:  { flexDirection:'row', alignItems:'center', marginBottom:16 },
  dot:        { width:12, height:12, borderRadius:6, marginRight:10 },
  statusText: { fontSize:15, fontWeight:'600', color:COLORS.text },
  timeRow:    { flexDirection:'row', justifyContent:'space-between', paddingVertical:8, borderTopWidth:1, borderTopColor:COLORS.bgAlt },
  timeLabel:  { color:COLORS.textMuted, fontSize:14 },
  timeValue:  { fontWeight:'700', color:COLORS.navy, fontSize:14 },
  btn:        { borderRadius:14, padding:18, alignItems:'center', marginBottom:12 },
  btnGreen:   { backgroundColor:COLORS.green },
  btnRed:     { backgroundColor:COLORS.red },
  btnText:    { color:COLORS.white, fontSize:17, fontWeight:'700' },
  doneCard:   { backgroundColor:COLORS.greenBg, borderRadius:12, padding:16, alignItems:'center' },
  doneText:   { color:COLORS.green, fontSize:15, fontWeight:'600' },
});

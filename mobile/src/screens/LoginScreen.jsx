import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import COLORS from '../theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Enter email and password'); return; }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.error || 'Check your credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.card}>
        <Text style={s.logo}>⚡ FieldPilot</Text>
        <Text style={s.sub}>Field Service Management</Text>
        <TextInput style={s.input} placeholder="Email" value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#94a3b8" />
        <TextInput style={s.input} placeholder="Password" value={password} onChangeText={setPassword}
          secureTextEntry placeholderTextColor="#94a3b8" />
        <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleLogin} disabled={loading}>
          <Text style={s.btnText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:COLORS.bg, justifyContent:'center', alignItems:'center', padding:20 },
  card:      { backgroundColor:COLORS.white, borderRadius:16, padding:32, width:'100%', maxWidth:380, shadowColor:COLORS.black, shadowOpacity:.1, shadowRadius:12, elevation:4 },
  logo:      { fontSize:26, fontWeight:'800', color:COLORS.navy, textAlign:'center', marginBottom:4 },
  sub:       { fontSize:14, color:COLORS.textMuted, textAlign:'center', marginBottom:28 },
  input:     { borderWidth:1, borderColor:COLORS.borderInput, borderRadius:8, padding:12, fontSize:15, marginBottom:14, color:COLORS.textDark },
  btn:       { backgroundColor:COLORS.blue, borderRadius:8, padding:14, alignItems:'center', marginTop:4 },
  btnDisabled:{ opacity:.6 },
  btnText:   { color:COLORS.white, fontSize:16, fontWeight:'700' },
});

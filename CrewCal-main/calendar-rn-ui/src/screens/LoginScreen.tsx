import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { colors } from "../utils/theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email,setEmail] = useState("");
  const [pw,setPw] = useState("");
  const [err,setErr] = useState<string|null>(null);
  const [loading,setLoading] = useState(false);

  const onSubmit = async () => {
    setErr(null); setLoading(true);
    try {
      const ok = await login(email, pw);
      if (!ok) setErr("이메일/비밀번호를 입력해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS==="ios" ? "padding" : undefined} style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.sub}>캘린더 UI에 접속하려면 로그인하세요.</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            autoCapitalize="none"
          />

          <Text style={[styles.label,{marginTop:12}]}>Password</Text>
          <TextInput
            value={pw}
            onChangeText={setPw}
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            secureTextEntry
          />

          {err && <Text style={styles.err}>{err}</Text>}

          <TouchableOpacity style={[styles.btn, loading && {opacity:0.7}]} onPress={onSubmit} disabled={loading}>
            <Text style={styles.btnTxt}>{loading ? "Logging in..." : "Login"}</Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            * UI만 구현. 실제 인증은 <Text style={{fontWeight:"800"}}>src/auth/AuthContext.tsx</Text> 의 TODO에 서버 연결하면 됩니다.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"#F8FAFC",padding:16},
  card:{width:"100%",maxWidth:420,borderRadius:18,backgroundColor:"#fff",borderWidth:1,borderColor:colors.border,overflow:"hidden"},
  header:{padding:16,borderBottomWidth:1,borderBottomColor:colors.border},
  title:{fontSize:18,fontWeight:"900",color:colors.text},
  sub:{marginTop:4,fontSize:13,color:colors.muted},
  body:{padding:16},
  label:{fontSize:13,fontWeight:"800",color:colors.text},
  input:{marginTop:8,borderWidth:1,borderColor:colors.border,borderRadius:12,paddingHorizontal:12,paddingVertical:10,color:colors.text},
  err:{marginTop:10,color:"#DC2626",fontWeight:"700"},
  btn:{marginTop:14,borderRadius:12,backgroundColor:colors.dark,paddingVertical:12,alignItems:"center"},
  btnTxt:{color:"#fff",fontWeight:"900"},
  note:{marginTop:12,fontSize:12,color:colors.muted,lineHeight:18},
});

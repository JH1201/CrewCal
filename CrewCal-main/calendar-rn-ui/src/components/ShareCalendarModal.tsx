import React, { useMemo, useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { CalendarItem, CalendarShare, ShareRole } from "../types";
import { colors } from "../utils/theme";

export default function ShareCalendarModal({
  visible, onClose, calendar, shares, onAddShare,
}: {
  visible: boolean;
  onClose: () => void;
  calendar: CalendarItem | null;
  shares: CalendarShare[];
  onAddShare: (email: string, role: ShareRole) => void;
}) {
  const [email,setEmail] = useState("");
  const [role,setRole] = useState<ShareRole>("Viewer");
  const title = useMemo(()=> calendar ? `Share "${calendar.name}"` : "Share calendar", [calendar]);
  const canShare = useMemo(()=> email.trim().length>0,[email]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.center}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.dot} />
            <View style={{flex:1}}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.sub}>Invite people to view or edit this calendar</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}><Text style={styles.closeTxt}>×</Text></TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{padding:16}}>
            <View style={{flexDirection:"row",gap:10}}>
              <TextInput value={email} onChangeText={setEmail} placeholder="Enter email address" style={[styles.input,{flex:1}]} placeholderTextColor="#94A3B8" />
              <View style={styles.pickerWrap}>
                <Picker selectedValue={role} onValueChange={(v)=>setRole(v)} style={styles.picker}>
                  <Picker.Item label="Viewer" value="Viewer" />
                  <Picker.Item label="Editor" value="Editor" />
                  <Picker.Item label="Free/Busy" value="Free/Busy" />
                </Picker>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.shareBtn, !canShare && {opacity:0.55}]}
              disabled={!canShare}
              onPress={()=>{
                onAddShare(email.trim(), role);
                setEmail(""); setRole("Viewer");
              }}
            >
              <Text style={styles.shareBtnTxt}>👤 Share</Text>
            </TouchableOpacity>

            <View style={styles.permCard}>
              <Text style={styles.permTitle}>Permission levels:</Text>
              <View style={{marginTop:10,gap:8}}>
                <Text style={styles.permLine}>✎  Editor:  <Text style={styles.permMuted}>Can edit events</Text></Text>
                <Text style={styles.permLine}>👁  Viewer:  <Text style={styles.permMuted}>Read only</Text></Text>
                <Text style={styles.permLine}>🕒  Free/Busy:  <Text style={styles.permMuted}>See availability only</Text></Text>
              </View>
            </View>

            <Text style={styles.section}>People with access</Text>
            <View style={{gap:10, marginTop:10}}>
              {shares.map(s=>(
                <View key={s.id} style={styles.personRow}>
                  <View style={styles.avatar}><Text style={styles.avatarTxt}>{s.email.trim().charAt(0).toUpperCase()}</Text></View>
                  <View style={{flex:1}}>
                    <Text style={styles.personEmail}>{s.email}</Text>
                    <Text style={styles.personRole}>{s.isOwner ? "Owner" : s.role}</Text>
                  </View>
                  <View style={[styles.badge, s.isOwner && styles.badgeOwner]}>
                    <Text style={[styles.badgeTxt, s.isOwner && styles.badgeOwnerTxt]}>{s.isOwner ? "Owner" : s.role}</Text>
                  </View>
                </View>
              ))}
              {shares.length<=1 && <Text style={styles.noone}>No one else has access yet</Text>}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:{position:"absolute",left:0,right:0,top:0,bottom:0,backgroundColor:colors.overlay},
  center:{flex:1,alignItems:"center",justifyContent:"center",padding:16},
  card:{width:"100%",maxWidth:560,borderRadius:16,backgroundColor:colors.bg,overflow:"hidden"},
  header:{flexDirection:"row",alignItems:"flex-start",padding:16,borderBottomWidth:1,borderBottomColor:colors.border,gap:10},
  dot:{width:10,height:10,borderRadius:5,backgroundColor:"#2563EB",marginTop:6},
  title:{fontSize:18,fontWeight:"800",color:colors.text},
  sub:{marginTop:4,fontSize:13,color:colors.muted},
  closeBtn:{paddingHorizontal:10,paddingVertical:6,borderRadius:10},
  closeTxt:{fontSize:18,color:colors.text},
  input:{borderWidth:1,borderColor:colors.border,borderRadius:12,paddingHorizontal:12,paddingVertical:10,color:colors.text},
  pickerWrap:{width:140,borderWidth:1,borderColor:colors.border,borderRadius:12,overflow:"hidden",justifyContent:"center"},
  picker:{height:44},
  shareBtn:{marginTop:12,borderRadius:12,backgroundColor:"#64748B",paddingVertical:12,alignItems:"center"},
  shareBtnTxt:{color:"#fff",fontWeight:"800"},
  permCard:{marginTop:14,borderWidth:1,borderColor:colors.border,borderRadius:16,backgroundColor:colors.soft,padding:14},
  permTitle:{fontSize:12,fontWeight:"800",color:colors.muted},
  permLine:{fontSize:13,fontWeight:"700",color:colors.text},
  permMuted:{color:colors.muted,fontWeight:"600"},
  section:{marginTop:16,fontSize:14,fontWeight:"800",color:colors.text},
  personRow:{flexDirection:"row",alignItems:"center",borderWidth:1,borderColor:colors.border,borderRadius:16,padding:12,gap:10,backgroundColor:colors.bg},
  avatar:{width:36,height:36,borderRadius:18,backgroundColor:"#E9D5FF",alignItems:"center",justifyContent:"center"},
  avatarTxt:{color:"#6D28D9",fontWeight:"900"},
  personEmail:{fontSize:13,fontWeight:"800",color:colors.text},
  personRole:{fontSize:12,color:colors.muted,marginTop:2},
  badge:{backgroundColor:"#F1F5F9",borderRadius:999,paddingHorizontal:10,paddingVertical:6},
  badgeTxt:{fontSize:12,fontWeight:"800",color:colors.text},
  badgeOwner:{backgroundColor:"#E9D5FF"},
  badgeOwnerTxt:{color:"#6D28D9"},
  noone:{textAlign:"center",color:colors.muted,marginTop:8},
});

import React, { useMemo, useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { colors } from "../utils/theme";

const PALETTE = ["#3B82F6","#10B981","#8B5CF6","#F59E0B","#EF4444","#EC4899","#06B6D4","#84CC16","#F97316","#6366F1"];

export default function NewCalendarModal({
  visible, onClose, onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
}) {
  const [name,setName] = useState("");
  const [color,setColor] = useState(PALETTE[0]);
  const canSubmit = useMemo(()=>name.trim().length>0,[name]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.center}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={{flex:1}}>
              <Text style={styles.title}>Create New Calendar</Text>
              <Text style={styles.sub}>Add a new calendar to organize your events</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}><Text style={styles.closeTxt}>×</Text></TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={styles.label}>Calendar Name</Text>
            <TextInput value={name} onChangeText={setName} placeholder="e.g., Work, Personal, Meetings" style={styles.input} placeholderTextColor="#94A3B8" />

            <Text style={[styles.label,{marginTop:14}]}>Color</Text>
            <View style={styles.colors}>
              {PALETTE.map(c=>(
                <TouchableOpacity key={c} style={[styles.colorDot,{backgroundColor:c}, c===color && styles.colorSelected]} onPress={()=>setColor(c)} />
              ))}
            </View>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancel} onPress={onClose}><Text style={styles.cancelTxt}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity
                style={[styles.create, !canSubmit && {opacity:0.55}]}
                disabled={!canSubmit}
                onPress={()=>{
                  onCreate(name.trim(), color);
                  setName("");
                  setColor(PALETTE[0]);
                }}
              >
                <Text style={styles.createTxt}>Create Calendar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:{position:"absolute",left:0,right:0,top:0,bottom:0,backgroundColor:colors.overlay},
  center:{flex:1,alignItems:"center",justifyContent:"center",padding:16},
  card:{width:"100%",maxWidth:520,borderRadius:16,backgroundColor:colors.bg,overflow:"hidden"},
  header:{flexDirection:"row",padding:16,borderBottomWidth:1,borderBottomColor:colors.border,alignItems:"flex-start",gap:10},
  title:{fontSize:18,fontWeight:"800",color:colors.text},
  sub:{marginTop:4,fontSize:13,color:colors.muted},
  closeBtn:{paddingHorizontal:10,paddingVertical:6,borderRadius:10},
  closeTxt:{fontSize:18,color:colors.text},
  body:{padding:16},
  label:{fontSize:13,fontWeight:"800",color:colors.text},
  input:{marginTop:8,borderWidth:1,borderColor:colors.border,borderRadius:12,paddingHorizontal:12,paddingVertical:10,color:colors.text},
  colors:{marginTop:10,flexDirection:"row",flexWrap:"wrap",gap:10},
  colorDot:{width:34,height:34,borderRadius:17,borderWidth:1,borderColor:"rgba(0,0,0,0.08)"},
  colorSelected:{borderWidth:3,borderColor:colors.text},
  footer:{marginTop:16,flexDirection:"row",justifyContent:"flex-end",gap:10},
  cancel:{borderWidth:1,borderColor:colors.border,paddingHorizontal:14,paddingVertical:10,borderRadius:12},
  cancelTxt:{fontWeight:"700",color:colors.text},
  create:{backgroundColor:"#64748B",paddingHorizontal:14,paddingVertical:10,borderRadius:12},
  createTxt:{fontWeight:"800",color:"#fff"},
});

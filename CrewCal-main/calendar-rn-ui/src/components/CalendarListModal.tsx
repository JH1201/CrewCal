import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable, ScrollView } from "react-native";
import { CalendarItem } from "../types";
import { colors } from "../utils/theme";

export default function CalendarListModal({
  visible,
  onClose,
  calendars,
  onToggle,
  onShare,
  onNew,
}: {
  visible: boolean;
  onClose: () => void;
  calendars: CalendarItem[];
  onToggle: (id: string) => void;
  onShare: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.center}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Calendars</Text>
            <View style={{flexDirection:"row", gap:10}}>
              <TouchableOpacity style={styles.newBtn} onPress={onNew}>
                <Text style={styles.newTxt}>＋ New</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeTxt}>×</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ padding: 14, gap: 10 }}>
            {calendars.map(c => (
              <View key={c.id} style={styles.row}>
                <TouchableOpacity style={styles.left} onPress={() => onToggle(c.id)} activeOpacity={0.85}>
                  <View style={[styles.checkbox, c.checked && styles.checkboxOn]}>
                    {c.checked && <Text style={styles.check}>✓</Text>}
                  </View>
                  <View style={[styles.dot,{backgroundColor:c.color, opacity: c.checked ? 1 : 0.3}]} />
                  <Text style={[styles.name, !c.checked && {opacity:0.5}]} numberOfLines={1}>{c.name}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.shareBtn} onPress={() => onShare(c.id)}>
                  <Text style={styles.shareTxt}>Share</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:{position:"absolute",left:0,right:0,top:0,bottom:0,backgroundColor:colors.overlay},
  center:{flex:1,alignItems:"center",justifyContent:"center",padding:16},
  card:{width:"100%",maxWidth:420,borderRadius:16,backgroundColor:colors.bg,overflow:"hidden"},
  header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",padding:14,borderBottomWidth:1,borderBottomColor:colors.border},
  title:{fontSize:16,fontWeight:"900",color:colors.text},
  newBtn:{backgroundColor:colors.dark,borderRadius:12,paddingHorizontal:12,paddingVertical:8},
  newTxt:{color:"#fff",fontWeight:"900"},
  closeBtn:{paddingHorizontal:10,paddingVertical:6,borderRadius:10},
  closeTxt:{fontSize:18,color:colors.text},
  row:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderWidth:1,borderColor:colors.border,borderRadius:14,paddingHorizontal:12,paddingVertical:10},
  left:{flexDirection:"row",alignItems:"center",gap:10,flex:1},
  checkbox:{width:22,height:22,borderRadius:6,borderWidth:1,borderColor:colors.border,alignItems:"center",justifyContent:"center",backgroundColor:"#fff"},
  checkboxOn:{backgroundColor:"#111827",borderColor:"#111827"},
  check:{color:"#fff",fontWeight:"900"},
  dot:{width:10,height:10,borderRadius:5},
  name:{fontWeight:"900",color:colors.text,flex:1},
  shareBtn:{borderWidth:1,borderColor:colors.border,borderRadius:12,paddingHorizontal:10,paddingVertical:8},
  shareTxt:{fontWeight:"900",color:colors.text},
});

import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { colors } from "../utils/theme";
import { Feather } from "@expo/vector-icons";


const palette = ["#3B82F6","#22C55E","#A855F7","#F59E0B","#EF4444","#EC4899","#06B6D4","#84CC16","#F97316","#6366F1"];

export default function CalendarRowMenu({
  visible,
  onClose,
  onShare,
  onDelete,
  onPickColor,
}:{
  visible:boolean;
  onClose:()=>void;
  onShare:()=>void;
  onDelete:()=>void;
  onPickColor:(c:string)=>void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.pop}>
        <TouchableOpacity style={[styles.item, styles.itemRow]} onPress={() => { onClose(); onShare(); }}>
          <Feather name="share-2" size={18} color={colors.text} style={styles.itemIcon} />
          <Text style={styles.itemTxt}>Share Calendar</Text>
        </TouchableOpacity>


        <View style={styles.sep} />

        <Text style={styles.label}>Color</Text>
        <View style={styles.colors}>
          {palette.map(c => (
            <TouchableOpacity key={c} style={[styles.swatch,{backgroundColor:c}]} onPress={() => { onPickColor(c); onClose(); }} />
          ))}
        </View>

        <View style={styles.sep} />

        <TouchableOpacity style={[styles.item, {gap:8}]} onPress={() => { onClose(); onDelete(); }}>
          <Text style={[styles.itemTxt,{color:"#EF4444"}]}>Delete Calendar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:{position:"absolute",left:0,right:0,top:0,bottom:0,backgroundColor:"transparent"},
  pop:{position:"absolute",left:130,top:140,backgroundColor:"#fff",borderRadius:14,borderWidth:1,borderColor:colors.border,padding:12,width:200,shadowColor:"#000",shadowOpacity:0.1,shadowRadius:16},
  item:{paddingVertical:10,paddingHorizontal:8,borderRadius:10},
  itemTxt:{fontWeight:"900",color:colors.text},
  sep:{height:1,backgroundColor:colors.border,marginVertical:10},
  label:{fontSize:12,fontWeight:"900",color:colors.muted,marginBottom:8},
  colors:{flexDirection:"row",flexWrap:"wrap",gap:8},
  swatch:{width:18,height:18,borderRadius:9,borderWidth:1,borderColor:"#fff"},
  itemRow:{flexDirection:"row",alignItems:"center"},
  itemIcon:{marginRight:10},
});

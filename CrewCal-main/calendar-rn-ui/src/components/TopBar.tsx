import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { ViewMode } from "../types";
import { colors } from "../utils/theme";
import { formatYear } from "../utils/date";

export default function TopBar({
  yearAnchor, view, onPrev, onNext, onToday, setView, onOpenDrawer, onLogout,
}: {
  yearAnchor: Date;
  view: ViewMode;
  onPrev: () => void;   // year -
  onNext: () => void;   // year +
  onToday: () => void;
  setView: (v: ViewMode) => void;
  onOpenDrawer: () => void;
  onLogout: () => void;
}) {
  const { width } = useWindowDimensions();
  const isSmall = width < 390;

  const Seg = () => (
    <View style={styles.segment}>
      <TouchableOpacity style={[styles.segBtn, view==="month" && styles.segActive]} onPress={() => setView("month")}>
        <Text style={[styles.segTxt, view==="month" && styles.segTxtActive]}>Month</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.segBtn, view==="week" && styles.segActive]} onPress={() => setView("week")}>
        <Text style={[styles.segTxt, view==="week" && styles.segTxtActive]}>Week</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.wrap, isSmall && { paddingVertical: 8 }]}>
      {/* Row 1 */}
      <View style={styles.row}>
        <View style={styles.left}>
          <TouchableOpacity style={styles.iconBtn} onPress={onOpenDrawer}><Text style={styles.iconTxt}>☰</Text></TouchableOpacity>

          <View style={styles.yearGroup}>
            <TouchableOpacity style={styles.iconBtn} onPress={onPrev}><Text style={styles.iconTxt}>‹</Text></TouchableOpacity>
            <Text style={styles.year}>{formatYear(yearAnchor)}</Text>
            <TouchableOpacity style={styles.iconBtn} onPress={onNext}><Text style={styles.iconTxt}>›</Text></TouchableOpacity>
          </View>
        </View>

        {!isSmall && (
          <View style={styles.right}>
            <TouchableOpacity style={styles.todayBtn} onPress={onToday}><Text style={styles.todayTxt}>Today</Text></TouchableOpacity>
            <Seg />
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}><Text style={styles.logoutTxt}>Logout</Text></TouchableOpacity>
          </View>
        )}
      </View>

      {/* Row 2 (small screens) */}
      {isSmall && (
        <View style={[styles.row, { marginTop: 8 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity style={styles.todayBtn} onPress={onToday}><Text style={styles.todayTxt}>Today</Text></TouchableOpacity>
            <Seg />
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}><Text style={styles.logoutTxt}>Logout</Text></TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{borderBottomWidth:1,borderBottomColor:colors.border,backgroundColor:colors.bg,justifyContent:"center",paddingHorizontal:12,minHeight:56},
  row:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},
  left:{flexDirection:"row",alignItems:"center",gap:10},
  right:{flexDirection:"row",alignItems:"center",gap:8},
  yearGroup:{flexDirection:"row",alignItems:"center",gap:2},
  iconBtn:{paddingHorizontal:10,paddingVertical:6,borderRadius:10},
  iconTxt:{fontSize:18,color:colors.text},
  year:{fontSize:18,fontWeight:"900",color:colors.text,marginHorizontal:6},
  todayBtn:{paddingHorizontal:12,paddingVertical:7,borderWidth:1,borderColor:colors.border,borderRadius:12,backgroundColor:colors.bg},
  todayTxt:{fontSize:13,fontWeight:"800",color:colors.text},
  segment:{flexDirection:"row",borderWidth:1,borderColor:colors.border,backgroundColor:colors.soft,borderRadius:12,padding:3},
  segBtn:{paddingHorizontal:10,paddingVertical:7,borderRadius:10},
  segActive:{backgroundColor:colors.bg,borderWidth:1,borderColor:colors.border},
  segTxt:{fontSize:13,color:colors.text,fontWeight:"700"},
  segTxtActive:{fontWeight:"900"},
  logoutBtn:{paddingHorizontal:12,paddingVertical:7,borderWidth:1,borderColor:colors.border,borderRadius:12},
  logoutTxt:{fontSize:13,color:colors.text,fontWeight:"800"},
});

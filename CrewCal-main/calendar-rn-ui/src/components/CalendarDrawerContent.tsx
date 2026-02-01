import React, { useState } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { colors } from "../utils/theme";
import { useCalendar } from "../calendar/CalendarContext";
import CalendarRowMenu from "./CalendarRowMenu";

export default function CalendarDrawerContent(props: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const { calendars, toggleCalendar, openNewCalendar, openShare, deleteCalendar, updateCalendarColor } = useCalendar();
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top,   //  더 여유 있게(짤림 방지)
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 10,
        }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.newBtn} onPress={openNewCalendar}>
          <Text style={styles.newTxt}>＋  New Calendar</Text>
        </TouchableOpacity>

        <View style={styles.sectionRow}>
          <Text style={styles.section}>MY CALENDARS</Text>
        </View>

        {calendars.map((c) => (
          <View key={c.id} style={styles.row}>
            <TouchableOpacity style={styles.left} onPress={() => toggleCalendar(c.id)} activeOpacity={0.85}>
              <View style={[styles.checkbox, c.checked && styles.checkboxOn]}>
                {c.checked && <Text style={styles.check}>✓</Text>}
              </View>
              <View style={[styles.dot, { backgroundColor: c.color, opacity: c.checked ? 1 : 0.3 }]} />
              <Text style={[styles.name, !c.checked && { opacity: 0.5 }]} numberOfLines={1}>
                {c.name}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.kebab} onPress={() => setMenuOpenFor(c.id)}>
              <Text style={styles.kebabTxt}>⋮</Text>
            </TouchableOpacity>

            <CalendarRowMenu
              visible={menuOpenFor === c.id}
              onClose={() => setMenuOpenFor(null)}
              onShare={() => openShare(c.id)}
              onDelete={() => deleteCalendar(c.id)}
              onPickColor={(col) => updateCalendarColor(c.id, col)}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.backBtn} onPress={() => props.navigation.closeDrawer()}>
          <Text style={styles.backTxt}>Back to Calendar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  newBtn: { backgroundColor: colors.dark, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  newTxt: { color: "#fff", fontWeight: "900", fontSize: 16 },
  sectionRow: { paddingHorizontal: 6, paddingVertical: 14 },
  section: { color: colors.muted, fontWeight: "900", letterSpacing: 1 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 6, paddingVertical: 10 },
  left: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  checkboxOn: { backgroundColor: "#111827", borderColor: "#111827" },
  check: { color: "#fff", fontWeight: "900" },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { fontWeight: "900", color: colors.text, flex: 1 },
  kebab: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  kebabTxt: { fontSize: 18, color: colors.muted, fontWeight: "900" },
  backBtn: { marginTop: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  backTxt: { fontWeight: "900", color: colors.text },
});

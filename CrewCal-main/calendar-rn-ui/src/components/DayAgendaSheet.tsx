import React, { useMemo } from "react";
import { Modal, Pressable, View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { CalendarEvent, CalendarItem } from "../types";
import { colors } from "../utils/theme";
import { fmtTime, isSameDay } from "../utils/date";

function formatHeader(d: Date) {
  try {
    return d.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
  } catch {
    return String(d);
  }
}

export default function DayAgendaSheet({
  visible,
  day,
  events,
  calendars,
  onClose,
  onNewEvent,
  onEventPress,
}: {
  visible: boolean;
  day: Date | null;
  events: CalendarEvent[];
  calendars: CalendarItem[];
  onClose: () => void;
  onNewEvent: (day: Date) => void;
  onEventPress: (e: CalendarEvent) => void;
}) {
  const calById = useMemo(() => {
    const m = new Map<string, CalendarItem>();
    for (const c of calendars) m.set(c.id, c);
    return m;
  }, [calendars]);

  const dayEvents = useMemo(() => {
    if (!day) return [];
    const dd = new Date(day);
    const list = events.filter((e) => isSameDay(new Date(e.start), dd));
    // sort by start time
    list.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    return list;
  }, [day, events]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheetWrap} pointerEvents="box-none">
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{day ? formatHeader(day) : "Agenda"}</Text>
              <Text style={styles.sub}>Events for this day</Text>
            </View>

            <TouchableOpacity
              style={styles.newBtn}
              onPress={() => {
                if (!day) return;
                onNewEvent(day);
              }}
              activeOpacity={0.9}
            >
              <Text style={styles.newBtnTxt}>＋ New</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.9}>
              <Text style={styles.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={dayEvents}
            keyExtractor={(e) => e.id}
            contentContainerStyle={{ padding: 14, paddingBottom: 22, gap: 10 }}
            renderItem={({ item }) => {
              const cal = calById.get(item.calendarId);
              const start = new Date(item.start);
              const end = new Date(item.end);
              return (
                <TouchableOpacity style={styles.row} onPress={() => onEventPress(item)} activeOpacity={0.85}>
                  <View style={[styles.dot, { backgroundColor: cal?.color ?? colors.text }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.rowTime}>
                      {item.allDay ? "All day" : `${fmtTime(start)} - ${fmtTime(end)}`}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTxt}>No events</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  sheetWrap: { position: "absolute", left: 0, right: 0, bottom: 0},
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: "100%",
  },
  header: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: "900", color: colors.text },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2, fontWeight: "700" },
  newBtn: { backgroundColor: colors.dark, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14 },
  newBtnTxt: { color: "#fff", fontWeight: "900" },
  closeBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border, backgroundColor: "#fff" },
  closeTxt: { fontSize: 16, fontWeight: "900", color: colors.text },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowTitle: { fontSize: 14, fontWeight: "900", color: colors.text },
  rowTime: { fontSize: 12, color: colors.muted, marginTop: 2, fontWeight: "700" },
  empty: { paddingVertical: 26, alignItems: "center" },
  emptyTxt: { fontSize: 13, color: colors.muted, fontWeight: "800" },
});

import React, { useEffect, useMemo, useState } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable,
  Platform, ScrollView, KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CalendarEvent, CalendarItem } from "../types";
import { colors } from "../utils/theme";
import { fmtTime } from "../utils/date";
import { uuid } from "../utils/id";

type Mode = "create" | "edit";

export default function EventEditorModal({
  visible, mode, onClose, calendars, initialStart, event, onSave, onDelete,
}: {
  visible: boolean;
  mode: Mode;
  onClose: () => void;
  calendars: CalendarItem[];
  initialStart: Date;
  event: CalendarEvent | null;
  onSave: (e: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}) {
  const insets = useSafeAreaInsets();

  const defaultCalendar = useMemo(() => calendars.find(c => c.checked) ?? calendars[0], [calendars]);

  const safeInitial = useMemo(() => (initialStart ? new Date(initialStart) : new Date()), [initialStart]);

  const [title, setTitle] = useState("");
  const [calendarId, setCalendarId] = useState(defaultCalendar?.id ?? "");
  const [allDay, setAllDay] = useState(false);
  const [start, setStart] = useState<Date>(safeInitial);
  const [end, setEnd] = useState<Date>(new Date(safeInitial.getTime() + 60 * 60 * 1000));
  const [reminder, setReminder] = useState("No reminder");
  const [notes, setNotes] = useState("");
  const [pickerTarget, setPickerTarget] = useState<null | "start" | "end">(null);

  useEffect(() => {
    if (!visible) return;

    if (mode === "edit" && event) {
      setTitle(event.title || "");
      setCalendarId(event.calendarId);
      setAllDay(Boolean(event.allDay));
      setStart(new Date(event.start));
      setEnd(new Date(event.end));
      setReminder((event as any).reminder ?? "No reminder");
      setNotes((event as any).notes ?? "");
    } else {
      setTitle("");
      setCalendarId(defaultCalendar?.id ?? calendars[0]?.id ?? "");
      setAllDay(false);
      setStart(safeInitial);
      setEnd(new Date(safeInitial.getTime() + 60 * 60 * 1000));
      setReminder("No reminder");
      setNotes("");
    }
    setPickerTarget(null);
  }, [visible, mode, event, safeInitial, calendars, defaultCalendar]);

  // When allDay enabled: disable time editing + normalize times to full day
  useEffect(() => {
    if (!allDay) return;
    setPickerTarget(null);
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    const e = new Date(s);
    e.setHours(23, 59, 0, 0);
    setStart(s);
    setEnd(e);
  }, [allDay]);

  const headerTitle = mode === "edit" ? "Edit Event" : "New Event";

  const submit = () => {
    const base: CalendarEvent = event ?? {
      id: uuid(),
      calendarId: calendarId || defaultCalendar?.id || calendars[0]?.id || "c1",
      title: "(No title)",
      start, end,
      allDay: false,
    };

    onSave({
      ...base,
      title: title.trim() || "(No title)",
      calendarId: calendarId || base.calendarId,
      allDay,
      start, end,
      reminder,
      notes,
    } as any);

    onClose();
  };

  const onPicked = (_: any, date?: Date) => {
    if (!date) return;
    if (pickerTarget === "start") setStart(date);
    if (pickerTarget === "end") setEnd(date);
    if (Platform.OS !== "ios") setPickerTarget(null);
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />

      <SafeAreaView style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 10) }]} edges={["bottom"]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.top}>
            <Text style={styles.header}>{headerTitle}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}><Text style={styles.closeTxt}>×</Text></TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[styles.body, { paddingBottom: 24 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Add title"
              style={styles.input}
              placeholderTextColor="#94A3B8"
            />

            <View style={{ height: 12 }} />

            <Text style={styles.label}>Calendar</Text>
            <View style={styles.pickerRow}>
              <Picker selectedValue={calendarId} onValueChange={(v) => setCalendarId(String(v))} style={{ flex: 1 }}>
                {calendars.map((c) => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
              </Picker>
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.label}>All day</Text>
              <TouchableOpacity
                style={[styles.switch, allDay ? styles.switchOn : styles.switchOff]}
                onPress={() => setAllDay((v) => !v)}
              >
                <View style={[styles.knob, allDay ? { marginLeft: 20 } : { marginLeft: 2 }]} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { marginTop: 8 }]}>Time</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={[styles.timeBtn, allDay && styles.timeBtnDisabled]}
                disabled={allDay}
                onPress={() => setPickerTarget("start")}
              >
                <Text style={styles.timeBtnLabel}>Start</Text>
                <Text style={styles.timeBtnValue}>
                  {start.toLocaleDateString()}  {fmtTime(start)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.timeBtn, allDay && styles.timeBtnDisabled]}
                disabled={allDay}
                onPress={() => setPickerTarget("end")}
              >
                <Text style={styles.timeBtnLabel}>End</Text>
                <Text style={styles.timeBtnValue}>
                  {end.toLocaleDateString()}  {fmtTime(end)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* ✅ iOS에서 picker가 떠도 스크롤이 막히지 않도록: ScrollView 내부에 inline 렌더 */}
            {pickerTarget && !allDay && (
              <View style={{ marginTop: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: "#fff", overflow: "hidden" }}>
                <DateTimePicker
                  value={pickerTarget === "start" ? start : end}
                  mode="datetime"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onPicked}
                  style={{ height: Platform.OS === "ios" ? 200 : undefined }}
                />
                {Platform.OS === "ios" && (
                  <TouchableOpacity style={styles.doneBtn} onPress={() => setPickerTarget(null)}>
                    <Text style={styles.doneTxt}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <Text style={[styles.label, { marginTop: 10 }]}>Reminder</Text>
            <View style={styles.pickerBox}>
              <Picker selectedValue={reminder} onValueChange={(v) => setReminder(String(v))}>
                <Picker.Item label="No reminder" value="No reminder" />
                <Picker.Item label="At time of event" value="At time of event" />
                <Picker.Item label="5 minutes before" value="5 minutes before" />
                <Picker.Item label="10 minutes before" value="10 minutes before" />
                <Picker.Item label="30 minutes before" value="30 minutes before" />
                <Picker.Item label="1 hour before" value="1 hour before" />
              </Picker>
            </View>

            <Text style={[styles.label, { marginTop: 10 }]}>Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes..."
              placeholderTextColor="#94A3B8"
              style={[styles.input, { height: 110, textAlignVertical: "top" }]}
              multiline
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.deleteBtn, !(mode === "edit" && event) && { opacity: 0.35 }]}
              disabled={!(mode === "edit" && event)}
              onPress={() => {
                if (event) onDelete(event.id);
                onClose();
              }}
            >
              <Text style={styles.deleteTxt}>🗑️ Delete</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}><Text style={styles.cancelTxt}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={submit}><Text style={styles.saveTxt}>{mode === "edit" ? "Save" : "Create"}</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.overlay },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, top: 0, backgroundColor: colors.bg },

  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  header: { paddingTop:50, fontSize: 18, fontWeight: "900", color: colors.text },
  closeBtn: { paddingTop:50, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  closeTxt: { fontSize: 18, color: colors.text },

  body: { paddingHorizontal: 16, paddingTop: 14 },
  label: { fontSize: 13, fontWeight: "900", color: colors.text, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, fontWeight: "800", color: colors.text, backgroundColor: "#fff" },

  pickerRow: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, overflow: "hidden", backgroundColor: "#fff" },
  pickerBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, overflow: "hidden", backgroundColor: "#fff" },

  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  switch: { width: 44, height: 26, borderRadius: 13, padding: 2, justifyContent: "center" },
  switchOn: { backgroundColor: "#111827" },
  switchOff: { backgroundColor: "#CBD5E1" },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff" },

  timeBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, backgroundColor: "#fff" },
  timeBtnDisabled: { opacity: 0.45 },
  timeBtnLabel: { fontSize: 12, fontWeight: "900", color: colors.muted },
  timeBtnValue: { fontSize: 13, fontWeight: "900", color: colors.text, marginTop: 6 },

  doneBtn: { borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 10, alignItems: "center" },
  doneTxt: { fontWeight: "900", color: colors.text },

  footer: { borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.bg },
  deleteBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  deleteTxt: { fontWeight: "900", color: colors.text },
  cancelBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  cancelTxt: { fontWeight: "900", color: colors.text },
  saveBtn: { backgroundColor: colors.dark, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  saveTxt: { fontWeight: "900", color: "#fff" },
});

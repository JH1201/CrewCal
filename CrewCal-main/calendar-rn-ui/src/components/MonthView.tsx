import React, { memo, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { CalendarEvent, CalendarItem } from "../types";
import { colors } from "../utils/theme";
import { formatMonthTitle, getMonthGrid, isSameDay, isSameMonth } from "../utils/date";

const DOW = [
  { k: "sun", l: "S" },
  { k: "mon", l: "M" },
  { k: "tue", l: "T" },
  { k: "wed", l: "W" },
  { k: "thu", l: "T" },
  { k: "fri", l: "F" },
  { k: "sat", l: "S" },
];

function MonthViewImpl({
  anchor,
  calendars,
  events,
  selectedDay,
  onSelectDay,
  onCreateEventAtDay,
  onEventPress,
  onMorePress,
  cellHeight,
}: {
  anchor: Date;
  calendars: CalendarItem[];
  events: CalendarEvent[]; // ✅ MonthPager가 "해당 월 이벤트만" 넘김(이미 visible 필터링됨)
  selectedDay: Date;
  onSelectDay: (d: Date) => void;
  onCreateEventAtDay: (d: Date) => void;
  onEventPress: (e: CalendarEvent) => void;
  onMorePress?: (day: Date) => void;
  cellHeight: number;
}) {
  const { width } = useWindowDimensions();
  const cellW = Math.floor(width / 7);

  const { days } = getMonthGrid(anchor, 0);

  const calById = useMemo(() => {
    const m = new Map<string, CalendarItem>();
    for (const c of calendars) m.set(c.id, c);
    return m;
  }, [calendars]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const key = new Date(e.start).toDateString();
      const arr = map.get(key);
      if (arr) arr.push(e);
      else map.set(key, [e]);
    }
    return map;
  }, [events]);

  return (
    <View>
      <Text style={styles.monthTitle}>{formatMonthTitle(anchor)}</Text>

      <View style={styles.dowRow}>
        {DOW.map((d) => (
          <View key={d.k} style={[styles.dowCell, { width: cellW }]}>
            <Text style={styles.dowTxt}>{d.l}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((d, idx) => {
          const key = d.toDateString();
          const sameMonth = isSameMonth(d, anchor);
          const selected = isSameDay(d, selectedDay);

          const dayEvents = eventsByDay.get(key) ?? [];
          const show = dayEvents.slice(0, 1); // fixed height 유지: 1개만 노출
          const more = dayEvents.length - show.length;

          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.9}
              onPress={() => onSelectDay(d)}
              onLongPress={() => onCreateEventAtDay(d)}
              style={[
                styles.cell,
                { width: cellW, height: cellHeight },
                selected && styles.cellSelected,
              ]}
            >
              <View style={styles.cellHeader}>
                <View style={[styles.dayBubble, selected && styles.dayBubbleSelected]}>
                  <Text style={[styles.dayTxt, selected && styles.dayTxtSelected, !sameMonth && styles.dayOut]}>
                    {d.getDate()}
                  </Text>
                </View>
              </View>

              <View style={styles.pillsWrap}>
                {show.map((ev) => {
                  const cal = calById.get(ev.calendarId);
                  return (
                    <TouchableOpacity
                      key={ev.id}
                      onPress={() => onEventPress(ev)}
                      activeOpacity={0.85}
                      style={[styles.pill, { borderLeftColor: cal?.color ?? colors.pillText }]}
                    >
                      <Text style={styles.pillTxt} numberOfLines={1}>
                        {ev.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                {more > 0 && (
                  onMorePress ? (
                    <TouchableOpacity onPress={() => onMorePress(d)} activeOpacity={0.85}>
                      <Text style={styles.moreTxt}>+{more} more</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.moreTxt}>+{more} more</Text>
                  )
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default memo(MonthViewImpl);

const styles = StyleSheet.create({
  monthTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  dowRow: { flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  dowCell: { paddingVertical: 10, alignItems: "center", justifyContent: "center" },
  dowTxt: { fontSize: 12, fontWeight: "800", color: colors.muted },

  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    padding: 8,
    backgroundColor: colors.bg,
    overflow: "hidden",
  },
  cellSelected: { backgroundColor: "#FFFFFF" },

  cellHeader: { flexDirection: "row", justifyContent: "space-between" },
  dayBubble: { height: 28, minWidth: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  dayBubbleSelected: { backgroundColor: colors.dark },
  dayTxt: { fontSize: 12, fontWeight: "700", color: colors.text },
  dayTxtSelected: { color: "#fff" },
  dayOut: { color: "#94A3B8" },

  pillsWrap: { marginTop: 6, gap: 5 },
  pill: {
    backgroundColor: colors.pillBg,
    borderLeftWidth: 3,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  pillTxt: { color: colors.pillText, fontWeight: "700", fontSize: 12 },
  moreTxt: { fontSize: 10, color: colors.muted },
});

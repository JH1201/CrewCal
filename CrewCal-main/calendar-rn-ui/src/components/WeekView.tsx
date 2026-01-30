import React, { memo, useMemo, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { CalendarEvent, CalendarItem } from "../types";
import { colors } from "../utils/theme";
import {
  addDays,
  formatDowShort,
  formatMonthTitle,
  isSameDay,
  minutesSinceStartOfDay,
  snapMinutes,
  startOfWeek,
  fmtTime,
  pad2,
} from "../utils/date";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function WeekView({
  anchor,
  calendars,
  events,
  selectedDay,
  onSelectDay,
  onCreateAtDateTime,
  onEventPress,
}: {
  anchor: Date;
  calendars: CalendarItem[];
  events: CalendarEvent[];
  selectedDay: Date;
  onSelectDay: (d: Date) => void;
  onCreateAtDateTime: (dt: Date) => void;
  onEventPress: (e: CalendarEvent) => void;
}) {
  const weekStart = useMemo(() => startOfWeek(anchor, 0), [anchor]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const visibleIds = useMemo(() => new Set(calendars.filter((c) => c.checked).map((c) => c.id)), [calendars]);
  const calColor = (id: string) => calendars.find((c) => c.id === id)?.color ?? "#22C55E";

  const pxPerHour = 56;
  const pxPerMinute = pxPerHour / 60;
  const gridHeight = pxPerHour * 24;

  const eventsForDay = (d: Date) =>
    events.filter((e) => visibleIds.has(e.calendarId)).filter((e) => isSameDay(e.start, d));

  const { width: screenW } = useWindowDimensions();
  const timeColW = 58;

  // Make day columns wider than screen -> horizontal scroll.
  // (If you want even larger like Google Calendar, bump this to 110~130)
  const dayColW = 96;
  const daysContentW = dayColW * 7;

  // Sync header <-> grid horizontal scroll
  const headerRef = useRef<ScrollView>(null);
  const gridRef = useRef<ScrollView>(null);
  const syncing = useRef<"header" | "grid" | null>(null);

  const syncToHeader = (x: number) => {
    if (syncing.current === "grid") return;
    syncing.current = "header";
    headerRef.current?.scrollTo({ x, animated: false });
    requestAnimationFrame(() => (syncing.current = null));
  };

  const syncToGrid = (x: number) => {
    if (syncing.current === "header") return;
    syncing.current = "grid";
    gridRef.current?.scrollTo({ x, animated: false });
    requestAnimationFrame(() => (syncing.current = null));
  };

  const handlePressGrid = (day: Date, y: number) => {
    const mins = snapMinutes(y / pxPerMinute, 30);
    const hh = Math.floor(mins / 60);
    const mm = mins % 60;
    onCreateAtDateTime(new Date(day.getFullYear(), day.getMonth(), day.getDate(), hh, mm, 0, 0));
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.monthTitle}>{formatMonthTitle(anchor)}</Text>

      {/* Header (days) */}
      <View style={styles.headerRow}>
        <View style={[styles.headerCell, { width: timeColW }]} />
        <ScrollView
          ref={headerRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => syncToGrid(e.nativeEvent.contentOffset.x)}
          contentContainerStyle={{ width: daysContentW }}
        >
          <View style={{ flexDirection: "row" }}>
            {days.map((d) => {
              const selected = isSameDay(d, selectedDay);
              return (
                <Pressable
                  key={d.toISOString()}
                  style={[styles.headerCell, { width: dayColW }]}
                  onPress={() => onSelectDay(d)}
                >
                  <Text style={styles.dowTxt}>{formatDowShort(d).toUpperCase()}</Text>
                  <View style={[styles.dayBubble, selected && styles.dayBubbleSelected]}>
                    <Text style={[styles.dayNum, selected && styles.dayNumSelected]}>{d.getDate()}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Body */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ flexDirection: "row" }}>
          {/* Time column (fixed) */}
          <View style={{ width: timeColW, borderRightWidth: 1, borderRightColor: colors.border }}>
            <View style={{ height: gridHeight }}>
              {HOURS.map((h) => (
                <View key={h} style={{ position: "absolute", top: h * pxPerHour, right: 6 }}>
                  <Text style={styles.timeTxt}>{pad2(h)}:00</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Day grid (horizontally scrollable) */}
          <ScrollView
            ref={gridRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            nestedScrollEnabled
            onScroll={(e) => syncToHeader(e.nativeEvent.contentOffset.x)}
            contentContainerStyle={{ width: daysContentW }}
          >
            <View style={{ flexDirection: "row" }}>
              {days.map((day) => {
                const dayEvents = eventsForDay(day);
                const selected = isSameDay(day, selectedDay);
                return (
                  <View
                    key={day.toISOString()}
                    style={[styles.dayCol, { width: dayColW, height: gridHeight }, selected && styles.dayColSelected]}
                  >
                    <Pressable
                      style={{ flex: 1 }}
                      onPress={(e) => handlePressGrid(day, e.nativeEvent.locationY)}
                      onLongPress={(e) => handlePressGrid(day, e.nativeEvent.locationY)}
                    >
                      {HOURS.map((h) => (
                        <View key={h} style={[styles.lineHour, { top: h * pxPerHour }]} />
                      ))}
                      {HOURS.map((h) => (
                        <View key={`h2-${h}`} style={[styles.lineHalf, { top: h * pxPerHour + pxPerHour / 2 }]} />
                      ))}

                      {dayEvents.map((ev) => {
                        const top = minutesSinceStartOfDay(ev.start) * pxPerMinute;
                        const durationMin = Math.max(15, Math.round((ev.end.getTime() - ev.start.getTime()) / 60000));
                        const height = durationMin * pxPerMinute;
                        return (
                          <Pressable
                            key={ev.id}
                            style={[styles.eventBlock, { top, height, borderLeftColor: calColor(ev.calendarId) }]}
                            onPress={() => onEventPress(ev)}
                          >
                            <Text numberOfLines={1} style={styles.eventTitle}>
                              {ev.title}
                            </Text>
                            <Text style={styles.eventTime}>
                              {fmtTime(ev.start)} - {fmtTime(ev.end)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <Text style={styles.hint}>Tip: 빈 시간대를 탭/길게 → New Event, 이벤트 탭 → Edit Event</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  monthTitle: { fontSize: 28, fontWeight: "800", color: colors.text, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  headerRow: { flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, backgroundColor: colors.bg },
  headerCell: { paddingVertical: 10, alignItems: "center", justifyContent: "center" },
  dowTxt: { fontSize: 10, fontWeight: "800", color: colors.muted },
  dayBubble: { marginTop: 6, height: 28, minWidth: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  dayBubbleSelected: { backgroundColor: colors.dark },
  dayNum: { fontSize: 13, fontWeight: "800", color: colors.text },
  dayNumSelected: { color: "#fff" },

  timeTxt: { fontSize: 11, color: colors.muted, fontWeight: "700" },
  dayCol: { borderRightWidth: 1, borderRightColor: colors.border, backgroundColor: colors.bg },
  dayColSelected: { backgroundColor: "#fff" },

  lineHour: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: "rgba(15,23,42,0.10)" },
  lineHalf: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: "rgba(15,23,42,0.05)" },

  eventBlock: { position: "absolute", left: 6, right: 6, backgroundColor: colors.pillBg, borderLeftWidth: 3, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6, overflow: "hidden" },
  eventTitle: { fontSize: 13, fontWeight: "800", color: colors.pillText },
  eventTime: { fontSize: 11, color: colors.muted, marginTop: 2 },

  hint: { paddingHorizontal: 16, paddingTop: 10, color: colors.muted, fontSize: 12 },
});


export default memo(WeekView);

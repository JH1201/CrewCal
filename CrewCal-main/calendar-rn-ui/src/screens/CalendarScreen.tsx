import React, { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useAuth } from "../auth/AuthContext";
import { ViewMode } from "../types";
import { addYears } from "../utils/date";
import { colors } from "../utils/theme";
import TopBar from "../components/TopBar";
import MonthPager from "../components/MonthPager";
import WeekPager from "../components/WeekPager";
import DayAgendaSheet from "../components/DayAgendaSheet";
import { useCalendar } from "../calendar/CalendarContext";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function CalendarScreen() {
  const nav = useNavigation();
  const { logout } = useAuth();
  const { calendars, events, visibleCalendarIds, openCreateEventAt, openEditEvent } = useCalendar();

  const [view, setView] = useState<ViewMode>("month");

  // highlight + default creation date
  const [selectedDay, setSelectedDay] = useState(new Date());

  // TopBar display (year/month)
  const [displayMonth, setDisplayMonth] = useState(new Date());

  // MonthPager jump target (Today / year +/- / date tap)
  const [scrollTargetMonth, setScrollTargetMonth] = useState(new Date());

  // MonthPager가 "오늘 날짜를 화면 가운데"로 보내기 위한 트리거
  const [scrollTargetDay, setScrollTargetDay] = useState<Date | null>(null);

  // ✅ MonthView에서 +N more 클릭 시, 해당 날짜의 모든 이벤트를 보여주는 바텀시트
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [agendaDay, setAgendaDay] = useState<Date | null>(null);

  const visibleEvents = useMemo(
    () => events.filter((e) => visibleCalendarIds.has(e.calendarId)),
    [events, visibleCalendarIds]
  );

  const onPrevYear = () => {
    const next = addYears(new Date(displayMonth), -1);
    setDisplayMonth(new Date(next));
    setScrollTargetMonth(new Date(next));
  };

  const onNextYear = () => {
    const next = addYears(new Date(displayMonth), +1);
    setDisplayMonth(new Date(next));
    setScrollTargetMonth(new Date(next));
  };

  const onToday = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    setSelectedDay(new Date(now));
    setDisplayMonth(new Date(monthStart));
    setScrollTargetMonth(new Date(monthStart));
  setScrollTargetDay(new Date(now));
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <TopBar
        yearAnchor={displayMonth}
        view={view}
        onPrev={onPrevYear}
        onNext={onNextYear}
        onToday={onToday}
        setView={setView}
        onOpenDrawer={() => nav.dispatch(DrawerActions.openDrawer())}
        onLogout={() => logout()}
      />

      <View style={{ flex: 1 }}>
        {view === "month" ? (
          <MonthPager
            scrollToMonth={scrollTargetMonth}
            scrollToDay={scrollTargetDay}
            calendars={calendars}
            events={visibleEvents}
            selectedDay={selectedDay}
            onSelectDay={(d) => {
              setSelectedDay(new Date(d));
              setDisplayMonth(new Date(d));
              setScrollTargetMonth(new Date(d));
              setScrollTargetDay(null);
            }}
            onVisibleMonthChange={(m) => {
              const next = new Date(m);
              setDisplayMonth((prev) => (monthKey(prev) === monthKey(next) ? prev : next));
            }}
            onCreateEventAtDay={(d) => {
              const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 0, 0);
              openCreateEventAt(start);
            }}
            onEventPress={(e) => openEditEvent(e)}
            onMorePress={(d) => {
              setAgendaDay(new Date(d));
              setAgendaOpen(true);
            }}
          />
        ) : (
          <WeekPager
            anchor={displayMonth}
            calendars={calendars}
            events={visibleEvents}
            selectedDay={selectedDay}
            onSelectDay={(d) => {
              setSelectedDay(new Date(d));
              setDisplayMonth(new Date(d));
            }}
            onAnchorChange={(d) => setDisplayMonth(new Date(d))}
            onCreateAtDateTime={(dt) => openCreateEventAt(new Date(dt))}
            onEventPress={(e) => openEditEvent(e)}
          />
        )}
      </View>

<DayAgendaSheet
  visible={agendaOpen}
  day={agendaDay}
  events={visibleEvents}
  calendars={calendars}
  onClose={() => setAgendaOpen(false)}
  onNewEvent={(d) => {
    setAgendaOpen(false);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 0, 0);
    openCreateEventAt(start);
  }}
  onEventPress={(e) => {
    setAgendaOpen(false);
    openEditEvent(e);
  }}
/>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});

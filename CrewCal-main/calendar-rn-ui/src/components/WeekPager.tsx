import React, { useEffect, useMemo, useRef } from "react";
import { FlatList, useWindowDimensions, View } from "react-native";
import { addDays, startOfWeek } from "../utils/date";
import WeekView from "./WeekView";
import { CalendarEvent, CalendarItem } from "../types";

function weekKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function WeekPager({
  anchor,
  calendars,
  events,
  selectedDay,
  onSelectDay,
  onAnchorChange,
  onCreateAtDateTime,
  onEventPress,
}: {
  anchor: Date;
  calendars: CalendarItem[];
  events: CalendarEvent[];
  selectedDay: Date;
  onSelectDay: (d: Date) => void;
  onAnchorChange: (d: Date) => void;
  onCreateAtDateTime: (d: Date) => void;
  onEventPress: (e: CalendarEvent) => void;
}) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Date>>(null);

  const pages = useMemo(() => {
    const base = startOfWeek(anchor);
    return [-2, -1, 0, 1, 2].map((i) => addDays(base, i * 7));
  }, [anchor]);

  useEffect(() => {
    // Keep center page visible when anchor changes programmatically.
    setTimeout(() => listRef.current?.scrollToIndex({ index: 2, animated: false }), 0);
  }, [anchor]);

  return (
    <FlatList
      ref={listRef}
      data={pages}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      initialScrollIndex={2}
      getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      nestedScrollEnabled
      directionalLockEnabled
      onScrollToIndexFailed={(info) => {
        // Safety net: if not measured yet, scroll close by offset
        const wait = new Promise((r) => setTimeout(r, 60));
        wait.then(() => {
          const offset = (info.averageItemLength || width) * info.index;
          listRef.current?.scrollToOffset({ offset, animated: true });
        });
      }}
      onMomentumScrollEnd={(e) => {
        const x = e.nativeEvent.contentOffset.x;
        const idx = Math.round(x / width);
        if (idx !== 2) onAnchorChange(pages[idx]);
      }}
      renderItem={({ item }) => (
        <View style={{ width }}>
          <WeekView
            anchor={item}
            calendars={calendars}
            events={events}
            selectedDay={selectedDay}
            onSelectDay={onSelectDay}
            onCreateAtDateTime={onCreateAtDateTime}
            onEventPress={onEventPress}
          />
        </View>
      )}
    />
  );
}

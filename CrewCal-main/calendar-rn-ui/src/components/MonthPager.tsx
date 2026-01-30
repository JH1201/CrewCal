import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, View, useWindowDimensions } from "react-native";
import MonthView from "./MonthView";
import { CalendarEvent, CalendarItem } from "../types";
import { getMonthGrid } from "../utils/date";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function atMonthStart(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

/**
 * ✅ 성능 최적화: 렌더링할 월 범위를 제한
 * - 현재 기준 "앞뒤 60개월" (사용자 요구: 24~60개월 범위)
 * - 사용자가 오래 이동하면 targetMonth를 기준으로 윈도우를 재구성
 */
const WINDOW_PAST = 60;
const WINDOW_FUTURE = 60;
const EDGE_REBUILD_THRESHOLD = 6; // 가장자리 6개월 이내로 가면 윈도우를 재구성

function buildWindow(centerMonth: Date) {
  const center = atMonthStart(centerMonth);
  const start = addMonths(center, -WINDOW_PAST);
  const end = addMonths(center, WINDOW_FUTURE);

  const months: Date[] = [];
  const cur = new Date(start);
  while (cur.getTime() <= end.getTime()) {
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

const EMPTY_EVENTS: CalendarEvent[] = [];

export default function MonthPager({
  scrollToMonth,
  scrollToDay, // ✅ Today를 '월'이 아니라 '날짜'가 화면 가운데로
  calendars,
  events,
  selectedDay,
  onSelectDay,
  onCreateEventAtDay,
  onEventPress,
  onMorePress,
  onVisibleMonthChange,
}: {
  scrollToMonth: Date;
  scrollToDay?: Date | null;
  calendars: CalendarItem[];
  events: CalendarEvent[];
  selectedDay: Date;
  onSelectDay: (d: Date) => void;
  onCreateEventAtDay: (d: Date) => void;
  onEventPress: (e: CalendarEvent) => void;
  onMorePress?: (day: Date) => void;
  onVisibleMonthChange: (monthStart: Date) => void;
}) {
  const { width, height } = useWindowDimensions();
  const cellW = Math.floor(width / 7);

  // ✅ cell 높이 확보(이벤트 pill 잘림 완화)
  const CELL_H = Math.max(90, Math.round(cellW * 1.08));

  // MonthView 스타일 기반의 고정 높이(대략치)
  const TITLE_H = 14 + 28 + 10; // paddingTop + fontSize + paddingBottom
  const DOW_H = 10 * 2 + 14;    // paddingVertical + text
  const GRID_H = 6 * CELL_H;
  const ITEM_H = TITLE_H + DOW_H + GRID_H; // Tip 제거됨

  const listRef = useRef<FlatList<Date>>(null);
  const didMount = useRef(false);

  const [months, setMonths] = useState<Date[]>(() => buildWindow(scrollToMonth));

  // targetKey/index
  const targetKey = monthKey(atMonthStart(scrollToMonth));
  const targetIndex = useMemo(() => months.findIndex((m) => monthKey(m) === targetKey), [months, targetKey]);

  // ✅ targetMonth가 윈도우 밖이면 즉시 재구성
  useEffect(() => {
    if (targetIndex >= 0) return;
    setMonths(buildWindow(scrollToMonth));
  }, [targetIndex, scrollToMonth]);

  // ✅ 가장자리 근처면 윈도우 재구성(사용자가 오래 이동해도 계속 사용 가능)
  useEffect(() => {
    if (targetIndex < 0) return;
    if (targetIndex <= EDGE_REBUILD_THRESHOLD || targetIndex >= months.length - 1 - EDGE_REBUILD_THRESHOLD) {
      setMonths(buildWindow(scrollToMonth));
    }
  }, [targetIndex, months.length, scrollToMonth]);

  // ✅ 월 이동
  useEffect(() => {
    if (targetIndex < 0) return;
    const animated = didMount.current;
    didMount.current = true;
    listRef.current?.scrollToIndex({ index: targetIndex, animated, viewPosition: 0 });
  }, [targetIndex]);

  // ✅ events를 월별로 분배(월 뷰에 해당 월 이벤트만 전달)
  const eventsByMonth = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const k = monthKey(atMonthStart(new Date(e.start)));
      const arr = map.get(k);
      if (arr) arr.push(e);
      else map.set(k, [e]);
    }
    return map;
  }, [events]);

  // ✅ 날짜를 화면 가운데로 이동(scrollToDay)
  useEffect(() => {
    if (!scrollToDay) return;
    const day = new Date(scrollToDay);
    const monthStart = atMonthStart(day);
    const idx = months.findIndex((m) => monthKey(m) === monthKey(monthStart));
    if (idx < 0) {
      // 윈도우 밖이면 윈도우부터 재구성 → 다음 렌더에서 다시 effect가 돌아와 가운데로 보냄
      setMonths(buildWindow(day));
      return;
    }

    // day가 month grid에서 몇 번째 row인지 계산
    const { days } = getMonthGrid(monthStart, 0);
    const cellIndex = days.findIndex(
      (d) => d.getFullYear() === day.getFullYear() && d.getMonth() === day.getMonth() && d.getDate() === day.getDate()
    );
    const row = cellIndex >= 0 ? Math.floor(cellIndex / 7) : 2;

    const monthTop = idx * ITEM_H;
    const gridTop = TITLE_H + DOW_H;
    const cellCenterY = monthTop + gridTop + row * CELL_H + CELL_H / 2;

    // ✅ 중앙 정렬(너무 위로 올라가지 않게)
    const targetOffset = Math.max(0, cellCenterY - height / 2);
    listRef.current?.scrollToOffset({ offset: targetOffset, animated: true });
  }, [scrollToDay, height, months, ITEM_H, TITLE_H, DOW_H, CELL_H]);

  // ✅ Viewable month change: 스크롤 중 불필요한 setState를 줄이기 위해 "월 시작"만 보냄
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    const top = viewableItems?.[0]?.item as Date | undefined;
    if (!top) return;
    onVisibleMonthChange(atMonthStart(top));
  }).current;

  const renderItem = useCallback(
    ({ item }: { item: Date }) => {
      const k = monthKey(item);
      const monthEvents = eventsByMonth.get(k) ?? EMPTY_EVENTS;
      return (
        <View style={{ height: ITEM_H }}>
          <MonthView
            anchor={item}
            calendars={calendars}
            events={monthEvents}
            selectedDay={selectedDay}
            onSelectDay={onSelectDay}
            onCreateEventAtDay={onCreateEventAtDay}
            onEventPress={onEventPress}
            onMorePress={onMorePress}
            cellHeight={CELL_H}
          />
        </View>
      );
    },
    [ITEM_H, calendars, eventsByMonth, selectedDay, onSelectDay, onCreateEventAtDay, onEventPress, onMorePress, CELL_H]
  );

  return (
    <FlatList
      ref={listRef}
      data={months}
      keyExtractor={(d) => monthKey(d)}
      showsVerticalScrollIndicator={false}
      viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
      onViewableItemsChanged={onViewableItemsChanged}
      removeClippedSubviews
      windowSize={7}
      maxToRenderPerBatch={4}
      initialNumToRender={4}
      updateCellsBatchingPeriod={50}
      getItemLayout={(_, index) => ({ length: ITEM_H, offset: ITEM_H * index, index })}
      initialScrollIndex={Math.max(0, targetIndex)}
      renderItem={renderItem}
    />
  );
}

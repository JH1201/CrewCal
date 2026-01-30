package com.example.calendar.event;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ReminderRepository {
    private final JdbcTemplate jdbc;

    public ReminderRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public Integer findMinutesBefore(long eventId) {
        return jdbc.query(
                "select minutes_before from event_reminders where event_id=?",
                rs -> rs.next() ? rs.getInt(1) : null,
                eventId
        );
    }

    public void upsert(long eventId, Integer minutesBefore) {
        if (minutesBefore == null) {
            jdbc.update("delete from event_reminders where event_id=?", eventId);
            return;
        }
        Integer n = jdbc.queryForObject("select count(*) from event_reminders where event_id=?", Integer.class, eventId);
        if (n != null && n > 0) {
            jdbc.update("update event_reminders set minutes_before=? where event_id=?", minutesBefore, eventId);
        } else {
            jdbc.update("insert into event_reminders (event_id, minutes_before) values (?,?)", eventId, minutesBefore);
        }
    }
}

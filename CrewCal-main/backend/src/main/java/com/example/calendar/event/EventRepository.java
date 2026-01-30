package com.example.calendar.event;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public class EventRepository {
    private final JdbcTemplate jdbc;

    public EventRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public record EventRecord(
            long id,
            long calendarId,
            String title,
            OffsetDateTime startAt,
            OffsetDateTime endAt,
            boolean allDay,
            String note
    ) {}

    private static final RowMapper<EventRecord> EVENT_ROW = (rs, i) -> new EventRecord(
            rs.getLong("id"),
            rs.getLong("calendar_id"),
            rs.getString("title"),
            rs.getObject("start_at", OffsetDateTime.class),
            rs.getObject("end_at", OffsetDateTime.class),
            rs.getBoolean("all_day"),
            rs.getString("note")
    );

    public List<EventRecord> list(long calendarId, OffsetDateTime from, OffsetDateTime to) {
        return jdbc.query(
                "select id, calendar_id, title, start_at, end_at, all_day, note " +
                "from events where calendar_id=? and deleted_at is null and start_at < ? and end_at > ? " +
                "order by start_at asc",
                EVENT_ROW,
                calendarId, to, from
        );
    }

    public EventRecord get(long eventId) {
        return jdbc.queryForObject(
                "select id, calendar_id, title, start_at, end_at, all_day, note from events where id=? and deleted_at is null",
                EVENT_ROW,
                eventId
        );
    }

    public long create(long calendarId, String title, OffsetDateTime startAt, OffsetDateTime endAt, boolean allDay, String note, long userId) {
        Long id = jdbc.queryForObject(
                "insert into events (calendar_id, title, start_at, end_at, all_day, note, created_by, updated_by) values (?,?,?,?,?,?,?,?) returning id",
                Long.class,
                calendarId, title, startAt, endAt, allDay, note, userId, userId
        );
        return id;
    }

    public void update(long eventId, String title, OffsetDateTime startAt, OffsetDateTime endAt, Boolean allDay, String note, long userId) {
        jdbc.update(
                "update events set title=coalesce(?, title), start_at=coalesce(?, start_at), end_at=coalesce(?, end_at), " +
                "all_day=coalesce(?, all_day), note=coalesce(?, note), updated_by=?, updated_at=now() where id=?",
                title, startAt, endAt, allDay, note, userId, eventId
        );
    }

    public void softDelete(long eventId, long userId) {
        jdbc.update("update events set deleted_at=now(), updated_by=?, updated_at=now() where id=?", userId, eventId);
    }
}

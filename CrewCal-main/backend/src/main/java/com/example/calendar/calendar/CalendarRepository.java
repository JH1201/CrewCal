package com.example.calendar.calendar;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CalendarRepository {
    private final JdbcTemplate jdbc;

    public CalendarRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    private static final RowMapper<CalendarDtos.CalendarSummary> CAL_SUMMARY = (rs, i) ->
            new CalendarDtos.CalendarSummary(
                    rs.getLong("id"),
                    rs.getString("name"),
                    rs.getString("color"),
                    rs.getString("role")
            );

    public List<CalendarDtos.CalendarSummary> listForUser(long userId) {
        return jdbc.query(
                "select c.id, c.name, c.color, cm.role " +
                "from calendars c join calendar_members cm on cm.calendar_id = c.id " +
                "where cm.user_id = ? order by c.id asc",
                CAL_SUMMARY,
                userId
        );
    }

    public long createCalendar(long ownerUserId, String name, String color) {
        Long calId = jdbc.queryForObject(
                "insert into calendars (name, color, created_by) values (?, coalesce(?, '#4f46e5'), ?) returning id",
                Long.class,
                name, color, ownerUserId
        );
        jdbc.update("insert into calendar_members (calendar_id, user_id, role) values (?,?,?)", calId, ownerUserId, "OWNER");
        return calId;
    }

    public CalendarRole roleOf(long calendarId, long userId) {
        String role = jdbc.queryForObject("select role from calendar_members where calendar_id=? and user_id=?", String.class, calendarId, userId);
        return CalendarRole.valueOf(role);
    }

    public boolean isMember(long calendarId, long userId) {
        Integer n = jdbc.queryForObject("select count(*) from calendar_members where calendar_id=? and user_id=?", Integer.class, calendarId, userId);
        return n != null && n > 0;
    }

    public void updateCalendar(long calendarId, String name, String color) {
        jdbc.update("update calendars set name=coalesce(?, name), color=coalesce(?, color), updated_at=now() where id=?",
                name, color, calendarId);
    }

    public void deleteCalendar(long calendarId) { jdbc.update("delete from calendars where id=?", calendarId); }

    public String calendarName(long calendarId) {
        return jdbc.queryForObject("select name from calendars where id=?", String.class, calendarId);
    }
}

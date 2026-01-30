package com.example.calendar.calendar;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public class SharingRepository {
    private final JdbcTemplate jdbc;

    public SharingRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    private static final RowMapper<CalendarDtos.MemberSummary> MEMBER = (rs, i) ->
            new CalendarDtos.MemberSummary(
                    rs.getLong("user_id"),
                    rs.getString("email"),
                    rs.getString("display_name"),
                    rs.getString("role")
            );

    private static final RowMapper<CalendarDtos.InviteSummary> INVITE = (rs, i) ->
            new CalendarDtos.InviteSummary(
                    rs.getLong("id"),
                    rs.getLong("calendar_id"),
                    rs.getString("invitee_email"),
                    rs.getString("role"),
                    rs.getString("status"),
                    rs.getString("token"),
                    rs.getObject("expires_at", OffsetDateTime.class).toString()
            );

    public List<CalendarDtos.MemberSummary> listMembers(long calendarId) {
        return jdbc.query(
                "select cm.user_id, u.email, u.display_name, cm.role " +
                "from calendar_members cm join users u on u.id = cm.user_id " +
                "where cm.calendar_id = ? order by cm.role asc, u.email asc",
                MEMBER,
                calendarId
        );
    }

    public List<CalendarDtos.InviteSummary> listInvites(long calendarId) {
        return jdbc.query(
                "select id, calendar_id, invitee_email, role, status, token, expires_at " +
                "from calendar_invites where calendar_id=? and status='PENDING' order by created_at desc",
                INVITE,
                calendarId
        );
    }

    public long createInvite(long calendarId, String inviteeEmail, String role, String token, long invitedBy, OffsetDateTime expiresAt) {
        Long id = jdbc.queryForObject(
                "insert into calendar_invites (calendar_id, invitee_email, role, token, invited_by, expires_at) values (?,?,?,?,?,?) returning id",
                Long.class,
                calendarId, inviteeEmail, role, token, invitedBy, expiresAt
        );
        return id;
    }

    public CalendarDtos.InviteInfo findInviteInfoByToken(String token) {
        return jdbc.queryForObject(
                "select i.calendar_id, c.name as calendar_name, u.email as inviter_email, i.role, i.status, i.expires_at, i.invitee_email " +
                "from calendar_invites i join calendars c on c.id=i.calendar_id join users u on u.id=i.invited_by " +
                "where i.token = ?",
                (rs, idx) -> new CalendarDtos.InviteInfo(
                        rs.getLong("calendar_id"),
                        rs.getString("calendar_name"),
                        rs.getString("inviter_email"),
                        rs.getString("role"),
                        rs.getString("status"),
                        rs.getObject("expires_at", OffsetDateTime.class).toString(),
                        rs.getString("invitee_email")
                ),
                token
        );
    }

    public void acceptInvite(String token, long userId) {
        jdbc.update(
                "insert into calendar_members (calendar_id, user_id, role) " +
                "select calendar_id, ?, role from calendar_invites where token=? " +
                "on conflict (calendar_id, user_id) do update set role = excluded.role",
                userId, token
        );
        jdbc.update("update calendar_invites set status='ACCEPTED' where token=? and status='PENDING'", token);
    }

    public void declineInvite(String token) {
        jdbc.update("update calendar_invites set status='DECLINED' where token=? and status='PENDING'", token);
    }

    public void revokeInvite(long inviteId) {
        jdbc.update("update calendar_invites set status='REVOKED' where id=? and status='PENDING'", inviteId);
    }

    public void setMemberRole(long calendarId, long userId, String role) {
        jdbc.update("update calendar_members set role=? where calendar_id=? and user_id=?", role, calendarId, userId);
    }

    public void removeMember(long calendarId, long userId) {
        jdbc.update("delete from calendar_members where calendar_id=? and user_id=?", calendarId, userId);
    }
}

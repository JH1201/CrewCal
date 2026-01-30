package com.example.calendar.calendar;

import com.example.calendar.calendar.CalendarDtos.*;
import com.example.calendar.common.security.AuthUtil;
import com.example.calendar.common.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class CalendarController {
    private final CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @GetMapping("/calendars")
    public List<CalendarSummary> list() {
        UserPrincipal p = AuthUtil.requirePrincipal();
        return calendarService.listForUser(p.email());
    }

    @PostMapping("/calendars")
    public Map<String, Object> create(@Valid @RequestBody CreateCalendarRequest req) {
        UserPrincipal p = AuthUtil.requirePrincipal();
        long id = calendarService.create(p.email(), req.name(), req.color());
        return Map.of("id", id);
    }

    @PatchMapping("/calendars/{calendarId}")
    public void update(@PathVariable long calendarId, @RequestBody UpdateCalendarRequest req) {
        UserPrincipal p = AuthUtil.requirePrincipal();
        calendarService.update(p.email(), calendarId, req.name(), req.color());
    }

    @DeleteMapping("/calendars/{calendarId}")
    public void delete(@PathVariable long calendarId) {
        UserPrincipal p = AuthUtil.requirePrincipal();
        calendarService.delete(p.email(), calendarId);
    }

    @GetMapping("/calendars/{calendarId}/members")
    public List<MemberSummary> members(@PathVariable long calendarId) {
        UserPrincipal p = AuthUtil.requirePrincipal();
        return calendarService.listMembers(p.email(), calendarId);
    }

    @PatchMapping("/calendars/{calendarId}/members/{userId}")
    public void changeRole(@PathVariable long calendarId, @PathVariable long userId, @RequestBody Map<String, String> body) {
        UserPrincipal p = AuthUtil.requirePrincipal();
        calendarService.changeRole(p.email(), calendarId, userId, body.get("role"));
    }

    @DeleteMapping("/calendars/{calendarId}/members/{userId}")
    public void removeMember(@PathVariable long calendarId, @PathVariable long userId) {
        UserPrincipal p = AuthUtil.requirePrincipal();
        calendarService.removeMember(p.email(), calendarId, userId);
    }

    @GetMapping("/calendars/{calendarId}/invites")
    public List<InviteSummary> invites(@PathVariable long calendarId) {
        UserPrincipal p = AuthUtil.requirePrincipal();
        return calendarService.listInvites(p.email(), calendarId);
    }

    @PostMapping("/calendars/{calendarId}/invites")
    public Map<String, Object> invite(@PathVariable long calendarId, @Valid @RequestBody InviteRequest req) {
        UserPrincipal p = AuthUtil.requirePrincipal();
        String token = calendarService.invite(p.email(), calendarId, req.email(), req.role());
        return Map.of("token", token);
    }

    @DeleteMapping("/calendars/{calendarId}/invites/{inviteId}")
    public void revokeInvite(@PathVariable long calendarId, @PathVariable long inviteId) {
        UserPrincipal p = AuthUtil.requirePrincipal();
        calendarService.revokeInvite(p.email(), calendarId, inviteId);
    }
}

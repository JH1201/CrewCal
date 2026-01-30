package com.example.calendar.calendar;

import com.example.calendar.auth.UserRepository;
import com.example.calendar.common.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CalendarService {
    private final CalendarRepository calendarRepository;
    private final SharingRepository sharingRepository;
    private final UserRepository userRepository;
    private final InviteEmailService inviteEmailService;

    public CalendarService(CalendarRepository calendarRepository,
                           SharingRepository sharingRepository,
                           UserRepository userRepository,
                           InviteEmailService inviteEmailService) {
        this.calendarRepository = calendarRepository;
        this.sharingRepository = sharingRepository;
        this.userRepository = userRepository;
        this.inviteEmailService = inviteEmailService;
    }

    public List<CalendarDtos.CalendarSummary> listForUser(String email) {
        long userId = userRepository.findIdByEmail(email);
        return calendarRepository.listForUser(userId);
    }

    public long create(String email, String name, String color) {
        long userId = userRepository.findIdByEmail(email);
        return calendarRepository.createCalendar(userId, name, color);
    }

    public void update(String email, long calendarId, String name, String color) {
        long userId = userRepository.findIdByEmail(email);
        requireOwner(calendarId, userId);
        calendarRepository.updateCalendar(calendarId, name, color);
    }

    public void delete(String email, long calendarId) {
        long userId = userRepository.findIdByEmail(email);
        requireOwner(calendarId, userId);
        calendarRepository.deleteCalendar(calendarId);
    }

    public List<CalendarDtos.MemberSummary> listMembers(String email, long calendarId) {
        long userId = userRepository.findIdByEmail(email);
        requireOwner(calendarId, userId);
        return sharingRepository.listMembers(calendarId);
    }

    public List<CalendarDtos.InviteSummary> listInvites(String email, long calendarId) {
        long userId = userRepository.findIdByEmail(email);
        requireOwner(calendarId, userId);
        return sharingRepository.listInvites(calendarId);
    }

    public String invite(String email, long calendarId, String inviteeEmail, String role) {
        long inviterId = userRepository.findIdByEmail(email);
        requireOwner(calendarId, inviterId);

        String token = UUID.randomUUID().toString().replace("-", "");
        sharingRepository.createInvite(calendarId, inviteeEmail, role, token, inviterId, OffsetDateTime.now().plusDays(7));

        String calendarName = calendarRepository.calendarName(calendarId);
        inviteEmailService.sendInvite(inviteeEmail, calendarName, email, role, token);

        return token;
    }

    public void revokeInvite(String email, long calendarId, long inviteId) {
        long userId = userRepository.findIdByEmail(email);
        requireOwner(calendarId, userId);
        sharingRepository.revokeInvite(inviteId);
    }

    public void changeRole(String email, long calendarId, long targetUserId, String role) {
        long userId = userRepository.findIdByEmail(email);
        requireOwner(calendarId, userId);
        sharingRepository.setMemberRole(calendarId, targetUserId, role);
    }

    public void removeMember(String email, long calendarId, long targetUserId) {
        long userId = userRepository.findIdByEmail(email);
        requireOwner(calendarId, userId);
        sharingRepository.removeMember(calendarId, targetUserId);
    }

    private void requireOwner(long calendarId, long userId) {
        CalendarRole role = calendarRepository.roleOf(calendarId, userId);
        if (role != CalendarRole.OWNER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Owner permission required");
        }
    }
}

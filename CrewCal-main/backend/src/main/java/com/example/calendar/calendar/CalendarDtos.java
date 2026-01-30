package com.example.calendar.calendar;

import jakarta.validation.constraints.NotBlank;

public class CalendarDtos {

    public record CalendarSummary(
            long id,
            String name,
            String color,
            String role
    ) {}

    public record CreateCalendarRequest(
            @NotBlank String name,
            String color
    ) {}

    public record UpdateCalendarRequest(
            String name,
            String color
    ) {}

    public record InviteRequest(
            @NotBlank String email,
            @NotBlank String role
    ) {}

    public record InviteSummary(
            long id,
            long calendarId,
            String inviteeEmail,
            String role,
            String status,
            String token,
            String expiresAt
    ) {}

    public record InviteInfo(
            long calendarId,
            String calendarName,
            String inviterEmail,
            String role,
            String status,
            String expiresAt,
            String inviteeEmail
    ) {}

    public record MemberSummary(
            long userId,
            String email,
            String displayName,
            String role
    ) {}
}

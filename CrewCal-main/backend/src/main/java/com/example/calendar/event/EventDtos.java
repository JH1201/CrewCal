package com.example.calendar.event;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class EventDtos {

    public record EventItem(
            long id,
            long calendarId,
            String title,
            String startAt,
            String endAt,
            boolean allDay,
            String note,
            Integer reminderMinutesBefore
    ) {}

    public record CreateEventRequest(
            @NotNull Long calendarId,
            @NotBlank String title,
            @NotBlank String startAt,
            @NotBlank String endAt,
            boolean allDay,
            String note,
            Integer reminderMinutesBefore
    ) {}

    public record UpdateEventRequest(
            String title,
            String startAt,
            String endAt,
            Boolean allDay,
            String note,
            Integer reminderMinutesBefore
    ) {}
}

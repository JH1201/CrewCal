package com.example.calendar.event;

import com.example.calendar.calendar.CalendarRepository;
import com.example.calendar.calendar.CalendarRole;
import com.example.calendar.common.exception.ApiException;
import com.example.calendar.common.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final ReminderRepository reminderRepository;
    private final CalendarRepository calendarRepository;

    public EventService(EventRepository eventRepository, ReminderRepository reminderRepository, CalendarRepository calendarRepository) {
        this.eventRepository = eventRepository;
        this.reminderRepository = reminderRepository;
        this.calendarRepository = calendarRepository;
    }

    public List<EventDtos.EventItem> list(UserPrincipal principal, List<Long> calendarIds, String fromIso, String toIso) {
        OffsetDateTime from = parseIso(fromIso);
        OffsetDateTime to = parseIso(toIso);

        List<EventDtos.EventItem> out = new ArrayList<>();
        for (Long calId : calendarIds) {
            if (!calendarRepository.isMember(calId, principal.userId())) continue;

            CalendarRole role = calendarRepository.roleOf(calId, principal.userId());
            var records = eventRepository.list(calId, from, to);

            for (var r : records) {
                Integer minutes = reminderRepository.findMinutesBefore(r.id());
                if (role == CalendarRole.FREEBUSY) {
                    out.add(new EventDtos.EventItem(
                            r.id(), r.calendarId(), "Busy",
                            r.startAt().toString(), r.endAt().toString(),
                            r.allDay(), null, null
                    ));
                } else {
                    out.add(new EventDtos.EventItem(
                            r.id(), r.calendarId(), r.title(),
                            r.startAt().toString(), r.endAt().toString(),
                            r.allDay(), r.note(), minutes
                    ));
                }
            }
        }
        return out;
    }

    public long create(UserPrincipal principal, EventDtos.CreateEventRequest req) {
        CalendarRole role = calendarRepository.roleOf(req.calendarId(), principal.userId());
        if (!(role == CalendarRole.OWNER || role == CalendarRole.EDITOR)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Editor permission required");
        }

        OffsetDateTime start = parseIso(req.startAt());
        OffsetDateTime end = parseIso(req.endAt());
        if (!end.isAfter(start)) throw new ApiException(HttpStatus.BAD_REQUEST, "endAt must be after startAt");

        long id = eventRepository.create(req.calendarId(), req.title(), start, end, req.allDay(), req.note(), principal.userId());
        reminderRepository.upsert(id, req.reminderMinutesBefore());
        return id;
    }

    public void update(UserPrincipal principal, long eventId, EventDtos.UpdateEventRequest req) {
        var existing = eventRepository.get(eventId);
        CalendarRole role = calendarRepository.roleOf(existing.calendarId(), principal.userId());
        if (!(role == CalendarRole.OWNER || role == CalendarRole.EDITOR)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Editor permission required");
        }

        OffsetDateTime start = req.startAt() != null ? parseIso(req.startAt()) : null;
        OffsetDateTime end = req.endAt() != null ? parseIso(req.endAt()) : null;

        eventRepository.update(eventId, req.title(), start, end, req.allDay(), req.note(), principal.userId());
        reminderRepository.upsert(eventId, req.reminderMinutesBefore());
    }

    public void delete(UserPrincipal principal, long eventId) {
        var existing = eventRepository.get(eventId);
        CalendarRole role = calendarRepository.roleOf(existing.calendarId(), principal.userId());
        if (!(role == CalendarRole.OWNER || role == CalendarRole.EDITOR)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Editor permission required");
        }
        eventRepository.softDelete(eventId, principal.userId());
        reminderRepository.upsert(eventId, null);
    }

    private OffsetDateTime parseIso(String iso) {
        try { return OffsetDateTime.parse(iso); }
        catch (DateTimeParseException e) { throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid ISO datetime: " + iso); }
    }
}

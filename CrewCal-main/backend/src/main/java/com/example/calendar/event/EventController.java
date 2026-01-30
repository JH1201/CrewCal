package com.example.calendar.event;

import com.example.calendar.common.security.AuthUtil;
import com.example.calendar.common.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class EventController {
    private final EventService eventService;

    public EventController(EventService eventService) { this.eventService = eventService; }

    @GetMapping("/events")
    public List<EventDtos.EventItem> list(@RequestParam String calendarIds, @RequestParam String from, @RequestParam String to) {
        UserPrincipal p = AuthUtil.requirePrincipal();
        List<Long> ids = Arrays.stream(calendarIds.split(","))
                .map(String::trim).filter(s -> !s.isEmpty())
                .map(Long::parseLong).collect(Collectors.toList());
        return eventService.list(p, ids, from, to);
    }

    @PostMapping("/events")
    public Map<String, Object> create(@Valid @RequestBody EventDtos.CreateEventRequest req) {
        UserPrincipal p = AuthUtil.requirePrincipal();
        long id = eventService.create(p, req);
        return Map.of("id", id);
    }

    @PatchMapping("/events/{eventId}")
    public void update(@PathVariable long eventId, @RequestBody EventDtos.UpdateEventRequest req) {
        UserPrincipal p = AuthUtil.requirePrincipal();
        eventService.update(p, eventId, req);
    }

    @DeleteMapping("/events/{eventId}")
    public void delete(@PathVariable long eventId) {
        UserPrincipal p = AuthUtil.requirePrincipal();
        eventService.delete(p, eventId);
    }
}

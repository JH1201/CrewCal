package com.example.calendar.calendar;

import com.example.calendar.common.exception.ApiException;
import com.example.calendar.common.security.AuthUtil;
import com.example.calendar.common.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/invites")
public class InviteController {

    private final SharingRepository sharingRepository;

    public InviteController(SharingRepository sharingRepository) {
        this.sharingRepository = sharingRepository;
    }

    @GetMapping("/{token}")
    public CalendarDtos.InviteInfo info(@PathVariable String token) {
        return sharingRepository.findInviteInfoByToken(token);
    }

    @PostMapping("/{token}/accept")
    public void accept(@PathVariable String token) {
        UserPrincipal p = AuthUtil.requirePrincipal();
        var info = sharingRepository.findInviteInfoByToken(token);

        if (!"PENDING".equals(info.status())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invite is not pending");
        }
        if (!p.email().equalsIgnoreCase(info.inviteeEmail())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Invite email mismatch. Please login as invitee.");
        }
        sharingRepository.acceptInvite(token, p.userId());
    }

    @PostMapping("/{token}/decline")
    public void decline(@PathVariable String token) {
        UserPrincipal p = AuthUtil.requirePrincipal();
        var info = sharingRepository.findInviteInfoByToken(token);

        if (!"PENDING".equals(info.status())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invite is not pending");
        }
        if (!p.email().equalsIgnoreCase(info.inviteeEmail())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Invite email mismatch. Please login as invitee.");
        }
        sharingRepository.declineInvite(token);
    }
}

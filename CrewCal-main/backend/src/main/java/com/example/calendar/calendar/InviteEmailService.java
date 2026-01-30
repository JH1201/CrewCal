package com.example.calendar.calendar;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class InviteEmailService {

    private final JavaMailSender mailSender;
    private final String frontendBaseUrl;

    public InviteEmailService(JavaMailSender mailSender,
                              @Value("${app.frontend.base-url}") String frontendBaseUrl) {
        this.mailSender = mailSender;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public void sendInvite(String toEmail, String calendarName, String inviterEmail, String role, String token) {
        String link = frontendBaseUrl + "/invite/" + token;

        String body =
                "You were invited to a calendar.\n\n" +
                "Calendar: " + calendarName + "\n" +
                "Inviter: " + inviterEmail + "\n" +
                "Role: " + role + "\n\n" +
                "Accept/Decline:\n" + link + "\n\n" +
                "(If you cannot open the link, copy & paste into your browser.)\n";

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(toEmail);
        msg.setSubject("[Calendar] Invitation to " + calendarName);
        msg.setText(body);

        mailSender.send(msg);
    }
}

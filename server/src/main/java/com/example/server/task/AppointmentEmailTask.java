package com.example.server.task;

import com.example.server.entity.Appointment;
import com.example.server.repository.AppointmentRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AppointmentEmailTask {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    // Run every day at 8 AM
    @Scheduled(cron = "0 0 8 * * *")
    public void sendAppointmentReminders() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59);

        List<Appointment> todayAppointments = appointmentRepository.findByStartTimeBetween(startOfDay, endOfDay);

        for (Appointment appt : todayAppointments) {
            if (appt.getPatient().getUser().getEmail() != null) {
                try {
                    sendEmail(
                            appt.getPatient().getUser().getEmail(),
                            "Appointment Reminder",
                            appt
                    );
                } catch (MessagingException e) {
                    // Log error
                }
            }
        }
    }

    private void sendEmail(String to, String subject, Appointment appt) throws MessagingException {
        Context context = new Context();
        context.setVariable("patientName", appt.getPatient().getName());
        context.setVariable("doctorName", appt.getDoctor().getName());
        context.setVariable("time", appt.getStartTime().toString());

        String process = templateEngine.process("reminder", context);

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage);

        helper.setSubject(subject);
        helper.setText(process, true);
        helper.setTo(to);

        mailSender.send(mimeMessage);
    }
}


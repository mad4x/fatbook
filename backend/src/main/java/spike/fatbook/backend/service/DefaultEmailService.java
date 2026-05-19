package spike.fatbook.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class DefaultEmailService implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(DefaultEmailService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.mail.from:no-reply@fatbook.local}")
    private String fromAddress;

    public DefaultEmailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    @Override
    public void sendDocentePassword(String to, String temporaryPassword) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null) {
            logger.warn("Mail non configurata: impossibile inviare password a {}", to);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("Credenziali accesso FatBook");
        message.setText(
            "Ciao,\n\n" +
            "Il tuo account FatBook e' stato creato.\n" +
            "Email: " + to + "\n" +
            "Password temporanea: " + temporaryPassword + "\n\n" +
            "Al primo accesso vai in Impostazioni per cambiare la password.\n"
        );

        sender.send(message);
    }
}

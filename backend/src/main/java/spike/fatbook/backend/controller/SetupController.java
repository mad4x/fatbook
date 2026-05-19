package spike.fatbook.backend.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import spike.fatbook.backend.enums.RuoliDisponibili;
import spike.fatbook.backend.model.Docente;
import spike.fatbook.backend.model.Utente;
import spike.fatbook.backend.repository.DocenteRepository;
import spike.fatbook.backend.repository.UtenteRepository;
import spike.fatbook.backend.service.EmailService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/setup")
@RequiredArgsConstructor
public class SetupController {

    private static final Logger logger = LoggerFactory.getLogger(SetupController.class);

    private final UtenteRepository utenteRepository;
    private final DocenteRepository docenteRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.bootstrap.token:}")
    private String bootstrapToken;

    public record BootstrapRequest(
        String nome,
        String cognome,
        String email,
        String password,
        boolean laboratorio
    ) {}

    @PostMapping("/bootstrap")
    public ResponseEntity<String> bootstrapVicepreside(
        @RequestHeader(name = "X-Bootstrap-Token", required = false) String token,
        @RequestBody BootstrapRequest request
    ) {
        if (bootstrapToken == null || bootstrapToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bootstrap disabilitato");
        }
        if (token == null || !token.equals(bootstrapToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token bootstrap non valido");
        }

        if (utenteRepository.existsByRuoliContaining(RuoliDisponibili.ROLE_VICEPRESIDE)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vicepreside gia presente");
        }

        if (request == null || request.email() == null || request.email().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email obbligatoria");
        }

        if (utenteRepository.findByEmail(request.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Utente gia presente");
        }

        Utente utente = new Utente();
        utente.setNome(defaultIfBlank(request.nome(), "Vicepreside"));
        utente.setCognome(defaultIfBlank(request.cognome(), ""));
        utente.setEmail(request.email());
        utente.setRuoli(List.of(RuoliDisponibili.ROLE_DOCENTE, RuoliDisponibili.ROLE_VICEPRESIDE));

        String rawPassword = request.password();
        if (rawPassword == null || rawPassword.isBlank()) {
            rawPassword = generateTemporaryPassword();
        }
        utente.setPasswordHash(passwordEncoder.encode(rawPassword));
        utenteRepository.save(utente);

        Docente docente = new Docente();
        docente.setUtente(utente);
        docente.setLaboratorio(request.laboratorio());
        docenteRepository.save(docente);

        logger.warn("Password bootstrap per {}: {}", request.email(), rawPassword);
        emailService.sendDocentePassword(request.email(), rawPassword);

        return ResponseEntity.status(HttpStatus.CREATED).body("Vicepreside creato");
    }

    private String generateTemporaryPassword() {
        String token = UUID.randomUUID().toString().replace("-", "");
        return token.substring(0, 12);
    }

    private String defaultIfBlank(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }
}
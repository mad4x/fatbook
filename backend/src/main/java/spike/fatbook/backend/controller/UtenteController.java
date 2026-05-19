package spike.fatbook.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import spike.fatbook.backend.model.Utente;
import spike.fatbook.backend.repository.UtenteRepository;

import java.util.List;
import java.security.Principal;

@RestController // Dice a Spring: "Questa classe risponde con JSON, non con HTML"
@RequestMapping("/api/users") // Tutti i metodi qui sotto inizieranno con /api/users
@CrossOrigin(origins = "http://localhost:3000") // FONDAMENTALE: Permette al frontend di chiamare il backend
public class UtenteController {

    private final UtenteRepository utenteRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UtenteController(UtenteRepository utenteRepository, PasswordEncoder passwordEncoder) {
        this.utenteRepository = utenteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // 1. API GET: Ritorna tutti gli utenti
    // URL: http://localhost:8080/api/users
    @GetMapping
    public List<Utente> getAllUsers() {
        return utenteRepository.findAll(); // Fa tutto lui: "SELECT * FROM users"
    }

    // 2. API POST: Crea un nuovo utente
    // URL: http://localhost:8080/api/users
    // Body richiesto: { "name": "Mario", "email": "mario@test.com", "password": "ABCD1234" }
    @PostMapping
    public Utente createUser(@RequestBody Utente newUser) {
        String password = newUser.getPasswordHash();
        if (password != null && !password.isBlank() && !password.startsWith("{")) {
            newUser.setPasswordHash(passwordEncoder.encode(password));
        }
        return utenteRepository.save(newUser); // Fa tutto lui: "INSERT INTO users..."
    }

    public record ChangePasswordRequest(String currentPassword, String newPassword) {}

    @PostMapping("/me/password")
    public ResponseEntity<Void> changePassword(Principal principal, @RequestBody ChangePasswordRequest request) {
        if (request == null || request.currentPassword() == null || request.newPassword() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password non valida");
        }

        Utente utente = utenteRepository.findByEmail(principal.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utente non trovato"));

        String currentHash = utente.getPasswordHash();
        if (currentHash == null || currentHash.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password non impostata");
        }

        if (!passwordEncoder.matches(request.currentPassword(), currentHash)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password attuale errata");
        }

        utente.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        utenteRepository.save(utente);
        return ResponseEntity.noContent().build();
    }
}
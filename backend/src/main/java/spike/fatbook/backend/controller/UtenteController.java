package spike.fatbook.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import spike.fatbook.backend.model.Utente;
import spike.fatbook.backend.repository.UtenteRepository;

import java.util.List;

@RestController // Dice a Spring: "Questa classe risponde con JSON, non con HTML"
@RequestMapping("/api/users") // Tutti i metodi qui sotto inizieranno con /api/users
@CrossOrigin(origins = "http://localhost:3000") // FONDAMENTALE: Permette al frontend di chiamare il backend
public class UtenteController {

    private final UtenteRepository utenteRepository;

    @Autowired
    public UtenteController(UtenteRepository utenteRepository) {
        this.utenteRepository = utenteRepository;
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
        return utenteRepository.save(newUser); // Fa tutto lui: "INSERT INTO users..."
    }
}
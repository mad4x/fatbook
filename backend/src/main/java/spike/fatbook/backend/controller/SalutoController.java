package spike.fatbook.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import spike.fatbook.backend.model.Utente;
import spike.fatbook.backend.repository.UtenteRepository;

@RestController
public class SalutoController {

    @Autowired // Dice a Spring di portarci il "telecomando" del database
    private UtenteRepository utenteRepository;

    @GetMapping("/crea")
    public String creaUtente() {
        Utente nuovo = new Utente();
        nuovo.setNome("Mario Rossi");
        nuovo.setEmail("mario@example.com");

        utenteRepository.save(nuovo); // Salva nel database!

        return "Utente salvato correttamente!";
    }

    @GetMapping("/hello")
    public String direCiao() {
        return "<h1>Ciao! Questo è il mio primo server con Spring Boot!</h1>";
    }
}
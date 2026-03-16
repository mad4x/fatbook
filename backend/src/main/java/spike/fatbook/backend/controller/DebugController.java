package spike.fatbook.backend.controller;

import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.http.parser.Authorization;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import spike.fatbook.backend.repository.UtenteRepository;

import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DebugController {

    private final UtenteRepository utenteRepository;

    @GetMapping("/me")
    public Object me(Authentication auth) {
        if (auth == null) return "No auth object found";

        System.out.println("User: " + auth.getName());
        System.out.println("Authorities: " + auth.getAuthorities());

        return Map.of(
                "utente", auth.getName(),
                "ruoli", auth.getAuthorities()
        );
    }
}

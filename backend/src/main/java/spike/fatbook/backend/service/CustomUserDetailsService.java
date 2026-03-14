package spike.fatbook.backend.service;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import spike.fatbook.backend.model.Utente;
import spike.fatbook.backend.repository.UtenteRepository;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UtenteRepository utenteRepository;

    public CustomUserDetailsService(UtenteRepository utenteRepository) {
        this.utenteRepository = utenteRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) {

        Utente utente = utenteRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));

        List<String> ruoli = utente.getRuoli().stream()
                .map(ruolo -> ruolo.getRuolo().getNomeRuolo().name())
                .toList();

        return User.builder()
                .username(utente.getEmail())
                .password("")
                .roles(ruoli.toArray(new String[0]))
                .build();
    }
}

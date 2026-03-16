package spike.fatbook.backend.service;

import jakarta.transaction.Transactional;
import org.springframework.lang.NonNull;
import org.springframework.security.core.userdetails.UserDetailsService;
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
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Utente utente = utenteRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utente non trovato con email: " + username));

        List<String> ruoli = utente.getRuoli().stream()
                .map(Enum::name)
                .toList();

        return User.builder()
                .username(utente.getEmail())
                .password("{noop}placeholder") // Meglio mettere questo per evitare errori del builder
                .authorities(ruoli.toArray(new String[0]))
                .build();
    }
}
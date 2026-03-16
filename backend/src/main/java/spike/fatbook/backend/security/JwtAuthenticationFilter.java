package spike.fatbook.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    // Iniezione delle dipendenze (Spring ci passa il JwtService che abbiamo creato e il gestore utenti)
    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Cerca l'header "Authorization" nella richiesta HTTP
        final String authHeader = request.getHeader("Authorization");
        System.out.println("1. HEADER RICEVUTO: " + authHeader); // DEBUG
        final String jwt;
        final String username;

        // Se l'header manca o non inizia con "Bearer ", ignoriamo il token e passiamo al filtro successivo.
        // (Magari è una richiesta a un endpoint pubblico come /api/auth/login)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("2. Niente token o formato errato. Passo la richiesta non autenticata."); // DEBUG
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Estrae il token vero e proprio (rimuovendo i primi 7 caratteri, cioè "Bearer ")
        jwt = authHeader.substring(7);

        // 3. Chiede al JwtService di estrarre l'username (l'email) dal token
        username = jwtService.extractUsername(jwt);
        System.out.println("3. EMAIL ESTRATTA DAL TOKEN: " + username); // DEBUG


        // 4. Se abbiamo trovato un username e l'utente NON è ancora autenticato in questo momento...
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Carica i dettagli dell'utente dal nostro UserDetailsService (per ora docente/vicepreside in memoria)
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 5. Controlla se il token è valido (non scaduto e appartiene davvero a questo utente)
            if (jwtService.isTokenValid(jwt, userDetails)) {
                System.out.println("4. TOKEN VALIDO! Imposto l'autenticazione per: " + userDetails.getUsername()); // DEBUG
                // Crea il "Pass VIP" ufficiale di Spring Security
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                // Aggiunge dettagli extra sulla richiesta (es. indirizzo IP, utile per i log)
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // 6. Dice a Spring Security: "Da questo momento in poi, considera questo utente loggato per questa richiesta!"
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 7. Passa la palla al prossimo filtro nella catena (o direttamente al Controller)
        filterChain.doFilter(request, response);
    }
}
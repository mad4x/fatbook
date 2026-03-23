package spike.fatbook.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import spike.fatbook.backend.service.CustomUserDetailsService; // Assicurati che l'import sia corretto

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService customUserDetailsService;

    // Iniettiamo il nostro vigile (il filtro) e il tuo servizio che legge dal DB
    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, CustomUserDetailsService customUserDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // 1. Disabilita CSRF: I token JWT sono immuni agli attacchi CSRF per natura, quindi lo spegniamo.
                .csrf(AbstractHttpConfigurer::disable)

                // 2. Regole di accesso
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll() // Lascia passare tutti per il login/registrazione
                    .requestMatchers(HttpMethod.GET, "/api/avvisi/**").hasAnyRole("DOCENTE", "VICEPRESIDE", "VICEPRESIDENZA", "ADMIN")
                    .requestMatchers(HttpMethod.POST, "/api/avvisi/**").hasAnyRole("VICEPRESIDE", "VICEPRESIDENZA", "ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/avvisi/**").hasAnyRole("VICEPRESIDE", "VICEPRESIDENZA", "ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/avvisi/**").hasAnyRole("VICEPRESIDE", "VICEPRESIDENZA", "ADMIN")
                        .anyRequest().authenticated() // Richiede il token JWT per QUALSIASI altra rotta (es. /api/me)
                )

                // 3. STATELESS: Diciamo a Spring di non creare la sessione (il JSESSIONID non ci serve più)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 4. Colleghiamo i pezzi
                .authenticationProvider(authenticationProvider())

                // 5. Mettiamo il nostro "vigile" PRIMA del filtro standard di Spring
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // --- BEAN DI CONFIGURAZIONE NECESSARI ---

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Inserisci l'URL esatto del tuo frontend Next.js
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // Diciamo a Spring Security di usare il tuo CustomUserDetailsService
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    // Gestore dell'autenticazione (ci servirà poi nel controller per il login)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // Spring richiede sempre un PasswordEncoder, anche se per ora usiamo Google
    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }
}
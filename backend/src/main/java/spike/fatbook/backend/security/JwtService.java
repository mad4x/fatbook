package spike.fatbook.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import spike.fatbook.backend.model.Utente;
import spike.fatbook.backend.repository.UtenteRepository;

import java.security.Key;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtService {

    private final UtenteRepository utenteRepository;
    // Legge la chiave segreta da application.properties
    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    // Legge la scadenza da application.properties
    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    public JwtService(UtenteRepository utenteRepository) {
        this.utenteRepository = utenteRepository;
    }

    // 1. Estrae l'email (che in Spring si chiama Username) dal token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 2. Genera un token nuovo per un utente
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();

        List<String> authorities = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        Utente utente = utenteRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Utente non trovato"));
        String nome = utente.getNome();
        String cognome = utente.getCognome();

        extraClaims.put("authorities", authorities);
        extraClaims.put("nome", nome);
        extraClaims.put("cognome", cognome);
        return generateToken(extraClaims, userDetails);
    }

    // 3. Genera un token permettendo di inserire dati extra (es. ruoli custom)
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername()) // Di solito è l'email dell'utente
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // Firma il token
                .compact();
    }

    // 4. Verifica che il token sia valido per un determinato utente e non sia scaduto
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Cuore della decodifica: se qualcuno manomette il token, questa funzione va in errore
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Prepara la chiave crittografica per firmare/verificare
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
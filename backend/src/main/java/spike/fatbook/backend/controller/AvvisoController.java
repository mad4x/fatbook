package spike.fatbook.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spike.fatbook.backend.enums.PrioritaAvviso;
import spike.fatbook.backend.enums.StatoAvviso;
import spike.fatbook.backend.model.Avviso;
import spike.fatbook.backend.model.AvvisoLettura;
import spike.fatbook.backend.service.AvvisoService;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/avvisi")
@RequiredArgsConstructor
public class AvvisoController {

    private final AvvisoService avvisoService;

    @GetMapping
    public ResponseEntity<List<AvvisoResponse>> getAvvisi() {
        List<AvvisoResponse> avvisi = avvisoService.getAllVisible().stream().map(this::toResponse).toList();
        return ResponseEntity.ok(avvisi);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAvvisoById(@PathVariable Long id) {
        return avvisoService.getByIdVisible(id)
                .<ResponseEntity<?>>map(avviso -> ResponseEntity.ok(toResponse(avviso)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Avviso non trovato"));
    }

    @PostMapping
    public ResponseEntity<?> createAvviso(@RequestBody AvvisoWriteRequest request) {
        ValidationResult validation = validateRequest(request);
        if (!validation.valid()) {
            return ResponseEntity.badRequest().body(validation.errorMessage());
        }

        Avviso salvato = avvisoService.create(
                validation.titolo(),
                validation.contenuto(),
                validation.autore(),
            validation.categoria(),
            request.tags(),
            request.allegati(),
            request.priorita(),
            request.stato()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(salvato));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAvviso(@PathVariable Long id, @RequestBody AvvisoWriteRequest request) {
        ValidationResult validation = validateRequest(request);
        if (!validation.valid()) {
            return ResponseEntity.badRequest().body(validation.errorMessage());
        }

        Optional<Avviso> aggiornato = avvisoService.update(
                id,
                validation.titolo(),
                validation.contenuto(),
                validation.autore(),
            validation.categoria(),
            request.tags(),
            request.allegati(),
            request.priorita(),
            request.stato()
        );

        return aggiornato
                .<ResponseEntity<?>>map(avviso -> ResponseEntity.ok(toResponse(avviso)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Avviso non trovato"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAvviso(@PathVariable Long id) {
        boolean deleted = avvisoService.delete(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Avviso non trovato");
        }

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/letto")
    public ResponseEntity<?> markLetto(@PathVariable Long id) {
        boolean marked = avvisoService.markLetto(id);
        if (!marked) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Avviso non trovato");
        }

        return ResponseEntity.ok(new AvvisoLettoStateResponse(
                id,
                avvisoService.isLettoByCurrentUser(id),
                avvisoService.getLettureCount(id)
        ));
    }

    @GetMapping("/{id}/letti")
    public ResponseEntity<?> getLetture(@PathVariable Long id) {
        if (avvisoService.getById(id).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Avviso non trovato");
        }

        List<AvvisoLetturaResponse> letture = avvisoService.getLettureByAvviso(id).stream()
                .map(this::toLetturaResponse)
                .toList();

        return ResponseEntity.ok(letture);
    }

    private ValidationResult validateRequest(AvvisoWriteRequest request) {
        String titolo = Optional.ofNullable(request.titolo()).orElse("").trim();
        String contenuto = Optional.ofNullable(request.contenuto()).orElse("").trim();
        String autore = Optional.ofNullable(request.autore()).orElse("").trim();
        String categoria = Optional.ofNullable(request.categoria()).orElse("").trim();

        if (titolo.isBlank() || contenuto.isBlank() || autore.isBlank()) {
            return ValidationResult.error("Titolo, contenuto e autore sono obbligatori.");
        }

        if (categoria.isBlank()) {
            categoria = "Generale";
        }

        return ValidationResult.success(titolo, contenuto, autore, categoria);
    }

    private AvvisoResponse toResponse(Avviso avviso) {
        return new AvvisoResponse(
                avviso.getId(),
                avviso.getTitolo(),
                avviso.getContenuto(),
                avviso.getDataCreazione(),
                avviso.getAutore(),
                avviso.getPriorita() == null ? PrioritaAvviso.NORMALE : avviso.getPriorita(),
                avviso.getStato() == null ? StatoAvviso.PUBBLICATO : avviso.getStato(),
                avviso.getCategoria(),
                parseTagsCsv(avviso.getTagsCsv()),
                parseAllegati(avviso.getAllegatiCsv()),
                avviso.getCreatoDa(),
                avviso.getAggiornatoDa(),
                avviso.getDataAggiornamento(),
                avvisoService.isLettoByCurrentUser(avviso.getId()),
                avvisoService.getLettureCount(avviso.getId())
        );
    }

    private AvvisoLetturaResponse toLetturaResponse(AvvisoLettura lettura) {
        return new AvvisoLetturaResponse(
                lettura.getId(),
                lettura.getUtente().getNome(),
                lettura.getUtente().getCognome(),
                lettura.getUtente().getEmail(),
                lettura.getLettoAt()
        );
    }

    private List<String> parseTagsCsv(String csv) {
        if (csv == null || csv.isBlank()) {
            return List.of();
        }

        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(token -> !token.isBlank())
                .toList();
    }

    private List<String> parseAllegati(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }

        String trimmed = raw.trim();

        if (trimmed.contains("\n")) {
            return Arrays.stream(trimmed.split("\\R"))
                    .map(String::trim)
                    .filter(token -> !token.isBlank())
                    .toList();
        }

        List<String> decoded = Arrays.stream(trimmed.split(","))
                .map(String::trim)
                .filter(token -> !token.isBlank())
                .map(this::decodeBase64OrRaw)
                .filter(token -> !token.isBlank())
                .toList();

        if (!decoded.isEmpty()) {
            return decoded;
        }

        return Arrays.stream(trimmed.split(","))
                .map(String::trim)
                .filter(token -> !token.isBlank())
                .toList();
    }

    private String decodeBase64OrRaw(String token) {
        try {
            return new String(Base64.getUrlDecoder().decode(token), StandardCharsets.UTF_8).trim();
        } catch (IllegalArgumentException ignored) {
            return token;
        }
    }

    public record AvvisoWriteRequest(
            String titolo,
            String contenuto,
            String autore,
                String categoria,
                List<String> tags,
                List<String> allegati,
                PrioritaAvviso priorita,
                StatoAvviso stato
    ) {
    }

    public record AvvisoResponse(
            Long id,
            String titolo,
            String contenuto,
            java.time.LocalDateTime dataCreazione,
            String autore,
            PrioritaAvviso priorita,
            StatoAvviso stato,
            String categoria,
            List<String> tags,
            List<String> allegati,
            String creatoDa,
            String aggiornatoDa,
                LocalDateTime dataAggiornamento,
                boolean lettoDaUtente,
                int lettureCount
    ) {
    }

            public record AvvisoLetturaResponse(
                Long id,
                String nome,
                String cognome,
                String email,
                LocalDateTime lettoAt
            ) {
            }

            public record AvvisoLettoStateResponse(
                Long avvisoId,
                boolean lettoDaUtente,
                int lettureCount
            ) {
            }

    private record ValidationResult(boolean valid, String titolo, String contenuto, String autore, String categoria, String errorMessage) {
        static ValidationResult success(String titolo, String contenuto, String autore, String categoria) {
            return new ValidationResult(true, titolo, contenuto, autore, categoria, null);
        }

        static ValidationResult error(String errorMessage) {
            return new ValidationResult(false, null, null, null, null, errorMessage);
        }
    }
}

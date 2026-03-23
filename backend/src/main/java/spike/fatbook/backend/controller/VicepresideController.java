package spike.fatbook.backend.controller;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import spike.fatbook.backend.dto.DocenteRequestDTO;
import spike.fatbook.backend.dto.DocenteResponseDTO;
import spike.fatbook.backend.service.DocenteService;

import java.util.List;

@RestController
@RequestMapping("/api/vicepresidenza") // L'URL base per le API dei docenti lato vicepreside
@RequiredArgsConstructor
public class VicepresideController {

    private final DocenteService docenteService;

    @PostMapping("docente")
    @PreAuthorize("hasRole('VICEPRESIDE')")
    public ResponseEntity<String> creaDocente(@RequestBody DocenteRequestDTO dto) {
        try {
            // Passiamo il "pacchetto" al Service che farà tutto il lavoro sporco
            docenteService.creaNuovoDocente(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body("Docente creato con successo!");

        } catch (IllegalArgumentException e) {
            // Se l'email esiste già, il Service lancia questa eccezione e noi restituiamo un errore 400 (Bad Request)
            return ResponseEntity.badRequest().body(e.getMessage());

        } catch (Exception e) {
            // Per qualsiasi altro errore imprevisto, restituiamo un 500
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Errore interno durante la creazione del docente.");
        }
    }
}
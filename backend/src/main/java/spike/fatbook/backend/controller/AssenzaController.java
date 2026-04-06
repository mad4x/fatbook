package spike.fatbook.backend.controller;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spike.fatbook.backend.dto.AssenzaRequestDTO;
import spike.fatbook.backend.dto.AssenzaResponseDTO;
import spike.fatbook.backend.model.Assenza;
import spike.fatbook.backend.service.AssenzaService;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/assenze")
@RequiredArgsConstructor
public class AssenzaController {

    private final AssenzaService assenzaService;

    @GetMapping
    public ResponseEntity<@NonNull List<AssenzaResponseDTO>> getAssenzePerData(
            // @RequestParam dice a Spring di cercare "?data=" nell'URL
            // @DateTimeFormat aiuta Spring a capire che la stringa "2026-04-06" è una data ISO
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data
    ) {
        List<AssenzaResponseDTO> assenze = assenzaService.getAssenzeDelGiorno(data);
        return ResponseEntity.ok(assenze);
    }

    @PostMapping
    public ResponseEntity<?> creaAssenza(@RequestBody AssenzaRequestDTO dto, Principal principal) {
        // principal.getName() restituisce il "subject" del JWT, che di solito è l'email
        String emailVicepreside = principal.getName();

        AssenzaResponseDTO responseDTO = assenzaService.registraAssenza(dto, emailVicepreside);

        return ResponseEntity.ok(responseDTO);
    }
}

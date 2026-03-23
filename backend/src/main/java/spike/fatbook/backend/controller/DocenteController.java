package spike.fatbook.backend.controller;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import spike.fatbook.backend.dto.DocenteResponseDTO;
import spike.fatbook.backend.service.DocenteService;

import java.util.List;

@RestController
@RequestMapping("/api/docenti") // L'URL base per le API dei docenti lato vicepreside
@RequiredArgsConstructor
public class DocenteController {

    private final DocenteService docenteService;

    @GetMapping()
    public ResponseEntity<@NonNull List<DocenteResponseDTO>> getAllDocenti() {
        List<DocenteResponseDTO> listaDocenti = docenteService.getAllDocenti();
        return ResponseEntity.ok(listaDocenti);
    }
}

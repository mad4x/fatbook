package spike.fatbook.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import spike.fatbook.backend.dto.SostituzioneAssignDTO;
import spike.fatbook.backend.dto.SostituzioneDocenteStatsDTO;
import spike.fatbook.backend.dto.SostituzioneSlotDTO;
import spike.fatbook.backend.service.SostituzioneService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/vicepresidenza/sostituzioni")
@RequiredArgsConstructor
@PreAuthorize("hasRole('VICEPRESIDE')")
public class SostituzioneController {

    private final SostituzioneService sostituzioneService;

    @GetMapping
    public ResponseEntity<List<SostituzioneSlotDTO>> getSlots(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data
    ) {
        return ResponseEntity.ok(sostituzioneService.getSlots(data));
    }

    @PostMapping
    public ResponseEntity<SostituzioneSlotDTO> assegna(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
        @RequestBody SostituzioneAssignDTO dto
    ) {
        return ResponseEntity.ok(sostituzioneService.assegna(dto, data));
    }

    @GetMapping("/stats")
    public ResponseEntity<List<SostituzioneDocenteStatsDTO>> getDocenteStats(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(sostituzioneService.getDocenteStats(date));
    }
}

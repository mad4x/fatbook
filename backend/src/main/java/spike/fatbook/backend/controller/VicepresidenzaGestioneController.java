package spike.fatbook.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import spike.fatbook.backend.dto.*;
import spike.fatbook.backend.enums.GiornoSettimana;
import spike.fatbook.backend.service.DocenteService;
import spike.fatbook.backend.service.VicepresidenzaGestioneService;

@RestController
@RequestMapping("/api/vicepresidenza")
@RequiredArgsConstructor
@PreAuthorize("hasRole('VICEPRESIDE')")
public class VicepresidenzaGestioneController {

    private final VicepresidenzaGestioneService service;
    private final DocenteService docenteService;

    @GetMapping("/classi")
    public ResponseEntity<List<ClasseAdminDTO>> getClassi() {
        return ResponseEntity.ok(service.getClassi());
    }

    @PostMapping("/classi")
    public ResponseEntity<ClasseAdminDTO> createClasse(@RequestBody ClasseWriteDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createClasse(dto));
    }

    @PutMapping("/classi/{id}")
    public ResponseEntity<ClasseAdminDTO> updateClasse(@PathVariable Long id, @RequestBody ClasseWriteDTO dto) {
        return ResponseEntity.ok(service.updateClasse(id, dto));
    }

    @DeleteMapping("/classi/{id}")
    public ResponseEntity<Void> deleteClasse(
        @PathVariable Long id,
        @org.springframework.web.bind.annotation.RequestParam(defaultValue = "false") boolean cascade
    ) {
        service.deleteClasse(id, cascade);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/materie")
    public ResponseEntity<List<MateriaAdminDTO>> getMaterie() {
        return ResponseEntity.ok(service.getMaterie());
    }

    @PostMapping("/materie")
    public ResponseEntity<MateriaAdminDTO> createMateria(@RequestBody MateriaWriteDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createMateria(dto));
    }

    @PutMapping("/materie/{id}")
    public ResponseEntity<MateriaAdminDTO> updateMateria(@PathVariable Long id, @RequestBody MateriaWriteDTO dto) {
        return ResponseEntity.ok(service.updateMateria(id, dto));
    }

    @DeleteMapping("/materie/{id}")
    public ResponseEntity<Void> deleteMateria(
        @PathVariable Long id,
        @org.springframework.web.bind.annotation.RequestParam(defaultValue = "false") boolean cascade
    ) {
        service.deleteMateria(id, cascade);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/aule")
    public ResponseEntity<List<AulaAdminDTO>> getAule() {
        return ResponseEntity.ok(service.getAule());
    }

    @PostMapping("/aule")
    public ResponseEntity<AulaAdminDTO> createAula(@RequestBody AulaWriteDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createAula(dto));
    }

    @PutMapping("/aule/{id}")
    public ResponseEntity<AulaAdminDTO> updateAula(@PathVariable Long id, @RequestBody AulaWriteDTO dto) {
        return ResponseEntity.ok(service.updateAula(id, dto));
    }

    @DeleteMapping("/aule/{id}")
    public ResponseEntity<Void> deleteAula(
        @PathVariable Long id,
        @org.springframework.web.bind.annotation.RequestParam(defaultValue = "false") boolean cascade
    ) {
        service.deleteAula(id, cascade);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/classi/{id}/orario")
    public ResponseEntity<List<OrarioClasseVicepresideDTO>> getOrarioClasse(@PathVariable Long id) {
        return ResponseEntity.ok(service.getOrarioClasse(id));
    }

    @PutMapping("/classi/{classeId}/orario/{oraId}")
    public ResponseEntity<OrarioClasseVicepresideDTO> updateOraClasse(
        @PathVariable Long classeId,
        @PathVariable Long oraId,
        @RequestBody OrarioClasseUpdateDTO dto
    ) {
        return ResponseEntity.ok(service.updateOraClasse(classeId, oraId, dto));
    }

    @PutMapping("/classi/{classeId}/orario")
    public ResponseEntity<OrarioClasseVicepresideDTO> upsertOraClasse(
        @PathVariable Long classeId,
        @RequestBody OrarioClasseUpsertDTO dto
    ) {
        return ResponseEntity.ok(service.upsertOraClasse(classeId, dto));
    }

    @PostMapping("/docente")
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

    @PutMapping("/docente/{id}")
    public ResponseEntity<String> aggiornaDocente(@PathVariable Long id, @RequestBody DocenteRequestDTO dto) {
        try {
            docenteService.aggiornaDocente(id, dto);
            return ResponseEntity.ok("Docente aggiornato con successo!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Errore interno durante l'aggiornamento del docente.");
        }
    }

    @GetMapping("/docenti/disponibilita")
    public ResponseEntity<List<DocenteDisponibilitaDTO>> getDisponibilitaDocenti(
        @org.springframework.web.bind.annotation.RequestParam GiornoSettimana giorno,
        @org.springframework.web.bind.annotation.RequestParam int ora,
        @org.springframework.web.bind.annotation.RequestParam Long classeId
    ) {
        return ResponseEntity.ok(service.getDisponibilitaDocenti(giorno, ora, classeId));
    }
}

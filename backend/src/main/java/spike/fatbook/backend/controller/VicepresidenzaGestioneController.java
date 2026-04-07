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
import spike.fatbook.backend.dto.AulaAdminDTO;
import spike.fatbook.backend.dto.AulaWriteDTO;
import spike.fatbook.backend.dto.ClasseAdminDTO;
import spike.fatbook.backend.dto.ClasseWriteDTO;
import spike.fatbook.backend.dto.MateriaAdminDTO;
import spike.fatbook.backend.dto.MateriaWriteDTO;
import spike.fatbook.backend.dto.OrarioClasseUpsertDTO;
import spike.fatbook.backend.dto.OrarioClasseUpdateDTO;
import spike.fatbook.backend.dto.OrarioClasseVicepresideDTO;
import spike.fatbook.backend.service.VicepresidenzaGestioneService;

@RestController
@RequestMapping("/api/vicepresidenza")
@RequiredArgsConstructor
@PreAuthorize("hasRole('VICEPRESIDE')")
public class VicepresidenzaGestioneController {

    private final VicepresidenzaGestioneService service;

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
    public ResponseEntity<Void> deleteClasse(@PathVariable Long id) {
        service.deleteClasse(id);
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
    public ResponseEntity<Void> deleteMateria(@PathVariable Long id) {
        service.deleteMateria(id);
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
    public ResponseEntity<Void> deleteAula(@PathVariable Long id) {
        service.deleteAula(id);
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
}

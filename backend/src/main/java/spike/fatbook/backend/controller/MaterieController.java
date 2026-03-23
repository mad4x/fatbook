package spike.fatbook.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import spike.fatbook.backend.dto.MaterieSinteticheDTO;
import spike.fatbook.backend.model.Materia;
import spike.fatbook.backend.repository.MateriaRepository;

import java.util.List;

@RestController
@RequestMapping("/api/materie") // L'URL base per le API dei docenti lato vicepreside
@RequiredArgsConstructor
public class MaterieController {

    private final MateriaRepository materiaRepository;

    @GetMapping
    public List<MaterieSinteticheDTO> findAll() {
        List<Materia> materie = materiaRepository.findAll();

        return materie.stream()
            .map(materia -> new MaterieSinteticheDTO(
               materia.getId(), materia.getNome()
           )).toList();
    }
}
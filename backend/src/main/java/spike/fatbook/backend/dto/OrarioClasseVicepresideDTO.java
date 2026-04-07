package spike.fatbook.backend.dto;

import java.util.List;

import spike.fatbook.backend.enums.GiornoSettimana;

public record OrarioClasseVicepresideDTO(
    Long oraId,
    Long classeId,
    String classe,
    GiornoSettimana giorno,
    int ora,
    Long materiaId,
    String materia,
    Long aulaId,
    String aula,
    List<Long> docentiIds,
    List<String> docenti
) {}

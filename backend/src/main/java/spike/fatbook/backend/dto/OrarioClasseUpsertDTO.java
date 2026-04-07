package spike.fatbook.backend.dto;

import java.util.List;

import spike.fatbook.backend.enums.GiornoSettimana;

public record OrarioClasseUpsertDTO(
    GiornoSettimana giorno,
    int ora,
    Long materiaId,
    Long aulaId,
    List<Long> docentiIds
) {}

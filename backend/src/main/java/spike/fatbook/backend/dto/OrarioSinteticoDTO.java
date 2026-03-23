package spike.fatbook.backend.dto;

import spike.fatbook.backend.model.Materia;

public record OrarioSinteticoDTO(
        String classe,
        int ora,
        Materia materia,
        String aula
) {}

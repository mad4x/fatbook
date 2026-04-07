package spike.fatbook.backend.dto;

import java.util.List;

public record OrarioClasseUpdateDTO(
    Long materiaId,
    Long aulaId,
    List<Long> docentiIds
) {}

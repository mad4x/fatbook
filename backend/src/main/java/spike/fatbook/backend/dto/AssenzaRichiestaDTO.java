package spike.fatbook.backend.dto;

import java.time.LocalDate;

public record AssenzaRichiestaDTO(
    LocalDate data,
    LocalDate dataFine,
    Integer ora,
    String motivazione,
    Boolean giornaliera
) {}

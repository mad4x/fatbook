package spike.fatbook.backend.dto;

import java.time.LocalDate;

public record AssenzaResponseDTO(
    Long id,
    LocalDate data,
    Integer ora,
    String motivazione,
    boolean giornaliera,
    String nomeDocente,
    String cognomeDocente,
    String emailDocente
) {}

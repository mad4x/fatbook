package spike.fatbook.backend.dto;

public record SostituzioneAssignDTO(
    Long assenzaId,
    Long docenteSostitutoId,
    String supplenteNome
) {}

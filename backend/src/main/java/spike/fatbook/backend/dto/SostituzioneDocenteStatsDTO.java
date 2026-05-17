package spike.fatbook.backend.dto;

public record SostituzioneDocenteStatsDTO(
    Long docenteId,
    String nome,
    String cognome,
    String email,
    int oreTotali,
    int oreAssenza,
    int orePresenza,
    int oreSostituzione,
    double percentualeAssenza
) {}

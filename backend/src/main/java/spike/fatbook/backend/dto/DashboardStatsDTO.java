package spike.fatbook.backend.dto;

public record DashboardStatsDTO(
    int oreTotali,
    int oreAssenza,
    int orePresenza,
    double percentualeAssenza
) {}

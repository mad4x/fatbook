package spike.fatbook.backend.dto;

import java.util.List;

public record DashboardWeeklyDTO(
    List<DashboardSlotDTO> slots,
    DashboardStatsDTO stats,
    List<DashboardSostituzioneDTO> sostituzioni
) {}

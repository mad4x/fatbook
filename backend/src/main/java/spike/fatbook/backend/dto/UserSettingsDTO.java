package spike.fatbook.backend.dto;

public record UserSettingsDTO(
    String theme,
    boolean compactTables,
    boolean reduceMotion,
    boolean confirmCritical,
    boolean weeklyDigest,
    boolean smartHints,
    boolean reminderOrario,
    boolean laboratorioDefault
) {}

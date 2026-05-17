package spike.fatbook.backend.dto;

import java.time.LocalDate;

import spike.fatbook.backend.enums.GiornoSettimana;

public record DashboardSlotDTO(
    LocalDate data,
    GiornoSettimana giorno,
    int ora,
    String classeNome,
    String materia,
    String aula,
    Long assenzaId,
    String docenteAssenteNome,
    String docenteAssenteCognome,
    String docenteSostitutoNome,
    String docenteSostitutoCognome,
    String supplenteNome
) {}

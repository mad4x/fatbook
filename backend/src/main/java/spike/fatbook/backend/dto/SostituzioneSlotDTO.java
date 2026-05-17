package spike.fatbook.backend.dto;

import java.time.LocalDate;

import spike.fatbook.backend.enums.GiornoSettimana;

public record SostituzioneSlotDTO(
    Long sostituzioneId,
    Long assenzaId,
    LocalDate data,
    GiornoSettimana giorno,
    int ora,
    Long classeId,
    String classeNome,
    String materia,
    String aula,
    Long docenteAssenteId,
    String docenteAssenteNome,
    String docenteAssenteCognome,
    String docenteAssenteEmail,
    Long docenteSostitutoId,
    String docenteSostitutoNome,
    String docenteSostitutoCognome,
    String supplenteNome
) {}

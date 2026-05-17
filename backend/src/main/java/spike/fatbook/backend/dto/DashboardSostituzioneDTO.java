package spike.fatbook.backend.dto;

import java.time.LocalDate;

import spike.fatbook.backend.enums.GiornoSettimana;

public record DashboardSostituzioneDTO(
    LocalDate data,
    GiornoSettimana giorno,
    int ora,
    String classeNome,
    String materia,
    String aula,
    String docenteAssenteNome,
    String docenteAssenteCognome
) {}

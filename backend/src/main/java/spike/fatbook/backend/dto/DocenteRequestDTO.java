package spike.fatbook.backend.dto;

import java.util.List;

public record DocenteRequestDTO (
    String nome,
    String cognome,
    String email,
    boolean laboratorio,

    // Il frontend ci manderà solo una lista di numeri (gli ID delle materie)
    // Es: [1, 4, 5] per Matematica, Fisica e Informatica
    List<Long> materieIds
) {}
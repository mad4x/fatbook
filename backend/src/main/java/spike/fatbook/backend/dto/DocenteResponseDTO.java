package spike.fatbook.backend.dto;

import java.util.List;

public record DocenteResponseDTO (
    Long id,
    String nome,
    String cognome,
    String email,
    boolean laboratorio,
    List<String> materie // Al frontend passiamo solo una lista di nomi (es. ["Matematica", "Fisica"])
) {}
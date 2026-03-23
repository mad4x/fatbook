package spike.fatbook.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class DocenteResponseDTO {
    private Long id;
    private String nome;
    private String cognome;
    private String email;
    private boolean laboratorio;
    private List<String> materie; // Al frontend passiamo solo una lista di nomi (es. ["Matematica", "Fisica"])
}
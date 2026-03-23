package spike.fatbook.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class DocenteRequestDTO {

    private String nome;
    private String cognome;
    private String email;
    private boolean laboratorio;

    // Il frontend ci manderà solo una lista di numeri (gli ID delle materie)
    // Es: [1, 4, 5] per Matematica, Fisica e Informatica
    private List<Long> materieIds;
}
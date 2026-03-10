package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.*;
import spike.fatbook.backend.enums.GiornoSettimana;
import spike.fatbook.backend.enums.VersioneOrario;

@Entity
@Table(name = "ora_canonica")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OraCanonica {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Enumerated(EnumType.STRING)
    private GiornoSettimana giorno;

    @Setter
    private int numeroOra;

    @Setter
    private String materia;

    @Setter
    @Enumerated(EnumType.STRING)
    private VersioneOrario versione;

    @Setter
    @ManyToOne
    private Classe classe;

    @Setter
    @ManyToOne
    private Aula aula;

    @Setter
    @ManyToOne
    private Docente docenteTeoria;

    @Setter
    @ManyToOne
    private Docente docenteLaboratorio; // Può essere null se non c'è laboratorio

    @Setter
    private boolean Alternativa = false; // true se è l'ora per chi non fa religione
}
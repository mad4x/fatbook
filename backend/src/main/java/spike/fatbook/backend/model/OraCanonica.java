package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import spike.fatbook.backend.enums.GiornoSettimana;
import spike.fatbook.backend.enums.VersioneOrario;

@Entity
@Table(name = "ore_canoniche")
@Getter 
@Setter 
@NoArgsConstructor
public class OraCanonica {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int numeroOra; // 1 = 08:30-09:20, 2 = 09:20-10:10, ecc.
    private String materia; // Es: "Informatica"

    @Enumerated(EnumType.STRING)
    private GiornoSettimana giorno;

    @Enumerated(EnumType.STRING)
    private VersioneOrario versione;

    @ManyToOne
    @JoinColumn(name = "classe_id")
    private Classe classe;

    @ManyToOne
    @JoinColumn(name = "docente_id")
    private Docente docente;

    @ManyToOne
    @JoinColumn(name = "aula_id")
    private Aula aula;
}
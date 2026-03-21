package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

import spike.fatbook.backend.enums.GiornoSettimana;
import spike.fatbook.backend.enums.StatoOra;

@Entity
@Table(name = "ora_materializzata")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class OraMaterializzata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private LocalDate data;
    private int numeroOra;

    @Enumerated(EnumType.STRING)
    private StatoOra stato;

    // opzionale: riferimento alla versione canonica (ora che era prevista)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ora_canonica_id")
    private OraCanonica oraCanonica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aula_id")
    private Aula aula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classe_id")
    private Classe classe;
}